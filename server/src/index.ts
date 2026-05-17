import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import pkg from '@prisma/client';
const { PrismaClient } = pkg;
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'secret';

// --- Notification Services ---
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.ethereal.email',
  port: parseInt(process.env.SMTP_PORT || '587'),
  auth: {
    user: process.env.SMTP_USER || 'mock_user',
    pass: process.env.SMTP_PASS || 'mock_pass',
  },
});

async function sendSMS(phoneNumber: string, message: string) {
  // In a real application, you would integrate with a provider like Twilio, Vonage, or AWS SNS.
  // For this prototype, we'll log the SMS to the console and simulate a carrier delay.
  console.log(`\n[SMS GATEWAY] To: ${phoneNumber}\n[MESSAGE] ${message}\n`);
  
  // Simulation of industry-standard reliability check
  return { success: true, messageId: `msg_${Math.random().toString(36).substr(2, 9)}` };
}

async function sendWelcomeEmail(email: string, name: string) {
  const isPlaceholder = !process.env.SMTP_USER || 
                        process.env.SMTP_USER === "your-email@gmail.com" || 
                        process.env.SMTP_USER === "mock_user";

  const sendMock = async () => {
    const testAccount = await nodemailer.createTestAccount();
    const testTransporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });

    const info = await testTransporter.sendMail({
      from: '"SmartQueue Onboarding" <welcome@smartqueue.com>',
      to: email,
      subject: "Welcome to SmartQueue!",
      text: `Hi ${name || 'there'}, welcome to SmartQueue! Your account has been successfully verified.`,
      html: `<h1>Welcome to SmartQueue, ${name || 'User'}!</h1><p>Your account has been successfully verified and you're ready to start queueing smarter.</p>`,
    });

    console.log("Welcome Message sent: %s", info.messageId);
    console.log("Welcome Preview URL: %s", nodemailer.getTestMessageUrl(info));
  };

  if (isPlaceholder) {
    await sendMock();
    return;
  }

  try {
    await transporter.sendMail({
      from: '"SmartQueue Onboarding" <welcome@smartqueue.com>',
      to: email,
      subject: "Welcome to SmartQueue!",
      text: `Hi ${name || 'there'}, welcome to SmartQueue! Your account has been successfully verified.`,
      html: `<h1>Welcome to SmartQueue, ${name || 'User'}!</h1><p>Your account has been successfully verified and you're ready to start queueing smarter.</p>`,
    });
  } catch (error: any) {
    console.error('Welcome SMTP Error (falling back to mock):', error.message);
    await sendMock();
  }
}

interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.status(403).json({ error: 'Forbidden' });
    req.user = user;
    next();
  });
};

const authorizeRole = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    next();
  };
};

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// --- AI Prediction Logic ---
// Wait Time = (Number of people ahead) * (Average Service Time)

async function getPredictedWaitTime(serviceId: string) {
  const metric = await prisma.waitTimeMetric.findUnique({
    where: { serviceId },
  });

  const waitingTokens = await prisma.token.count({
    where: {
      serviceId,
      status: 'waiting',
    },
  });

  const avgTime = metric?.averageServiceTime || 300; // default 5 mins
  return Math.round(waitingTokens * avgTime);
}

async function updateAverageServiceTime(serviceId: string, actualTimeInSeconds: number) {
  const metric = await prisma.waitTimeMetric.findUnique({
    where: { serviceId },
  });

  if (!metric) return;

  const alpha = 0.2; // Smoothing factor
  const newAvg = (alpha * actualTimeInSeconds) + (1 - alpha) * metric.averageServiceTime;

  await prisma.waitTimeMetric.update({
    where: { serviceId },
    data: {
      averageServiceTime: newAvg,
      totalTokensServed: { increment: 1 },
      lastUpdatedAt: new Date(),
    },
  });
}

// --- API Endpoints ---

// Auth Endpoints
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || 'user',
      },
    });

    // Send Welcome Email
    await sendWelcomeEmail(email, name);

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create user. Email might already exist.' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(`[AUTH] Login attempt for: ${email}`);
    
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      console.warn(`[AUTH] Login failed: User not found (${email})`);
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.warn(`[AUTH] Login failed: Incorrect password for ${email}`);
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    console.log(`[AUTH] Login successful for: ${email} (Role: ${user.role})`);
    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    console.error('[AUTH] Critical login error:', error);
    res.status(500).json({ error: 'Login failed due to server error' });
  }
});

// Get all services
app.get('/api/services', async (req, res) => {
  try {
    const services = await prisma.service.findMany({
      include: {
        _count: {
          select: { tokens: { where: { status: 'waiting' } } },
        },
      },
    });
    
    // Attach predicted wait time for each service
    const servicesWithWait = await Promise.all(services.map(async (s) => ({
      ...s,
      predictedWaitTime: await getPredictedWaitTime(s.id),
    })));

    res.json(servicesWithWait);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch services' });
  }
});

// Generate a new token
app.post('/api/tokens', async (req, res) => {
  try {
    const { serviceId, phoneNumber: guestPhone } = req.body;
    const authHeader = req.headers['authorization'];
    const authToken = authHeader && authHeader.split(' ')[1];
    
    let userId = null;
    let userPhone = null;

    if (authToken) {
      try {
        const decoded = jwt.verify(authToken, JWT_SECRET) as { id: string };
        userId = decoded.id;
        const user = await prisma.user.findUnique({ where: { id: userId } });
        userPhone = user?.phoneNumber;
      } catch (err) {
        // Token invalid
      }
    }

    const finalPhone = guestPhone || userPhone;

    const lastToken = await prisma.token.findFirst({
      where: { serviceId },
      orderBy: { number: 'desc' },
    });

    const nextNumber = (lastToken?.number || 0) + 1;

    const token = await prisma.token.create({
      data: {
        number: nextNumber,
        serviceId,
        userId,
        phoneNumber: finalPhone,
        status: 'waiting',
      },
      include: {
        service: true,
      },
    });

    const waitTime = await getPredictedWaitTime(serviceId);

    // Live SMS Update: Initial Confirmation
    if (finalPhone) {
      const waitMinutes = Math.round(waitTime / 60);
      await sendSMS(
        finalPhone, 
        `SmartQueue: Token #${nextNumber} confirmed for ${token.service.name}. Est. wait: ${waitMinutes} mins. Track here: http://localhost:5173/token/${token.id}`
      );
    }

    // Notify all clients about the new token
    io.emit('queueUpdate', { serviceId });

    res.json({ ...token, predictedWaitTime: waitTime });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate token' });
  }
});

// Get user's active tokens
app.get('/api/tokens/my', authenticateToken, async (req, res) => {
  try {
    const tokens = await prisma.token.findMany({
      where: { 
        userId: req.user?.id,
        status: { in: ['waiting', 'serving'] }
      },
      include: {
        service: true,
      },
      orderBy: { createdAt: 'desc' }
    });

    // Attach predicted wait time for each token
    const tokensWithWait = await Promise.all(tokens.map(async (t) => {
      const peopleAhead = await prisma.token.count({
        where: {
          serviceId: t.serviceId,
          status: 'waiting',
          createdAt: { lt: t.createdAt },
        },
      });

      const avgMetric = await prisma.waitTimeMetric.findUnique({
        where: { serviceId: t.serviceId },
      });

      const waitTime = peopleAhead * (avgMetric?.averageServiceTime || 300);
      
      return {
        ...t,
        predictedWaitTime: Math.round(waitTime / 60) // in minutes
      };
    }));

    res.json(tokensWithWait);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch your tokens' });
  }
});

// Get token details (for tracking)
app.get('/api/tokens/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const token = await prisma.token.findUnique({
      where: { id },
      include: { service: true, counter: true },
    });

    if (!token) return res.status(404).json({ error: 'Token not found' });

    // Calculate position in queue
    const peopleAhead = await prisma.token.count({
      where: {
        serviceId: token.serviceId,
        status: 'waiting',
        createdAt: { lt: token.createdAt },
      },
    });

    const avgMetric = await prisma.waitTimeMetric.findUnique({
      where: { serviceId: token.serviceId },
    });

    const waitTime = peopleAhead * (avgMetric?.averageServiceTime || 300);

    res.json({ ...token, peopleAhead, predictedWaitTime: Math.round(waitTime) });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch token details' });
  }
});

// Admin/Staff: Get tokens for a specific counter/service
app.get('/api/counters/:id/status', authenticateToken, authorizeRole(['admin', 'staff']), async (req, res) => {
  try {
    const { id } = req.params;
    const counter = await prisma.counter.findUnique({
      where: { id },
      include: { service: true },
    });

    if (!counter) return res.status(404).json({ error: 'Counter not found' });

    const currentToken = await prisma.token.findFirst({
      where: { counterId: id, status: 'serving' },
    });

    const nextToken = await prisma.token.findFirst({
      where: { serviceId: counter.serviceId, status: 'waiting' },
      orderBy: { createdAt: 'asc' },
    });

    // Fetch counter-specific stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const servedToday = await prisma.token.count({
      where: {
        counterId: id,
        status: 'served',
        servedAt: { gte: today }
      }
    });

    const serviceMetric = await prisma.waitTimeMetric.findUnique({
      where: { serviceId: counter.serviceId }
    });

    res.json({ 
      counter, 
      currentToken, 
      nextToken, 
      stats: {
        servedToday,
        avgServiceTime: Math.round((serviceMetric?.averageServiceTime || 300) / 60) // in minutes
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch counter status' });
  }
});

// Admin: Get all users
app.get('/api/users', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        profileImage: true,
        phoneNumber: true,
        createdAt: true
      }
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Update profile
app.put('/api/users/profile', authenticateToken, async (req, res) => {
  try {
    const { name, phoneNumber, profileImage } = req.body;
    const updatedUser = await prisma.user.update({
      where: { id: req.user?.id },
      data: { name, phoneNumber, profileImage },
    });
    
    res.json({ 
      id: updatedUser.id, 
      name: updatedUser.name, 
      email: updatedUser.email, 
      role: updatedUser.role,
      profileImage: updatedUser.profileImage,
      phoneNumber: updatedUser.phoneNumber
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Admin: Remove a user
app.delete('/api/users/:id', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent self-deletion
    if (id === req.user?.id) {
      return res.status(400).json({ error: 'Cannot delete your own admin account.' });
    }

    await prisma.user.delete({
      where: { id }
    });
    res.json({ message: 'User removed successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to remove user' });
  }
});

// Admin: Add a new service
app.post('/api/services', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    const { name, description } = req.body;
    const service = await prisma.service.create({
      data: { name, description }
    });

    // Create initial wait time metric for the new service
    await prisma.waitTimeMetric.create({
      data: {
        serviceId: service.id,
        averageServiceTime: 300,
        totalTokensServed: 0
      }
    });

    res.json(service);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create service' });
  }
});

// Admin: Add a new counter
app.post('/api/counters', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    const { name, serviceId } = req.body;
    const counter = await prisma.counter.create({
      data: { name, serviceId }
    });
    res.json(counter);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create counter' });
  }
});

// Admin/Staff: Get analytics
app.get('/api/analytics', authenticateToken, authorizeRole(['admin', 'staff']), async (req, res) => {
  try {
    const totalTokens = await prisma.token.count();
    const servedTokens = await prisma.token.count({ where: { status: 'served' } });
    const noShowTokens = await prisma.token.count({ where: { status: 'no-show' } });
    
    const waitMetrics = await prisma.waitTimeMetric.findMany({
      include: { service: true }
    });

    // Get average wait time across all services
    const avgWaitTime = waitMetrics.reduce((acc, curr) => acc + curr.averageServiceTime, 0) / (waitMetrics.length || 1);

    res.json({
      totalTokens,
      servedTokens,
      noShowTokens,
      avgWaitTime: Math.round(avgWaitTime),
      serviceMetrics: waitMetrics
    });
  } catch (error) {
    console.error('Analytics Error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Admin/Staff: Get all counters with current status
app.get('/api/counters', authenticateToken, authorizeRole(['admin', 'staff']), async (req, res) => {
  try {
    const counters = await prisma.counter.findMany({
      include: { 
        service: true,
        tokens: {
          where: { status: 'serving' },
          take: 1,
          orderBy: { calledAt: 'desc' }
        }
      },
    });

    // Flatten the current token for easier consumption
    const countersWithStatus = counters.map(c => ({
      ...c,
      currentToken: c.tokens[0] || null,
      tokens: undefined // Remove the array to keep payload clean
    }));

    res.json(countersWithStatus);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch counters' });
  }
});

// Admin/Staff: Call next token
app.post('/api/counters/:id/call-next', authenticateToken, authorizeRole(['admin', 'staff']), async (req, res) => {
  try {
    const { id } = req.params;

    const counter = await prisma.counter.findUnique({
      where: { id },
    });

    if (!counter) return res.status(404).json({ error: 'Counter not found' });

    // Check if already serving
    const serving = await prisma.token.findFirst({
      where: { counterId: id, status: 'serving' },
    });

    if (serving) return res.status(400).json({ error: 'Already serving a customer. Complete them first.' });

    const nextToken = await prisma.token.findFirst({
      where: { serviceId: counter.serviceId, status: 'waiting' },
      orderBy: { createdAt: 'asc' },
    });

    if (!nextToken) return res.status(404).json({ error: 'No customers waiting' });

    const updatedToken = await prisma.token.update({
      where: { id: nextToken.id },
      data: {
        status: 'serving',
        counterId: id,
        calledAt: new Date(),
      },
      include: {
        service: true
      }
    });

    // Live SMS Update: It's your turn!
    if (updatedToken.phoneNumber) {
      await sendSMS(
        updatedToken.phoneNumber, 
        `SmartQueue Alert: It's your turn! Token #${updatedToken.number}, please proceed to ${counter.name}.`
      );
    }

    io.emit('tokenCalled', { ...updatedToken, counterName: counter.name });
    io.emit('queueUpdate', { serviceId: counter.serviceId });

    res.json(updatedToken);
  } catch (error) {
    res.status(500).json({ error: 'Failed to call next token' });
  }
});

// Admin/Staff: Mark as served
app.post('/api/tokens/:id/served', authenticateToken, authorizeRole(['admin', 'staff']), async (req, res) => {
  try {
    const { id } = req.params;

    const token = await prisma.token.findUnique({
      where: { id },
    });

    if (!token || token.status !== 'serving') return res.status(400).json({ error: 'Token is not being served' });

    const now = new Date();
    const serviceTimeSeconds = (now.getTime() - (token.calledAt?.getTime() || token.createdAt.getTime())) / 1000;

    const updatedToken = await prisma.token.update({
      where: { id },
      data: {
        status: 'served',
        servedAt: now,
      },
    });

    // Update AI metrics
    await updateAverageServiceTime(token.serviceId, serviceTimeSeconds);

    io.emit('tokenServed', updatedToken);
    io.emit('queueUpdate', { serviceId: token.serviceId });

    res.json(updatedToken);
  } catch (error) {
    res.status(500).json({ error: 'Failed to mark token as served' });
  }
});

// Admin/Staff: Mark as no-show
app.post('/api/tokens/:id/no-show', authenticateToken, authorizeRole(['admin', 'staff']), async (req, res) => {
  try {
    const { id } = req.params;

    const updatedToken = await prisma.token.update({
      where: { id },
      data: {
        status: 'no-show',
      },
    });

    io.emit('tokenNoShow', updatedToken);
    io.emit('queueUpdate', { serviceId: updatedToken.serviceId });

    res.json(updatedToken);
  } catch (error) {
    res.status(500).json({ error: 'Failed to mark token as no-show' });
  }
});

// --- Socket.io ---
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// --- Auto-Seeding ---
async function seedAdmin() {
  try {
    const adminEmail = 'prince54918@gmail.com';
    const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });
    
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash('Abhay@00', 10);
      await prisma.user.create({
        data: {
          name: 'Abhay Bhadwal',
          email: adminEmail,
          password: hashedPassword,
          role: 'admin',
        },
      });
      console.log('✅ Default admin user created: prince54918@gmail.com');
    }
  } catch (error) {
    console.error('❌ Failed to seed admin user:', error);
  }
}

httpServer.listen(PORT, async () => {
  await seedAdmin();
  console.log(`Server running on port ${PORT}`);
});

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create initial admin user
  const adminEmail = 'prince54918@gmail.com';
  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!existingAdmin) {
    const bcrypt = await import('bcryptjs');
    const hashedPassword = await bcrypt.default.hash('Abhay@00', 10);
    await prisma.user.create({
      data: {
        name: 'Abhay Bhadwal',
        email: adminEmail,
        password: hashedPassword,
        role: 'admin',
      },
    });
    console.log('Admin user created: prince54918@gmail.com / Abhay@00');
  }

  const services = [
    { name: 'General Inquiries', description: 'For all general questions and information' },
    { name: 'Account Management', description: 'Help with your account and settings' },
    { name: 'Technical Support', description: 'Technical assistance and troubleshooting' },
    { name: 'Billing & Payments', description: 'Assistance with invoices and payments' },
  ];

  const existingServices = await prisma.service.count();
  if (existingServices > 0) {
    console.log('Database already has services. Skipping service seed.');
  } else {
    for (const s of services) {
      const service = await prisma.service.create({
        data: s,
      });

      // Create 2 counters for each service
      for (let i = 1; i <= 2; i++) {
        await prisma.counter.create({
          data: {
            name: `${service.name} - Counter ${i}`,
            serviceId: service.id,
          },
        });
      }

      // Create initial wait time metric
      await prisma.waitTimeMetric.upsert({
        where: { serviceId: service.id },
        update: {},
        create: {
          serviceId: service.id,
          averageServiceTime: 300, // 5 minutes default
          totalTokensServed: 0,
        },
      });
    }
    console.log('Service seeding complete.');
  }

  console.log('Seeding complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

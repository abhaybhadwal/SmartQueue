# 🚀 SmartQueue: Industry-Level Digital Queueing Solution

SmartQueue is a modern, full-stack digital queue management platform designed to eliminate physical wait times. It features an industry-standard UI, real-time updates via Socket.io, and a robust operational portal for staff and administrators.

![SmartQueue Preview](https://images.unsplash.com/photo-1556742044-3c52d6e88c62?auto=format&fit=crop&q=80&w=1200)

## ✨ Key Features

### 💎 Industry-Standard UX/UI
- **Glassmorphism Design:** A sleek, futuristic aesthetic using blurred backgrounds and vibrant gradients.
- **Professional Feedback:** Integrated `react-hot-toast` for real-time, non-intrusive notifications.
- **Custom Modals:** Replaced native browser dialogs with styled, secure confirmation modals.
- **Skeleton Loaders:** Professional perceived performance during data fetching.

### 🌓 Multi-Theme Support
- **Dynamic Themes:** Toggle instantly between high-tech **Dark Mode** and clean, professional **Light Mode**.
- **Persistence:** User theme preferences are automatically saved to `localStorage`.

### 📱 Live SMS Updates
- **Real-time Notifications:** Clients receive SMS alerts for token confirmation and when it's their turn to proceed.
- **Guest Support:** Users can opt-in for SMS updates without creating an account.

### 🔐 Multi-Role Access
- **Member Portal:** Track personal tokens and manage profile settings.
- **Staff Portal:** Operational station control, counter management, and live session handling.
- **Admin Console:** Full system configuration, user management, and service health analytics.

### ⚡ Real-Time Infrastructure
- **Live Sync:** Powered by Socket.io for instant queue status updates across all clients.
- **Operational stations:** Searchable grid of counters with live active/idle status.

---

## 🛠️ Technical Stack

- **Frontend:** React (TypeScript), Vite, Lucide Icons, React-Hot-Toast.
- **Backend:** Node.js, Express, Socket.io, JWT Authentication.
- **Database:** Prisma ORM, SQLite.
- **Communication:** NodeMailer (Email), Simulated SMS Gateway.

---

## ⚙️ Setup & Installation

### Prerequisites
- Node.js (v18+)
- npm or yarn

### 1. Clone the repository
```bash
git clone https://github.com/abhaybhadwal/SmartQueue.git
cd SmartQueue
```

### 2. Configure Backend
```bash
cd server
npm install
```
Create a `.env` file in the `server` directory:
```env
DATABASE_URL="file:./dev.db"
PORT=3001
JWT_SECRET="your-super-secret-key"

# Optional SMTP for emails
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
```
Initialize the database:
```bash
npx prisma migrate dev
npx prisma db seed
```

### 3. Configure Frontend
```bash
cd ../client
npm install
```

### 4. Run the Project
**Start Backend (from /server):**
```bash
npm run dev
```
**Start Frontend (from /client):**
```bash
npm run dev
```

---

## 👨‍💻 Author
**Abhay Bhadwal**  
[GitHub Profile](https://github.com/abhaybhadwal)

## 📄 License
This project is licensed under the MIT License.

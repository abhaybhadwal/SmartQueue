#!/bin/bash

# --- SmartQueue AWS EC2 Deployment Script ---
# This script automates the installation and configuration of the full stack.

echo "🚀 Initializing SmartQueue Server Setup..."

# 1. Update System
sudo apt update && sudo apt upgrade -y

# 2. Install Node.js (v20)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# 3. Install Nginx
sudo apt install -y nginx

# 4. Install PM2 and TypeScript tools
sudo npm install -g pm2 ts-node typescript

# 5. Define App Directory (Assuming it's cloned to ~/SmartQueue)
APP_DIR="$HOME/SmartQueue"

# 6. Configure Nginx Reverse Proxy
# This config serves the frontend from 'client/dist' and proxies '/api' and '/socket.io' to the backend.
cat <<EOF | sudo tee /etc/nginx/sites-available/smartqueue
server {
    listen 80;
    server_name _; # Accepts all traffic

    # Frontend - Serve static files
    location / {
        root $APP_DIR/client/dist;
        index index.html;
        try_files \$uri \$uri/ /index.html;
    }

    # Backend API Proxy
    location /api/ {
        proxy_pass http://localhost:3001/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }

    # Socket.io Proxy
    location /socket.io/ {
        proxy_pass http://localhost:3001/socket.io/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host \$host;
    }
}
EOF

# 7. Enable Config and Restart Nginx
sudo ln -s /etc/nginx/sites-available/smartqueue /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo systemctl restart nginx

echo "✅ System environment and Nginx prepared."
echo "👉 Next steps:"
echo "1. Clone your repo: git clone https://github.com/abhaybhadwal/SmartQueue.git"
echo "2. cd SmartQueue"
echo "3. cd server && npm install && npx prisma generate"
echo "4. Create .env file in server/ with your DATABASE_URL and JWT_SECRET"
echo "5. Start backend: pm2 start src/index.ts --name smartqueue-api --interpreter ts-node-esm"
echo "6. cd ../client && npm install && npm run build"
echo "7. Done! Visit your EC2 Public IP in your browser."

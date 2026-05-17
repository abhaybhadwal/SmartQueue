#!/bin/bash

# --- SmartQueue AWS EC2 Setup Script ---
# This script automates the installation of Node.js, Nginx, and PM2
# and configures the environment for the SmartQueue backend.

echo "🚀 Initializing SmartQueue Server Setup..."

# 1. Update System
sudo apt update && sudo apt upgrade -y

# 2. Install Node.js (v20)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# 3. Install Nginx
sudo apt install -y nginx

# 4. Install PM2 (Process Manager)
sudo npm install -g pm2

# 5. Configure Nginx Reverse Proxy
cat <<EOF | sudo tee /etc/nginx/sites-available/smartqueue
server {
    listen 80;
    server_name \$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4);

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }

    location /socket.io/ {
        proxy_pass http://localhost:3001/socket.io/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host \$host;
    }
}
EOF

# 6. Enable Config and Restart Nginx
sudo ln -s /etc/nginx/sites-available/smartqueue /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo systemctl restart nginx

echo "✅ System environment prepared."
echo "👉 Next steps:"
echo "1. Clone your repo: git clone https://github.com/abhaybhadwal/SmartQueue.git"
echo "2. cd SmartQueue/server && npm install"
echo "3. Create .env file with your MongoDB Atlas URL"
echo "4. Start backend: pm2 start src/index.ts --name smartqueue-api"

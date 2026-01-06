# Leo Prime Firewall - VPS Deployment Guide

## Server Details
- **VPS IP**:
- **Domain**: login.leoprime.in
- **SSH User**: root

## Quick Deployment Steps

### 1. Connect to VPS
```bash

```

### 2. Run the deployment script
```bash
# Download and run the deployment script
curl -o deploy.sh https://raw.githubusercontent.com/Abhinav-Anant/newserver/main/deploy.sh
chmod +x deploy.sh
./deploy.sh
```

## Manual Deployment Steps (if script fails)

### Step 1: Install Prerequisites
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2 globally
sudo npm install -g pm2

# Install Nginx
sudo apt install -y nginx

# Install Git (if not already installed)
sudo apt install -y git
```

### Step 2: Clone/Update Repository
```bash
# Navigate to deployment directory
cd /var/www

# If first time deployment
git clone https://github.com/Abhinav-Anant/newserver.git leo-prime-firewall
cd leo-prime-firewall/nextjs_space

# If updating existing deployment
# cd /var/www/leo-prime-firewall
# git pull origin main
# cd nextjs_space
```

### Step 3: Install Dependencies and Build
```bash
# Install dependencies
npm install --legacy-peer-deps

# Create .env file
cat > .env << 'EOF'
NEXTDNS_API_KEY=69119442b36df27e156bbe25988ab21b33f2a3cf
NEXTAUTH_SECRET=generated-secret-key-change-in-production
NEXTAUTH_URL=https://login.leoprime.in
EOF

# Build the application
npm run build
```

### Step 4: Configure PM2
```bash
# Create PM2 ecosystem file
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'leo-prime-firewall',
    script: './node_modules/.bin/next',
    args: 'start',
    cwd: '/var/www/leo-prime-firewall/nextjs_space',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
}
EOF

# Stop existing PM2 process (if any)
pm2 delete leo-prime-firewall 2>/dev/null || true

# Start application with PM2
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
# Run the command that PM2 outputs

# Check status
pm2 status
pm2 logs leo-prime-firewall --lines 50
```

### Step 5: Configure Nginx
```bash
# Create Nginx configuration
sudo tee /etc/nginx/sites-available/leo-prime-firewall << 'EOF'
server {
    listen 80;
    listen [::]:80;
    server_name login.leoprime.in;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

# Enable site
sudo ln -sf /etc/nginx/sites-available/leo-prime-firewall /etc/nginx/sites-enabled/

# Remove default site if exists
sudo rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

### Step 6: Install SSL Certificate
```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d login.leoprime.in --non-interactive --agree-tos --email admin@leoprime.in

# Certbot will automatically configure Nginx for HTTPS

# Test auto-renewal
sudo certbot renew --dry-run
```

### Step 7: Configure Firewall
```bash
# Allow SSH, HTTP, and HTTPS
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw --force enable
sudo ufw status
```

## Verification

### Check Services
```bash
# Check PM2 status
pm2 status
pm2 logs leo-prime-firewall --lines 20

# Check Nginx status
sudo systemctl status nginx

# Check if app is running on port 3000
curl http://localhost:3000

# Check if Nginx is proxying correctly
curl http://login.leoprime.in

# Check HTTPS
curl https://login.leoprime.in
```

### Test the Application
1. Open browser: https://login.leoprime.in
2. Enter test Profile ID: `984e22`
3. Verify dashboard loads with analytics

## Troubleshooting

### App not starting
```bash
# Check PM2 logs
pm2 logs leo-prime-firewall --lines 50

# Check if port 3000 is in use
sudo lsof -i :3000

# Restart PM2
pm2 restart leo-prime-firewall
```

### 502 Bad Gateway
```bash
# Check if app is running
pm2 status

# Check Nginx error logs
sudo tail -f /var/log/nginx/error.log

# Restart both services
pm2 restart leo-prime-firewall
sudo systemctl restart nginx
```

### SSL Issues
```bash
# Check certificate status
sudo certbot certificates

# Renew certificate
sudo certbot renew
```

## Updates and Maintenance

### Deploy New Changes
```bash
cd /var/www/leo-prime-firewall
git pull origin main
cd nextjs_space
npm install --legacy-peer-deps
npm run build
pm2 restart leo-prime-firewall
```

### View Logs
```bash
# PM2 logs
pm2 logs leo-prime-firewall

# Nginx access logs
sudo tail -f /var/log/nginx/access.log

# Nginx error logs
sudo tail -f /var/log/nginx/error.log
```

### Backup
```bash
# Backup application
sudo tar -czf leo-prime-backup-$(date +%Y%m%d).tar.gz /var/www/leo-prime-firewall

# Backup Nginx config
sudo cp /etc/nginx/sites-available/leo-prime-firewall /root/nginx-backup.conf
```

## Contact
For issues or questions, refer to the GitHub repository: https://github.com/Abhinav-Anant/newserver

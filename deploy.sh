#!/bin/bash

# Leo Prime Firewall - Automated Deployment Script
# 
# Usage: sudo ./deploy.sh
# This script will deploy the application to the current VPS

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
DEPLOYMENT_DIR="/var/www"
APP_NAME="leo-prime-firewall"
APP_DIR="${DEPLOYMENT_DIR}/${APP_NAME}"
NEXTJS_DIR="${APP_DIR}/nextjs_space"
REPO_URL="https://github.com/Abhinav-Anant/newserver.git"

# Error handler
error_exit() {
    print_error "$1"
    exit 1
}

# Trap errors
trap 'error_exit "Deployment failed at line $LINENO"' ERR

echo -e "${GREEN}======================================${NC}"
echo -e "${GREEN}Leo Prime Firewall Deployment Script${NC}"
echo -e "${GREEN}======================================${NC}"
echo ""

# Function to print status
print_status() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    error_exit "Please run as root (use sudo or login as root)"
fi

print_status "Running as root"

# Step 1: Install Prerequisites
echo -e "\n${YELLOW}Step 1: Installing Prerequisites${NC}"

apt update && apt upgrade -y || error_exit "Failed to update system packages"
print_status "System updated"

# Install Node.js 18.x if not installed
if ! command -v node &> /dev/null; then
    print_warning "Node.js not found, installing..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash - || error_exit "Failed to add Node.js repository"
    apt install -y nodejs || error_exit "Failed to install Node.js"
    print_status "Node.js installed: $(node -v)"
else
    print_status "Node.js already installed: $(node -v)"
fi

# Install PM2 if not installed
if ! command -v pm2 &> /dev/null; then
    print_warning "PM2 not found, installing..."
    npm install -g pm2 || error_exit "Failed to install PM2"
    print_status "PM2 installed"
else
    print_status "PM2 already installed"
fi

# Install Nginx if not installed
if ! command -v nginx &> /dev/null; then
    print_warning "Nginx not found, installing..."
    apt install -y nginx || error_exit "Failed to install Nginx"
    print_status "Nginx installed"
else
    print_status "Nginx already installed"
fi

# Install Git if not installed
if ! command -v git &> /dev/null; then
    apt install -y git || error_exit "Failed to install Git"
    print_status "Git installed"
fi

# Step 2: Clone/Update Repository
echo -e "\n${YELLOW}Step 2: Setting up Repository${NC}"

DEPLOY_DIR="/var/www/leo-prime-firewall"

if [ -d "$DEPLOY_DIR" ]; then
    print_warning "Directory exists, updating..."
    cd $DEPLOY_DIR
    git pull origin main
    print_status "Repository updated"
else
    print_warning "Cloning repository..."
    mkdir -p /var/www
    cd /var/www
    git clone https://github.com/Abhinav-Anant/newserver.git leo-prime-firewall
    print_status "Repository cloned"
fi

cd $DEPLOY_DIR/nextjs_space

# Step 3: Install Dependencies and Build
echo -e "\n${YELLOW}Step 3: Installing Dependencies and Building${NC}"

print_warning "Installing dependencies (this may take a few minutes)..."
npm install --legacy-peer-deps
print_status "Dependencies installed"

# Create .env file
print_warning "Creating .env file..."
cat > .env << 'EOF'
NEXTDNS_API_KEY=69119442b36df27e156bbe25988ab21b33f2a3cf
NEXTAUTH_SECRET=your-secret-key-change-in-production-$(openssl rand -base64 32)
NEXTAUTH_URL=https://login.leoprime.in
EOF
print_status ".env file created"

print_warning "Building application (this may take a few minutes)..."
npm run build
print_status "Application built successfully"

# Step 4: Configure PM2
echo -e "\n${YELLOW}Step 4: Configuring PM2${NC}"

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
print_status "PM2 configuration created"

# Stop existing process
pm2 delete leo-prime-firewall 2>/dev/null || true
print_status "Stopped old PM2 process (if any)"

# Start application
pm2 start ecosystem.config.js
print_status "Application started with PM2"

pm2 save
pm2 startup | tail -n 1 | bash
print_status "PM2 configured to start on boot"

# Step 5: Configure Nginx
echo -e "\n${YELLOW}Step 5: Configuring Nginx${NC}"

tee /etc/nginx/sites-available/leo-prime-firewall > /dev/null << 'EOF'
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
print_status "Nginx configuration created"

ln -sf /etc/nginx/sites-available/leo-prime-firewall /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
print_status "Nginx site enabled"

nginx -t
print_status "Nginx configuration is valid"

systemctl restart nginx
print_status "Nginx restarted"

# Step 6: Install SSL Certificate
echo -e "\n${YELLOW}Step 6: Installing SSL Certificate${NC}"

if ! command -v certbot &> /dev/null; then
    print_warning "Installing Certbot..."
    apt install -y certbot python3-certbot-nginx
    print_status "Certbot installed"
fi

print_warning "Obtaining SSL certificate..."
if certbot --nginx -d login.leoprime.in --non-interactive --agree-tos --email admin@leoprime.in --redirect; then
    print_status "SSL certificate installed successfully"
else
    print_error "SSL certificate installation failed (you may need to configure it manually)"
fi

# Step 7: Configure Firewall
echo -e "\n${YELLOW}Step 7: Configuring Firewall${NC}"

if command -v ufw &> /dev/null; then
    ufw allow OpenSSH
    ufw allow 'Nginx Full'
    ufw --force enable
    print_status "Firewall configured"
else
    print_warning "UFW not found, skipping firewall configuration"
fi

# Final Status Check
echo -e "\n${YELLOW}======================================${NC}"
echo -e "${GREEN}Deployment Complete!${NC}"
echo -e "${YELLOW}======================================${NC}"
echo ""

print_status "Application Status:"
pm2 status

echo -e "\n${GREEN}Your application should now be accessible at:${NC}"
echo -e "  • HTTP:  http://login.leoprime.in"
echo -e "  • HTTPS: https://login.leoprime.in"
echo ""
echo -e "${YELLOW}Useful Commands:${NC}"
echo -e "  • View logs:     pm2 logs leo-prime-firewall"
echo -e "  • Restart app:   pm2 restart leo-prime-firewall"
echo -e "  • Stop app:      pm2 stop leo-prime-firewall"
echo -e "  • PM2 status:    pm2 status"
echo -e "  • Nginx status:  systemctl status nginx"
echo ""
echo -e "${GREEN}Test Profile ID: 984e22${NC}"
echo ""

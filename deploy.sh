#!/bin/bash

# Leo Prime Firewall - Automated Deployment Script
# 
# Usage: sudo ./deploy.sh
# This script will deploy the application to the current VPS

set -euo pipefail

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
if [ "${EUID:-$(id -u)}" -ne 0 ]; then 
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

if [ -d "${APP_DIR}" ]; then
    print_warning "Directory exists, updating..."
    cd "${APP_DIR}" || error_exit "Failed to cd into ${APP_DIR}"
    git pull origin main || error_exit "Failed to pull latest changes"
else
    cd "${DEPLOYMENT_DIR}" || error_exit "Failed to cd into ${DEPLOYMENT_DIR}"
    git clone "${REPO_URL}" "${APP_NAME}" || error_exit "Failed to clone repository"
    print_status "Repository cloned"
fi

# Ensure NEXTJS_DIR exists
if [ ! -d "${NEXTJS_DIR}" ]; then
    error_exit "Expected Next.js app directory not found: ${NEXTJS_DIR}"
fi

cd "${NEXTJS_DIR}"

# Step 3: Install Dependencies and Build
echo -e "\n${YELLOW}Step 3: Installing Dependencies and Building${NC}"

print_warning "Installing dependencies (this may take a few minutes)..."
# Install dependencies and include devDependencies to ensure build tools (like next) are present
npm install --legacy-peer-deps --include=dev 2>&1 | tee /tmp/npm-install.log || error_exit "npm install failed, see /tmp/npm-install.log"
print_status "Dependencies installed"

# Verify next binary exists
if [ ! -x "./node_modules/.bin/next" ]; then
    print_error "Local 'next' binary not found at ./node_modules/.bin/next"
    print_error "Listing node_modules/.bin:"
    ls -la ./node_modules/.bin || true
    error_exit "Missing Next.js binary. Ensure 'next' is listed in package.json dependencies or devDependencies and install succeeded"
fi

# Create .env file if not present (safe default - override in production)
if [ ! -f ".env" ]; then
    print_warning "Creating .env file with placeholder values (update before production)..."
    cat > .env << EOF
NEXTDNS_API_KEY=
NEXTAUTH_SECRET=please-change-me-
NEXTAUTH_URL=https://login.leoprime.in
EOF
    print_status ".env file created"
else
    print_status ".env already exists"
fi

print_warning "Building application (this may take a few minutes)..."
npm run build 2>&1 | tee /tmp/npm-build.log || {
    tail -n 200 /tmp/npm-build.log
    error_exit "Build failed, see /tmp/npm-build.log"
}
print_status "Application built successfully"

# Step 4: Configure PM2
echo -e "\n${YELLOW}Step 4: Configuring PM2${NC}"

# Prefer a committed ecosystem.config.js inside nextjs_space if present
PM2_ECOSYSTEM_FILE="${NEXTJS_DIR}/ecosystem.config.js"

if [ -f "${PM2_ECOSYSTEM_FILE}" ]; then
    print_status "Using existing PM2 ecosystem file at ${PM2_ECOSYSTEM_FILE}"
else
    print_warning "No committed PM2 ecosystem found. Creating a safe ecosystem.config.js (will not overwrite if created previously)"
    cat > "${PM2_ECOSYSTEM_FILE}" << EOF
module.exports = {
  apps: [{
    name: 'leo-prime-firewall',
    script: 'npm',
    args: 'start',
    cwd: '${NEXTJS_DIR}',
    log: './logs/pm2.log',
    exp_backoff_restart_delay: 100,
    instances: 'max',
    exec_mode: 'cluster'
  }]
};
EOF
    print_status "Safe ecosystem.config.js created"
fi

# Start the application via PM2
print_status "Starting application via PM2..."
pm2 start "${PM2_ECOSYSTEM_FILE}" || error_exit "Failed to start application in PM2"
print_status "Application started"

# Save the PM2 process state
pm2 save || error_exit "Failed to save PM2 process state"
print_status "PM2 process state saved"

# Final verification instructions
echo ""
print_status "Deployment finished. Verify the service is running:"
echo "  pm2 status"
echo "  pm2 logs leo-prime-firewall --lines 50"
echo "  curl http://localhost:3000"
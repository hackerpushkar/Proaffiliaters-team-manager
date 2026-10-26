#!/usr/bin/env bash
# ============================================================================
# HEADER BLOCK: deploy.sh — Master VPS Deployment & Quick-Update Script
# ============================================================================
# WHAT THIS SCRIPT DOES:
# Provides a dual-mode automated deployment engine for Proaffiliaters Team &
# Task Manager on Ubuntu/Debian VPS:
#
# 1. Full Production Deployment (Default: ./deploy.sh):
#    - Verifies and installs system prerequisites (Node.js 20 LTS, PM2, MongoDB)
#    - Configures Nginx reverse proxy with HTTP-to-HTTPS redirect & WebSockets
#    - Provisions Let's Encrypt SSL certificate for manage.proaffiliaters.com
#    - Builds Next.js production bundle & sets up PM2 daemon on Port 3050
#    - Configures systemd auto-restart on VPS reboot
#
# 2. Quick Update Mode (Flag: ./deploy.sh --quick):
#    - Fast, zero-downtime hot reload for code changes & git updates
#    - Skips OS package installs, Nginx reconfiguration, and SSL renewals
#    - Runs: npm install -> npm run build -> pm2 reload manage-proaffiliaters
#
# WHY THIS SCRIPT EXISTS:
# Eliminates manual VPS maintenance friction for manage.proaffiliaters.com.
#
# HOW IT FITS INTO THE OVERALL WORKFLOW:
# Used on the production server located at manage.proaffiliaters.com.
# ============================================================================

set -e

DOMAIN="manage.proaffiliaters.com"
PORT=3050
APP_NAME="manage-proaffiliaters"
EMAIL="admin@proaffiliaters.com"
REPO_URL="https://github.com/hackerpushkar/Proaffiliaters-team-manager.git"
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Color formatting
CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# ----------------------------------------------------------------------------
# Mode Detection: Quick Update vs Full Setup
# ----------------------------------------------------------------------------
if [ "$1" = "--quick" ] || [ "$1" = "-q" ] || [ "$1" = "quick" ]; then
    echo -e "${CYAN}${BOLD}================================================================${NC}"
    echo -e "${CYAN}${BOLD} ⚡ [Proaffiliaters] Quick Update Mode (${DOMAIN})${NC}"
    echo -e "${CYAN}${BOLD}================================================================${NC}"
    echo -e "${YELLOW}>> Working Directory: ${PROJECT_DIR}${NC}"
    echo -e "${YELLOW}>> Upstream Repository: ${REPO_URL}${NC}"

    cd "$PROJECT_DIR"

    # Git pull if git repository exists
    if [ -d ".git" ]; then
        echo -e "${CYAN}>> Pulling latest code changes from origin/main...${NC}"
        git pull origin main || git pull || echo -e "${YELLOW}⚠️ Git pull skipped or encountered divergence.${NC}"
    fi

    # Install dependencies
    echo -e "${CYAN}>> Checking & updating node dependencies...${NC}"
    npm install --production=false

    # Build production bundle
    echo -e "${CYAN}>> Building Next.js production release...${NC}"
    npm run build

    # Zero-downtime PM2 reload
    echo -e "${CYAN}>> Performing zero-downtime PM2 reload...${NC}"
    if pm2 list | grep -q "$APP_NAME"; then
        pm2 reload "$APP_NAME" --update-env
    else
        pm2 start deploy/ecosystem.config.js
    fi
    pm2 save

    echo ""
    echo -e "${GREEN}${BOLD}================================================================${NC}"
    echo -e "${GREEN}${BOLD} ✅ Quick Update Succeeded! Application live on ${DOMAIN}${NC}"
    echo -e "${GREEN}${BOLD}================================================================${NC}"
    echo -e "Public URL:   https://${DOMAIN}"
    echo -e "PM2 Status:   pm2 status ${APP_NAME}"
    echo -e "Live Logs:    pm2 logs ${APP_NAME}"
    echo ""
    exit 0
fi

# ----------------------------------------------------------------------------
# Full Production VPS Setup Mode
# ----------------------------------------------------------------------------
echo -e "${CYAN}${BOLD}================================================================${NC}"
echo -e "${CYAN}${BOLD} 🚀 [Proaffiliaters] Full Production VPS Deployment${NC}"
echo -e "${CYAN}${BOLD} Target Domain: ${DOMAIN} (Port ${PORT})${NC}"
echo -e "${CYAN}${BOLD}================================================================${NC}"

cd "$PROJECT_DIR"

# 1. System Package Updates & Prerequisites
echo -e "\n${CYAN}[1/7] Updating apt repositories & installing system tools...${NC}"
sudo apt update
sudo apt install -y curl git ufw build-essential software-properties-common

# Ensure repository code exists
if [ ! -f "$PROJECT_DIR/package.json" ]; then
    echo -e "${YELLOW}>> No package.json found. Cloning from ${REPO_URL}...${NC}"
    git clone "$REPO_URL" "$PROJECT_DIR"
fi

# 2. Node.js 20 LTS & PM2
echo -e "\n${CYAN}[2/7] Checking Node.js & PM2 runtime...${NC}"
if ! command -v node >/dev/null 2>&1 || [ "$(node -v | cut -d'v' -f2 | cut -d'.' -f1)" -lt 18 ]; then
    echo -e "${YELLOW}>> Installing Node.js 20 LTS via NodeSource...${NC}"
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt install -y nodejs
else
    echo -e "${GREEN}✓ Node.js $(node -v) is already installed.${NC}"
fi

if ! command -v pm2 >/dev/null 2>&1; then
    echo -e "${YELLOW}>> Installing PM2 globally...${NC}"
    sudo npm install -g pm2
else
    echo -e "${GREEN}✓ PM2 $(pm2 -v) is already installed.${NC}"
fi

# 3. MongoDB Community Edition Setup
echo -e "\n${CYAN}[3/7] Checking MongoDB service...${NC}"
if ! command -v mongod >/dev/null 2>&1; then
    echo -e "${YELLOW}>> Installing MongoDB 7.0 Community Edition...${NC}"
    curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | \
      sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor --yes
    echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | \
      sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
    sudo apt update
    sudo apt install -y mongodb-org
    sudo systemctl enable mongod
    sudo systemctl start mongod
else
    echo -e "${GREEN}✓ MongoDB is already installed.${NC}"
    sudo systemctl enable mongod --now || true
fi

# 4. Firewall Configuration (UFW)
echo -e "\n${CYAN}[4/7] Securing UFW firewall...${NC}"
sudo ufw allow 22/tcp || true
sudo ufw allow 'Nginx Full' || true
sudo ufw --force enable || true

# 5. Nginx Web Server & Reverse Proxy
echo -e "\n${CYAN}[5/7] Installing & configuring Nginx for ${DOMAIN}...${NC}"
sudo apt install -y nginx certbot python3-certbot-nginx

# Temporary HTTP-only config to allow certbot challenge if SSL cert is not yet generated
if [ ! -f "/etc/letsencrypt/live/${DOMAIN}/fullchain.pem" ]; then
    echo -e "${YELLOW}>> Generating initial HTTP server block for ACME challenge...${NC}"
    sudo bash -c "cat > /etc/nginx/sites-available/${DOMAIN} <<EOF
server {
    listen 80;
    listen [::]:80;
    server_name ${DOMAIN};

    location / {
        proxy_pass http://127.0.0.1:${PORT};
        proxy_set_header Host \\\$host;
        proxy_set_header X-Real-IP \\\$remote_addr;
        proxy_set_header X-Forwarded-For \\\$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \\\$scheme;
    }
}
EOF"
else
    echo -e "${GREEN}✓ SSL Certificate already exists. Applying production reverse proxy...${NC}"
    sudo cp "$PROJECT_DIR/deploy/nginx.conf" "/etc/nginx/sites-available/${DOMAIN}"
fi

# Enable site in Nginx
sudo ln -sf "/etc/nginx/sites-available/${DOMAIN}" "/etc/nginx/sites-enabled/${DOMAIN}"
# Remove default site if present
sudo rm -f /etc/nginx/sites-enabled/default || true

sudo nginx -t
sudo systemctl reload nginx

# 6. Let's Encrypt SSL Configuration (Certbot)
echo -e "\n${CYAN}[6/7] Securing ${DOMAIN} with Let's Encrypt SSL...${NC}"
if [ ! -f "/etc/letsencrypt/live/${DOMAIN}/fullchain.pem" ]; then
    echo -e "${YELLOW}>> Requesting SSL certificate from Let's Encrypt for ${DOMAIN}...${NC}"
    sudo certbot --nginx -d "${DOMAIN}" --non-interactive --agree-tos -m "${EMAIL}" --redirect --keep-until-expiring
    
    # Overwrite with optimized production Nginx config including WebSockets, Gzip & Caching
    sudo cp "$PROJECT_DIR/deploy/nginx.conf" "/etc/nginx/sites-available/${DOMAIN}"
    sudo nginx -t
    sudo systemctl reload nginx
    echo -e "${GREEN}✓ SSL certificate successfully configured!${NC}"
else
    echo -e "${GREEN}✓ SSL certificate is already active for ${DOMAIN}.${NC}"
fi

# 7. Next.js Production Build & PM2 Daemon
echo -e "\n${CYAN}[7/7] Building Next.js application & starting PM2 daemon...${NC}"
npm install --production=false
npm run build

# Start or reload PM2
if pm2 list | grep -q "$APP_NAME"; then
    echo -e "${CYAN}>> Reloading existing PM2 daemon...${NC}"
    pm2 reload "$APP_NAME" --update-env
else
    echo -e "${CYAN}>> Launching new PM2 process from deploy/ecosystem.config.js...${NC}"
    pm2 start deploy/ecosystem.config.js
fi

pm2 save

# Register systemd startup
echo -e "${CYAN}>> Configuring PM2 system boot persistence...${NC}"
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u "$USER" --hp "$HOME" || true

echo ""
echo -e "${GREEN}${BOLD}================================================================${NC}"
echo -e "${GREEN}${BOLD} 🎉 DEPLOYMENT COMPLETED SUCCESSFULLY!${NC}"
echo -e "${GREEN}${BOLD}================================================================${NC}"
echo -e "Public Website:  ${BOLD}https://${DOMAIN}${NC}"
echo -e "Internal Port:   http://127.0.0.1:${PORT}"
echo -e "PM2 Daemon:      ${APP_NAME}"
echo ""
echo -e "${YELLOW}${BOLD}Helpful Commands for Future Maintenance:${NC}"
echo -e " - Fast Code Update:    ${CYAN}./deploy.sh --quick${NC}"
echo -e " - Check Status:        ${CYAN}pm2 status${NC}"
echo -e " - View Live Logs:      ${CYAN}pm2 logs ${APP_NAME}${NC}"
echo -e " - Restart Server:      ${CYAN}pm2 restart ${APP_NAME}${NC}"
echo -e " - Test Nginx Config:   ${CYAN}sudo nginx -t${NC}"
echo -e " - Check SSL Renewal:   ${CYAN}sudo certbot renew --dry-run${NC}"
echo -e "${GREEN}${BOLD}================================================================${NC}"

# ============================================================================
# FOOTER BLOCK: deploy.sh Implementation Notes
# ============================================================================
# - Run Permissions: Ensure chmod +x deploy.sh has been executed.
# - Initial Setup:   ./deploy.sh
# - Code Updates:    ./deploy.sh --quick
# ============================================================================

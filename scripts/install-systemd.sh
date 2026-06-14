#!/bin/bash
# =============================================================================
# CariAir Systemd Service Installer
# =============================================================================
# This script installs the CariAir systemd service for auto-start on boot
# Run this inside your LXC container as root
#
# Usage:
#   sudo ./scripts/install-systemd.sh
# =============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
APP_NAME="cariair"
INSTALL_DIR="/opt/${APP_NAME}"

echo -e "${GREEN}CariAir Systemd Service Installer${NC}"
echo "========================================"
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}Error: Please run as root (use sudo)${NC}"
    exit 1
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Error: Docker is not installed${NC}"
    echo "Please install Docker first:"
    echo "  apt-get update && apt-get install -y docker.io docker-compose"
    exit 1
fi

# Check if docker compose is available (v2)
if ! docker compose version &> /dev/null; then
    echo -e "${RED}Error: Docker Compose v2 is not installed${NC}"
    echo "Please install it:"
    echo "  apt-get install -y docker-compose-v2"
    exit 1
fi

echo -e "${YELLOW}Step 1: Creating installation directory...${NC}"
mkdir -p "${INSTALL_DIR}"

echo -e "${YELLOW}Step 2: Copying project files...${NC}"
# Copy necessary files to installation directory
cp -r "${PROJECT_DIR}/docker-compose.yml" "${INSTALL_DIR}/"
cp -r "${PROJECT_DIR}/docker-compose.prod.yml" "${INSTALL_DIR}/"
cp -r "${PROJECT_DIR}/Dockerfile" "${INSTALL_DIR}/"
cp -r "${PROJECT_DIR}/.dockerignore" "${INSTALL_DIR}/"
cp -r "${PROJECT_DIR}/package.json" "${INSTALL_DIR}/"
cp -r "${PROJECT_DIR}/pnpm-lock.yaml" "${INSTALL_DIR}/"
cp -r "${PROJECT_DIR}/next.config.mjs" "${INSTALL_DIR}/"
cp -r "${PROJECT_DIR}/tsconfig.json" "${INSTALL_DIR}/"
cp -r "${PROJECT_DIR}/tailwind.config.js" "${INSTALL_DIR}/"
cp -r "${PROJECT_DIR}/postcss.config.mjs" "${INSTALL_DIR}/"
cp -r "${PROJECT_DIR}/components.json" "${INSTALL_DIR}/"
cp -r "${PROJECT_DIR}/.npmrc" "${INSTALL_DIR}/"
cp -r "${PROJECT_DIR}/public" "${INSTALL_DIR}/" 2>/dev/null || true
cp -r "${PROJECT_DIR}/app" "${INSTALL_DIR}/"
cp -r "${PROJECT_DIR}/components" "${INSTALL_DIR}/"
cp -r "${PROJECT_DIR}/lib" "${INSTALL_DIR}/"
cp -r "${PROJECT_DIR}/i18n" "${INSTALL_DIR}/"
cp -r "${PROJECT_DIR}/messages" "${INSTALL_DIR}/"
cp -r "${PROJECT_DIR}/styles" "${INSTALL_DIR}/"
cp -r "${PROJECT_DIR}/types" "${INSTALL_DIR}/"
cp -r "${PROJECT_DIR}/sql" "${INSTALL_DIR}/"
cp -r "${PROJECT_DIR}/hooks" "${INSTALL_DIR}/" 2>/dev/null || true

# Copy environment file if it exists
if [ -f "${PROJECT_DIR}/.env.local" ]; then
    cp "${PROJECT_DIR}/.env.local" "${INSTALL_DIR}/.env.production.local"
    echo -e "${GREEN}  ✓ Copied .env.local to .env.production.local${NC}"
elif [ -f "${PROJECT_DIR}/.env" ]; then
    cp "${PROJECT_DIR}/.env" "${INSTALL_DIR}/.env.production.local"
    echo -e "${GREEN}  ✓ Copied .env to .env.production.local${NC}"
else
    echo -e "${YELLOW}  ⚠ No .env file found. Please create ${INSTALL_DIR}/.env.production.local manually${NC}"
fi

echo -e "${YELLOW}Step 3: Installing systemd service...${NC}"
cp "${PROJECT_DIR}/${APP_NAME}.service" "/etc/systemd/system/${APP_NAME}.service"

# Reload systemd daemon
systemctl daemon-reload

echo -e "${YELLOW}Step 4: Enabling auto-start on boot...${NC}"
systemctl enable "${APP_NAME}.service"

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Installation Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Installation Directory: ${INSTALL_DIR}"
echo ""
echo "Available commands:"
echo "  systemctl start ${APP_NAME}    - Start CariAir"
echo "  systemctl stop ${APP_NAME}     - Stop CariAir"
echo "  systemctl restart ${APP_NAME}  - Restart CariAir"
echo "  systemctl status ${APP_NAME}   - Check status"
echo "  journalctl -u ${APP_NAME} -f   - View logs"
echo ""
echo "The service is enabled and will auto-start on boot."
echo ""
read -p "Would you like to start CariAir now? (y/N) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Starting CariAir...${NC}"
    systemctl start "${APP_NAME}.service"
    sleep 2
    systemctl status "${APP_NAME}.service" --no-pager
fi

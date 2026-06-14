#!/bin/bash
# =============================================================================
# CariAir Docker Systemd Service Installer
# =============================================================================
# This script installs CariAir using Docker with systemd for auto-start
#
# Usage:
#   sudo ./scripts/install-docker.sh
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

echo -e "${GREEN}CariAir Docker Systemd Service Installer${NC}"
echo "========================================="
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}Error: Please run as root (use sudo)${NC}"
    exit 1
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Error: Docker is not installed${NC}"
    exit 1
fi

# Check if docker compose is available
if ! docker compose version &> /dev/null; then
    echo -e "${RED}Error: Docker Compose is not installed${NC}"
    exit 1
fi

echo -e "${YELLOW}Step 1: Creating installation directory...${NC}"
mkdir -p "${INSTALL_DIR}"

echo -e "${YELLOW}Step 2: Copying project files...${NC}"
# Copy necessary files to installation directory
cp "${PROJECT_DIR}/docker-compose.yml" "${INSTALL_DIR}/"
cp "${PROJECT_DIR}/docker-compose.prod.yml" "${INSTALL_DIR}/"
cp "${PROJECT_DIR}/Dockerfile" "${INSTALL_DIR}/"
cp "${PROJECT_DIR}/.dockerignore" "${INSTALL_DIR}/"
cp -r "${PROJECT_DIR}/sql" "${INSTALL_DIR}/"
cp -r "${PROJECT_DIR}/public" "${INSTALL_DIR}/" 2>/dev/null || true

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

# Ensure data directory exists
mkdir -p "${INSTALL_DIR}/data"

echo -e "${YELLOW}Step 3: Building Docker images...${NC}"
cd "${INSTALL_DIR}"
docker compose build --no-cache

echo -e "${GREEN}  ✓ Docker images built${NC}"

echo -e "${YELLOW}Step 4: Installing systemd service...${NC}"
cp "${PROJECT_DIR}/${APP_NAME}.service" "/etc/systemd/system/${APP_NAME}.service"

# Reload systemd daemon
systemctl daemon-reload

echo -e "${YELLOW}Step 5: Enabling auto-start on boot...${NC}"
systemctl enable "${APP_NAME}.service"

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Installation Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Installation Directory: ${INSTALL_DIR}"
echo ""
echo "Available commands:"
echo "  sudo systemctl start ${APP_NAME}    - Start CariAir"
echo "  sudo systemctl stop ${APP_NAME}     - Stop CariAir"
echo "  sudo systemctl restart ${APP_NAME}  - Restart CariAir"
echo "  sudo systemctl status ${APP_NAME}   - Check status"
echo "  sudo journalctl -u ${APP_NAME} -f   - View logs"
echo "  docker compose logs -f              - View container logs"
echo ""
echo "The service is enabled and will auto-start on boot."
echo ""
read -p "Would you like to start CariAir now? (y/N) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Starting CariAir...${NC}"
    systemctl start "${APP_NAME}.service"
    sleep 5
    systemctl status "${APP_NAME}.service" --no-pager
fi

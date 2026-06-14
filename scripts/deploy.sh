#!/bin/bash
# =============================================================================
# CariAir Production Deployment Script
# =============================================================================
# This script builds and deploys CariAir in production mode
#
# Usage:
#   ./scripts/deploy.sh              # Deploy using docker compose
#   ./scripts/deploy.sh --systemd    # Deploy with systemd service
# =============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
USE_SYSTEMD=false

# Parse arguments
for arg in "$@"; do
    case $arg in
        --systemd)
            USE_SYSTEMD=true
            shift
            ;;
        --help|-h)
            echo "CariAir Deployment Script"
            echo ""
            echo "Usage:"
            echo "  ./scripts/deploy.sh              Deploy with docker compose (standalone)"
            echo "  ./scripts/deploy.sh --systemd    Deploy with systemd service (auto-start)"
            echo ""
            exit 0
            ;;
    esac
done

cd "$PROJECT_DIR"

echo -e "${GREEN}CariAir Production Deployment${NC}"
echo "=============================="
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Error: Docker is not installed${NC}"
    exit 1
fi

# Check environment file
if [ ! -f ".env.local" ] && [ ! -f ".env" ]; then
    echo -e "${YELLOW}Warning: No .env.local or .env file found${NC}"
    echo "Creating from .env.example..."
    cp .env.example .env.local
    echo -e "${RED}Please edit .env.local with your production credentials before continuing!${NC}"
    exit 1
fi

echo -e "${YELLOW}Step 1: Building production image...${NC}"
docker compose build --no-cache

echo -e "${YELLOW}Step 2: Starting services...${NC}"
if [ "$USE_SYSTEMD" = true ]; then
    echo "Using systemd deployment..."
    if [ "$EUID" -ne 0 ]; then
        echo -e "${RED}Error: --systemd requires root privileges${NC}"
        echo "Run with: sudo ./scripts/deploy.sh --systemd"
        exit 1
    fi
    ./scripts/install-systemd.sh
else
    echo "Using docker compose deployment..."
    docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --remove-orphans

    echo ""
    echo -e "${YELLOW}Waiting for services to be healthy...${NC}"
    sleep 5

    # Check if services are running
    if docker compose ps | grep -q "Up"; then
        echo -e "${GREEN}✓ Services are running!${NC}"
    else
        echo -e "${RED}✗ Services failed to start${NC}"
        docker compose logs
        exit 1
    fi

    echo ""
    echo -e "${GREEN}Deployment Complete!${NC}"
    echo "=============================="
    echo ""
    echo "CariAir is now running at: http://localhost:3000"
    echo ""
    echo "Useful commands:"
    echo "  docker compose logs -f         - View logs"
    echo "  docker compose ps                - Check status"
    echo "  docker compose restart           - Restart services"
    echo "  docker compose down              - Stop services"
    echo ""
    echo "To enable auto-start on boot with systemd, run:"
    echo "  sudo ./scripts/install-systemd.sh"
fi

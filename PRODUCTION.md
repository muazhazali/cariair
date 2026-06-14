# CariAir Production Deployment Guide

This guide covers deploying CariAir in production with auto-start on system boot.

## Deployment Options

### Option 1: Native Systemd Service (Recommended for LXC/No Docker)

**Use this if Docker has DNS/networking issues** (common in Proxmox LXC containers).

```bash
# Install native systemd service (run as root)
sudo ./scripts/install-native.sh
```

This runs CariAir directly with Node.js and uses the system's PostgreSQL.

### Option 2: Docker Systemd Service (Requires working Docker)

Use this if Docker is fully functional in your environment.

```bash
# Install systemd service (run as root)
sudo ./scripts/install-systemd.sh

# Or use the deploy script with --systemd flag
sudo ./scripts/deploy.sh --systemd
```

### Option 3: Simple Docker Compose (Manual Start)

For quick testing without auto-start:

```bash
# Build and start
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build

# Or use the deploy script
./scripts/deploy.sh
```

## Systemd Commands

Once the systemd service is installed:

```bash
# Start CariAir
sudo systemctl start cariair

# Stop CariAir
sudo systemctl stop cariair

# Restart CariAir
sudo systemctl restart cariair

# View status
sudo systemctl status cariair

# View logs
sudo journalctl -u cariair -f

# Enable auto-start on boot (already done by install script)
sudo systemctl enable cariair

# Disable auto-start on boot
sudo systemctl disable cariair
```

## Environment Configuration

### Required Environment Variables

Create `.env.production.local` in the installation directory (`/opt/cariair/`):

```bash
# Database Configuration
DB_HOST=postgres
DB_PORT=5432
DB_USER=postgres
DB_PASS=your-secure-password
DB_NAME=cariair

# NextAuth.js (Required)
AUTH_SECRET="$(openssl rand -base64 32)"

# Google OAuth (Optional)
AUTH_GOOGLE_ID=your-google-client-id
AUTH_GOOGLE_SECRET=your-google-client-secret

# Groq API (Optional - for chatbot)
GROQ_API_KEY=your-groq-api-key
```

### Generate AUTH_SECRET

```bash
openssl rand -base64 32
```

## Docker Compose Configuration

### Production Overrides (`docker-compose.prod.yml`)

The production configuration includes:

- **Resource limits**: CPU and memory limits for containers
- **Logging**: JSON-file logging with rotation (100MB max, 3 files)
- **Health checks**: App health monitoring every 30 seconds
- **Restart policy**: `always` - containers restart automatically
- **Security**: PostgreSQL port not exposed externally

### Resource Limits

| Service | CPU | Memory |
|---------|-----|--------|
| postgres | 1.0 | 1G |
| app | 1.0 | 1G |

## Systemd Commands (Native Setup)

Once the native systemd service is installed:

```bash
# Start CariAir
sudo systemctl start cariair

# Stop CariAir
sudo systemctl stop cariair

# Restart CariAir
sudo systemctl restart cariair

# View status
sudo systemctl status cariair

# View logs
sudo journalctl -u cariair -f

# Enable auto-start on boot (already done by install script)
sudo systemctl enable cariair

# Disable auto-start on boot
sudo systemctl disable cariair
```

## Troubleshooting

### Native Setup Issues

**Issue: Service won't start**
```bash
# Check systemd logs
sudo journalctl -u cariair -n 50 --no-pager

# Check if PostgreSQL is running
sudo systemctl status postgresql

# Test database connection
sudo -u postgres psql -d cariair -c "SELECT 1;"
```

**Issue: Port already in use**
```bash
# Check what's using port 3000
sudo lsof -i :3000

# Kill process if needed
sudo kill -9 <PID>
```

**Issue: Changes not applied**
```bash
# Rebuild and restart
cd /opt/cariair
sudo pnpm build
sudo systemctl restart cariair
```

### Docker Setup Issues

**Issue: Docker service won't start**
```bash
# Check systemd logs
sudo journalctl -u cariair -n 50 --no-pager

# Check docker logs
docker compose logs
```

**Issue: Database connection failed**
```bash
# Verify postgres is healthy
docker compose ps

# Check database logs
docker compose logs postgres
```

**Issue: Changes not applied**
```bash
# Rebuild and restart
docker compose down
docker compose build --no-cache
docker compose up -d
```

### Reset Everything (Native)

```bash
# Stop service
sudo systemctl stop cariair
sudo systemctl disable cariair

# Remove installation
sudo rm -rf /opt/cariair
sudo rm /etc/systemd/system/cariair.service
sudo systemctl daemon-reload
```

### Reset Everything (Docker)

```bash
# Stop and remove containers
docker compose down

# Remove database volume (WARNING: deletes all data!)
docker compose down -v

# Reinstall systemd service
sudo ./scripts/install-systemd.sh
```

## Security Notes

1. **Change default passwords**: Update `DB_PASS` from the default `postgres`
2. **Generate secure AUTH_SECRET**: Use `openssl rand -base64 32`
3. **Secure PostgreSQL**: Port 5432 is not exposed in production compose
4. **Environment files**: Keep `.env.production.local` secure (chmod 600)

## Reverse Proxy (Optional)

For production with HTTPS, place behind a reverse proxy like Nginx or Traefik:

### Nginx Example

```nginx
server {
    listen 80;
    server_name cariair.example.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name cariair.example.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

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
```

## Backup and Restore

### Native Setup

```bash
# Backup database
sudo -u postgres pg_dump cariair > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore database
sudo -u postgres psql -d cariair < backup_file.sql
```

### Docker Setup

```bash
# Backup to file
docker compose exec postgres pg_dump -U postgres cariair > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore from file
docker compose exec -T postgres psql -U postgres cariair < backup_file.sql
```

## Updating

### Native Setup

```bash
# Pull latest code
cd /opt/cariair
git pull

# Rebuild and restart
sudo pnpm install --frozen-lockfile
sudo pnpm build
sudo systemctl restart cariair
```

### Docker Setup

```bash
# Pull latest code
cd /opt/cariair
git pull

# Rebuild and restart
sudo systemctl restart cariair

# Or manually:
docker compose build --no-cache
docker compose up -d
```

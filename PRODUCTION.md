# CariAir Production Deployment Guide

This guide covers deploying CariAir in production with auto-start on system boot.

## Deployment

CariAir runs natively with Node.js behind a systemd service. This is the recommended path for LXC/Proxmox environments where Docker has DNS/networking issues.

```bash
# Install systemd service (run as root)
sudo ./scripts/install-native.sh
```

This builds CariAir and runs it directly with Node.js using the standalone
build output.

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

### Environment Variables (all optional)

Create `.env.production.local` in the installation directory (`/opt/cariair/`):

```bash
# Groq API (Optional - for chatbot)
GROQ_API_KEY=your-groq-api-key

# Analytics (Optional)
NEXT_PUBLIC_UMAMI_SCRIPT_URL=https://...
NEXT_PUBLIC_UMAMI_WEBSITE_ID=...
```

No database environment variables are required — all data lives in
`data/db.json` via `lib/json-store.ts`.

## Troubleshooting

### Service won't start
```bash
# Check systemd logs
sudo journalctl -u cariair -n 50 --no-pager

# Check what's using port 3000
sudo lsof -i :3000

# Kill process if needed
sudo kill -9 <PID>
```

### Changes not applied
```bash
# Rebuild and restart
cd /opt/cariair
sudo pnpm build
sudo systemctl restart cariair
```

### Reset Everything
```bash
# Stop service
sudo systemctl stop cariair
sudo systemctl disable cariair

# Remove installation
sudo rm -rf /opt/cariair
sudo rm /etc/systemd/system/cariair.service
sudo systemctl daemon-reload
```

## Security Notes

1. **Environment files**: Keep `.env.production.local` secure (chmod 600)
2. **TypeScript strict mode** enabled for compile-time safety

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

The entire dataset is the single file `data/db.json`:

```bash
# Backup
sudo cp /opt/cariair/data/db.json backup_$(date +%Y%m%d_%H%M%S).json

# Restore
sudo cp backup_file.json /opt/cariair/data/db.json
sudo systemctl restart cariair
```

## Updating

```bash
# Pull latest code
cd /opt/cariair
git pull

# Rebuild and restart
sudo pnpm install --frozen-lockfile
sudo pnpm build
sudo systemctl restart cariair
```
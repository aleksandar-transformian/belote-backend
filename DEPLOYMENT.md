# Deployment Guide - Production Setup

## 🎯 Overview

This guide covers deploying the Belote backend to production with Docker, automated deployments, monitoring, and scaling strategies.

---

## 🚀 Deployment Options

### Option 1: DigitalOcean (Recommended for MVP)
- **Cost**: ~$12-24/month for droplet
- **Ease**: Simple, managed
- **Scalability**: Easy vertical scaling

### Option 2: AWS (Recommended for Scale)
- **Cost**: Pay-as-you-go
- **Ease**: More complex
- **Scalability**: Excellent horizontal scaling

### Option 3: Railway/Render
- **Cost**: ~$15-30/month
- **Ease**: Very simple
- **Scalability**: Limited

---

## 📋 Prerequisites

Before deploying, ensure you have:

- [ ] A server with Docker and Docker Compose installed
- [ ] Git installed on the server
- [ ] Domain name (optional but recommended)
- [ ] SSL certificates (can use Let's Encrypt)
- [ ] Strong passwords/secrets generated

---

## 🔐 Step 1: Generate Secrets

Generate strong secrets for production:

```bash
# Generate JWT secrets (64 bytes)
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Generate passwords (32 characters)
openssl rand -base64 32
```

Save these securely - you'll need them for the `.env.production` file.

---

## ⚙️ Step 2: Configure Environment

1. Copy the example environment file:
```bash
cp .env.production.example .env.production
```

2. Edit `.env.production` and update all values:
```bash
nano .env.production
```

**Critical values to update:**
- `DATABASE_PASSWORD` - Strong password for PostgreSQL
- `REDIS_PASSWORD` - Strong password for Redis
- `JWT_SECRET` - Generated secret (64 bytes hex)
- `JWT_REFRESH_SECRET` - Different generated secret
- `SOCKET_CORS_ORIGIN` - Your frontend domain

---

## 🐳 Step 3: Docker Setup

### Production Files Overview

- **Dockerfile.prod** - Multi-stage production build
- **docker-compose.prod.yml** - Production services configuration
- **nginx.conf** - Reverse proxy and SSL termination
- **.dockerignore** - Files to exclude from Docker build

### Build and Start Services

```bash
# Build Docker images
docker-compose -f docker-compose.prod.yml build

# Start services
docker-compose -f docker-compose.prod.yml up -d

# Check status
docker-compose -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.prod.yml logs -f
```

---

## 🌐 Step 4: Nginx and SSL Setup

### Update Nginx Configuration

Edit `nginx.conf` and replace `your-domain.com` with your actual domain:

```bash
sed -i 's/your-domain.com/yourdomain.com/g' nginx.conf
```

### SSL with Let's Encrypt

1. Install Certbot:
```bash
sudo apt update
sudo apt install certbot
```

2. Generate certificates:
```bash
sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com
```

3. Copy certificates to project:
```bash
mkdir -p ssl
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem ssl/
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem ssl/
```

4. Set up auto-renewal:
```bash
sudo crontab -e
# Add: 0 0 1 * * certbot renew --quiet && cp /etc/letsencrypt/live/yourdomain.com/*.pem /path/to/belote-backend/ssl/
```

---

## 🗄️ Step 5: Database Setup

### Run Migrations

```bash
docker-compose -f docker-compose.prod.yml exec app npm run db:migrate
```

### Set Up Automated Backups

1. The backup script is already created at `scripts/backup-db.sh`

2. Add to crontab for daily backups at 2 AM:
```bash
crontab -e
# Add:
0 2 * * * /home/user/belote-backend/scripts/backup-db.sh
```

### Restore from Backup

```bash
# List available backups
ls -lh backups/

# Restore a backup
gunzip < backups/backup_YYYYMMDD_HHMMSS.sql.gz | \
  docker exec -i belote_postgres_prod psql -U belote_prod_user -d belote_production
```

---

## 📊 Step 6: Monitoring Setup

### Health Monitoring

Set up automatic health checks every 5 minutes:

```bash
crontab -e
# Add:
*/5 * * * * /home/user/belote-backend/scripts/health-monitor.sh
```

### Monitor Logs

```bash
# Application logs
docker-compose -f docker-compose.prod.yml logs -f app

# Database logs
docker-compose -f docker-compose.prod.yml logs -f postgres

# Redis logs
docker-compose -f docker-compose.prod.yml logs -f redis

# Nginx logs
docker-compose -f docker-compose.prod.yml logs -f nginx
```

### Container Stats

```bash
# Real-time stats
docker stats

# Specific container
docker stats belote_app
```

---

## 🔄 Step 7: Deployment Script

Use the automated deployment script for updates:

```bash
./scripts/deploy.sh
```

This script will:
1. Pull latest code
2. Create database backup
3. Build Docker images
4. Stop old containers
5. Start new containers
6. Run migrations
7. Perform health check

---

## 🔥 Step 8: CI/CD with GitHub Actions

### Set Up GitHub Secrets

Add these secrets to your GitHub repository:

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Add the following secrets:
   - `HOST` - Your server IP or domain
   - `USERNAME` - SSH username (usually `root` or your user)
   - `SSH_PRIVATE_KEY` - Your SSH private key
   - `PORT` - SSH port (default: 22)

### Workflow

The workflow (`.github/workflows/deploy.yml`) will automatically:
- Run tests on push to main
- Build the application
- Deploy to production server via SSH

---

## 📈 Step 9: DigitalOcean Deployment

### 1. Create Droplet

Via Web UI:
- Select Ubuntu 22.04 LTS
- Choose plan (2GB RAM minimum)
- Add SSH key
- Create droplet

Via CLI:
```bash
doctl compute droplet create belote-api \
  --region nyc1 \
  --size s-2vcpu-4gb \
  --image ubuntu-22-04-x64 \
  --ssh-keys YOUR_SSH_KEY_ID
```

### 2. Initial Server Setup

```bash
# SSH into droplet
ssh root@YOUR_DROPLET_IP

# Update system
apt update && apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
apt install docker-compose-plugin

# Install Git
apt install git

# Install other utilities
apt install curl wget htop

# Create app directory
mkdir -p /home/user/belote-backend
cd /home/user/belote-backend
```

### 3. Clone Repository

```bash
git clone https://github.com/yourusername/belote-backend.git .
```

### 4. Configure Environment

```bash
cp .env.production.example .env.production
nano .env.production
# Update with production values
```

### 5. Deploy

```bash
chmod +x scripts/*.sh
./scripts/deploy.sh
```

### 6. Configure Firewall

```bash
# Install UFW if not installed
apt install ufw

# Configure firewall
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
ufw enable

# Check status
ufw status
```

---

## 🔍 Step 10: Health Checks & Verification

### Verify All Services

```bash
# Check all containers are running
docker-compose -f docker-compose.prod.yml ps

# Test health endpoint
curl http://localhost:3000/health

# Test with SSL (if configured)
curl https://yourdomain.com/health
```

### Test API Endpoints

```bash
# Health check
curl https://yourdomain.com/health

# Register a user
curl -X POST https://yourdomain.com/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"Test123!"}'

# Login
curl -X POST https://yourdomain.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!"}'
```

---

## 📈 Scaling Strategies

### Vertical Scaling (Short-term)

1. **Upgrade droplet size**
```bash
# Via doctl
doctl compute droplet-action resize DROPLET_ID --size s-4vcpu-8gb
```

2. **Increase database pool**
   - Update `DATABASE_POOL_MAX` in `.env.production`

3. **Increase Redis memory**
   - Update `maxmemory` in `docker-compose.prod.yml`

### Horizontal Scaling (Long-term)

1. **Load Balancer**: Use DigitalOcean Load Balancer or nginx

2. **Multiple App Instances**:
```yaml
# In docker-compose.prod.yml
app:
  deploy:
    replicas: 3
```

3. **Redis Adapter for Socket.io**:

Install the Redis adapter:
```bash
npm install @socket.io/redis-adapter
```

Update Socket.io configuration (in `src/index.ts` or wherever Socket.io is initialized):
```typescript
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';

const pubClient = createClient({
  url: `redis://:${process.env.REDIS_PASSWORD}@${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`
});
const subClient = pubClient.duplicate();

await Promise.all([pubClient.connect(), subClient.connect()]);

io.adapter(createAdapter(pubClient, subClient));
```

4. **Database Replication**: Set up PostgreSQL master-slave replication

---

## 🐛 Troubleshooting

### Container won't start

```bash
# Check logs
docker-compose -f docker-compose.prod.yml logs app

# Check container status
docker ps -a

# Inspect container
docker inspect belote_app

# Try rebuilding
docker-compose -f docker-compose.prod.yml build --no-cache app
docker-compose -f docker-compose.prod.yml up -d
```

### Database connection fails

```bash
# Check PostgreSQL logs
docker-compose -f docker-compose.prod.yml logs postgres

# Test connection
docker exec belote_postgres_prod psql -U belote_prod_user -d belote_production -c "SELECT 1;"

# Check network
docker network inspect belote-backend_belote_network
```

### High memory usage

```bash
# Check container stats
docker stats

# Restart app
docker-compose -f docker-compose.prod.yml restart app

# Clear Redis cache if needed
docker exec belote_redis_prod redis-cli -a $REDIS_PASSWORD FLUSHALL
```

### SSL certificate issues

```bash
# Test certificate
openssl x509 -in ssl/fullchain.pem -text -noout

# Check expiry
openssl x509 -in ssl/fullchain.pem -noout -dates

# Renew certificate
certbot renew --force-renewal
```

### WebSocket connection issues

1. Check nginx configuration for WebSocket support
2. Verify CORS settings in `.env.production`
3. Check firewall rules
4. Test WebSocket connection:
```bash
npm install -g wscat
wscat -c wss://yourdomain.com/socket.io/?EIO=4&transport=websocket
```

---

## 🔐 Security Checklist

- [ ] Strong passwords for all services
- [ ] JWT secrets are random and secure (64+ bytes)
- [ ] SSL/TLS enabled with valid certificates
- [ ] Firewall configured (only ports 22, 80, 443 open)
- [ ] Database not exposed to public internet
- [ ] Redis password protected
- [ ] Rate limiting enabled in nginx
- [ ] Security headers configured
- [ ] Regular backups automated
- [ ] Log monitoring in place
- [ ] Environment variables not committed to git
- [ ] Non-root user in Docker containers
- [ ] Regular security updates applied

---

## 📊 Monitoring Checklist

- [ ] Application logs rotate daily
- [ ] Database backups run daily
- [ ] Health checks every 5 minutes
- [ ] SSL certificate auto-renewal configured
- [ ] Disk space monitoring
- [ ] Memory usage alerts
- [ ] API response time tracking
- [ ] Error rate monitoring
- [ ] WebSocket connection monitoring

---

## 🔄 Maintenance Tasks

### Daily
- Check health monitoring logs
- Review application logs for errors
- Monitor disk space

### Weekly
- Review backup status
- Check SSL certificate expiry
- Review security logs
- Update dependencies if needed

### Monthly
- Test backup restoration
- Review and rotate old logs
- Security audit
- Performance optimization review

---

## 📚 Additional Resources

- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Node.js Production Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [Socket.io Scaling](https://socket.io/docs/v4/using-multiple-nodes/)
- [PostgreSQL Performance Tuning](https://wiki.postgresql.org/wiki/Performance_Optimization)
- [Nginx Configuration](https://nginx.org/en/docs/)
- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)

---

## 🆘 Support

If you encounter issues:

1. Check the logs: `docker-compose -f docker-compose.prod.yml logs`
2. Review this documentation
3. Check GitHub Issues
4. Contact the development team

---

## 📝 Next Steps After Deployment

1. **Test all functionality**
   - User registration and login
   - Game creation and joining
   - Real-time gameplay
   - WebSocket connections

2. **Set up monitoring**
   - Configure health checks
   - Set up log aggregation
   - Enable alerts

3. **Performance testing**
   - Load testing with concurrent users
   - Monitor response times
   - Optimize as needed

4. **Documentation**
   - Document any custom configurations
   - Keep credentials secure
   - Update team on deployment process

---

**Deployment Version:** 1.0.0
**Last Updated:** 2025-11-12

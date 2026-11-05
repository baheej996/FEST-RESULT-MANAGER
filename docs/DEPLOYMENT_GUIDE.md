# PRODUCTION DEPLOYMENT & OPERATIONS GUIDE
## Modern Festival Result Management System

### 1. Architecture & Deployment Options

The Festival Result Management System is built with a production-optimized Next.js 14 full-stack engine backed by Prisma ORM.

It can be deployed in two configurations:
- **Standalone VPS / Cloud Server (Recommended for Festivals)**: Ubuntu 22.04/24.04 LTS, Node.js 20+, PM2 process manager, and Nginx reverse proxy with automated Let's Encrypt SSL.
- **Containerized Docker Deployment**: Fully self-contained Docker container deployable to AWS ECS, GCP Cloud Run, DigitalOcean App Platform, or local servers.

---

### 2. Environment Configuration (`.env`)

Create a production `.env` file in the project root:

```env
# Database connection (SQLite for zero-config, or PostgreSQL for large enterprise clusters)
# SQLite:
DATABASE_URL="file:./prod.db"

# PostgreSQL (Alternative):
# DATABASE_URL="postgresql://fest_user:SecurePassword123@localhost:5432/fest_db?schema=public"

# Secure Cryptographic Salt / Secret for JWT Sessions
JWT_SECRET="generate_a_random_64_character_hex_string_here"

# Application Settings
NEXT_PUBLIC_APP_NAME="CBSE Sahodaya Kalotsav 2026"
PORT=3000
NODE_ENV="production"
```

---

### 3. Step-by-Step Server Setup (Ubuntu / Debian VPS)

#### Step 1: Install Node.js & Dependencies
```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs git build-essential

# Verify installations
node -v
npm -v
```

#### Step 2: Clone & Build Application
```bash
# Clone the repository
git clone <YOUR_REPOSITORY_URL> /var/www/fest-result-manager
cd /var/www/fest-result-manager

# Install production dependencies
npm install --production=false

# Push Prisma Schema to Database & Seed Default Festival Data
npx prisma generate
npx prisma db push
node prisma/seed.js

# Build Optimized Production Next.js Bundle
npm run build
```

#### Step 3: Configure PM2 Daemon
```bash
sudo npm install -g pm2

# Start the application cluster
pm2 start npm --name "fest-result-manager" -- start -- -p 3000

# Ensure process restarts automatically on server reboot
pm2 startup
pm2 save
```

#### Step 4: Configure Nginx Reverse Proxy
Create `/etc/nginx/sites-available/festival.org`:
```nginx
server {
    server_name results.sahodaya.org festival.org;

    location / {
        proxy_pass http://127.0.0.1:3000;
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

Enable site and install SSL certificate:
```bash
sudo ln -s /etc/nginx/sites-available/festival.org /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Install free SSL certificate via Let's Encrypt Certbot
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d results.sahodaya.org -d festival.org
```

---

### 4. Database Backup & Restore Procedures

#### Automated Daily Backup (Cron)
Add a crontab task:
```bash
crontab -e
```
Add the following line to back up the database every night at 2:00 AM:
```cron
0 2 * * * cp /var/www/fest-result-manager/prisma/dev.db /var/backups/fest_db_$(date +\%F_\%T).db
```

#### Manual Instant Snapshot
```bash
# SQLite instant snapshot
cp dev.db dev_backup_$(date +%Y%m%d_%H%M%S).db

# PostgreSQL backup (if using Postgres datasource)
pg_dump -U fest_user -d fest_db -F c -b -v -f "/var/backups/fest_backup.dump"
```

#### Restore Procedure
```bash
# SQLite restore:
pm2 stop fest-result-manager
cp /var/backups/fest_db_BACKUP_DATE.db dev.db
pm2 start fest-result-manager
```


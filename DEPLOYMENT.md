# Deployment Guide

## Updating EC2 Instance with Latest Changes

Since you've already pushed your changes to GitHub, follow these steps to update your EC2 instance:

### 1. SSH into your EC2 instance

```bash
ssh -i /path/to/your-key.pem ec2-user@your-ec2-ip-address
# or
ssh -i /path/to/your-key.pem ubuntu@your-ec2-ip-address
```

### 2. Navigate to your application directory

```bash
cd /path/to/your/application
# Common locations:
# - /home/ec2-user/office-table-tennis-elo-backend
# - /var/www/office-table-tennis-elo-backend
# - ~/office-table-tennis-elo-backend
```

### 3. Pull the latest changes from GitHub

```bash
git pull origin main
# or
git pull origin master
```

### 4. Install any new dependencies (if package.json changed)

```bash
npm install
```

### 5. Restart your application

The method depends on how your app is running:

#### If using PM2 (Process Manager):

```bash
pm2 restart office-table-tennis-elo-backend
# or
pm2 restart all
```

#### If using systemd service:

```bash
sudo systemctl restart your-app-name
# Check status with:
sudo systemctl status your-app-name
```

#### If using Docker:

```bash
docker-compose restart
# or if you need to rebuild:
docker-compose up -d --build
```

#### If running directly with node:

```bash
# Stop the current process (Ctrl+C or kill the process)
# Then restart:
npm start
# Or if running in background:
nohup npm start &
```

### 6. Verify the deployment

- Check application logs for any errors
- Test your endpoints to ensure everything works
- Verify the database migration ran (if needed)

## Database Migration Note

Since you added a new `elo` field to the User model, Sequelize will automatically sync the schema when the app starts (due to `sequelize.sync()` calls in your routes). However, existing users will get the default `elo` value of 1000.

If you want to update existing users' ELO values, you can run a migration script or update them manually through your database.

## Quick One-Liner (if using PM2)

If you're using PM2 and know your app directory:

```bash
ssh -i /path/to/key.pem user@ec2-ip "cd /path/to/app && git pull && npm install && pm2 restart all"
```

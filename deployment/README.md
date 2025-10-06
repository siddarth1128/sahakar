# Deployment Guide

## AWS Free Tier Setup

### Backend (EC2 t2.micro, 750 hrs free)
1. Launch EC2 instance (Ubuntu, t2.micro)
2. SSH into instance
3. Install Node.js, PM2: `sudo apt update && sudo apt install nodejs npm -y && sudo npm install -g pm2`
4. Clone repo: `git clone <repo> && cd fixitnow/backend`
5. `npm install`
6. Copy .env with production keys
7. `pm2 start server.js --name fixitnow`
8. Configure security group: Open ports 80, 443, 5000

### Frontend (S3 Static Hosting, 5GB free)
1. Build frontend: `cd frontend && npm run build`
2. Create S3 bucket, enable static hosting
3. Upload build/ folder
4. Configure CloudFront for CDN

### SSL (Certbot free)
1. `sudo apt install certbot -y`
2. `sudo certbot --nginx` (or standalone)
3. Auto-renew SSL

### SNS (SMS OTP)
- Use sandbox mode for testing
- Production: Request production access

### Monitoring
- Use free CloudWatch metrics
- PM2 logs: `pm2 logs`

## Free-Tier Tips
- EC2: 750 hrs/month
- S3: 5GB storage
- SNS: 100 SMS/month
- MongoDB Atlas: 512MB
- Redis Labs: 30MB
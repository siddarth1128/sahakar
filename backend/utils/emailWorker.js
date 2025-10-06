// utils/emailWorker.js - Email worker for FixItNow using Redis queue and Nodemailer
// Processes email queue from Redis, sends via Gmail, handles OneSignal push notifications
// Connections: Redis client, nodemailer, OneSignal SDK
// Free-tier: Gmail (~100 emails/day), OneSignal free tier
const nodemailer = require('nodemailer');
const redis = require('redis');


// Redis client (optional)
let redisClient = null;
if (process.env.REDIS_URL) {
  redisClient = redis.createClient({ url: process.env.REDIS_URL });
  redisClient.connect().catch(err => {
    console.error('Redis connection failed:', err);
    redisClient = null;
  });
}
// Nodemailer transporter for Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS // App password
  }
});

// OneSignal client

// Process email queue
const processEmailQueue = async () => {
  if (!redisClient || !redisClient.isOpen) {
    return; // Skip if no Redis
  }
  try {
    const emailData = await redisClient.blPop('emailQueue', 0); // Blocking pop
    if (emailData) {
      const { to, subject, text, html, type, attachments } = JSON.parse(emailData.element);

      const mailOptions = {
        from: process.env.GMAIL_USER,
        to,
        subject,
        text,
        html,
        attachments
      };

      await transporter.sendMail(mailOptions);
      console.log(`Email sent to ${to}`);
    }
  } catch (err) {
    console.error('Email Worker Error:', err);
  }
};

// Process notification queue (email/SMS/push)
const processNotificationQueue = async () => {
  if (!redisClient || !redisClient.isOpen) {
    return; // Skip if no Redis
  }
  try {
    const notificationData = await redisClient.blPop('notificationQueue', 0);
    if (notificationData) {
      const { type, toUser, toTech, jobId, message } = JSON.parse(notificationData.element);
  
      // Send email
      if (type.includes('email')) {
        await redisClient.lPush('emailQueue', JSON.stringify({
          to: toUser || toTech,
          subject: 'FixItNow Notification',
          text: message
        }));
      }
  
      // Push notifications disabled (requires OneSignal setup)
      if (type.includes('push')) {
        console.log(`Push notification queued but not sent: ${message} (OneSignal not configured)`);
      }
  
      console.log(`Notification processed: ${message}`);
    }
  } catch (err) {
    console.error('Notification Worker Error:', err);
  }
};

// Start workers (run in background)
const startWorkers = () => {
  if (redisClient && redisClient.isOpen) {
    setInterval(processEmailQueue, 1000); // Process every 1s
    setInterval(processNotificationQueue, 1000);
  } else {
    console.log('Email/Notification workers skipped (Redis unavailable)');
  }
};

module.exports = {
  startWorkers,
  processEmailQueue,
  processNotificationQueue,
  redisClient: redisClient || null
};
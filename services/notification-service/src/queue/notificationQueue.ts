import Bull from 'bull';
import { NotificationService } from '../services/NotificationService';

// Redis connection
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
};

// Create queue
export const notificationQueue = new Bull('notifications', {
  redis: redisConfig,
});

// Initialize notification service
const notificationService = new NotificationService();

// Process email jobs
notificationQueue.process('send-email', async (job) => {
  const { to, subject, body, html, from } = job.data;
  console.log(`📧 Processing email job ${job.id} to ${to}`);
  
  try {
    const result = await notificationService.sendEmail({
      to,
      subject,
      body,
      html,
      from,
    });
    console.log(`✅ Email sent successfully: ${result.messageId}`);
    return result;
  } catch (error: any) {
    console.error(`❌ Failed to send email: ${error.message}`);
    throw error;
  }
});

// Process SMS jobs
notificationQueue.process('send-sms', async (job) => {
  const { to, message } = job.data;
  console.log(`📱 Processing SMS job ${job.id} to ${to}`);
  
  try {
    const result = await notificationService.sendSMS({
      to,
      message,
    });
    console.log(`✅ SMS sent successfully: ${result.messageId}`);
    return result;
  } catch (error: any) {
    console.error(`❌ Failed to send SMS: ${error.message}`);
    throw error;
  }
});

// Queue event listeners
notificationQueue.on('completed', (job, result) => {
  console.log(`✅ Job ${job.id} completed:`, result);
});

notificationQueue.on('failed', (job, err) => {
  console.error(`❌ Job ${job.id} failed:`, err.message);
});

notificationQueue.on('stalled', (job) => {
  console.warn(`⚠️  Job ${job.id} stalled`);
});




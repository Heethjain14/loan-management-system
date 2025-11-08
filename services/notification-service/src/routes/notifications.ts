import { Router } from 'express';
import { z } from 'zod';
import { NotificationService } from '../services/NotificationService';
import { notificationQueue } from '../queue/notificationQueue';

export const notificationRouter = Router();
const notificationService = new NotificationService();

// Validation schemas
const emailSchema = z.object({
  to: z.string().email(),
  subject: z.string().min(1),
  body: z.string().min(1),
  html: z.string().optional(),
  from: z.string().email().optional(),
});

const smsSchema = z.object({
  to: z.string().min(10),
  message: z.string().min(1).max(1600),
});

// Send email (synchronous)
notificationRouter.post('/email', async (req, res) => {
  try {
    const data = emailSchema.parse(req.body);
    const result = await notificationService.sendEmail(data);
    res.json({ success: true, ...result });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: error.errors });
    }
    res.status(500).json({ success: false, error: error.message });
  }
});

// Send email (asynchronous via queue)
notificationRouter.post('/email/async', async (req, res) => {
  try {
    const data = emailSchema.parse(req.body);
    const job = await notificationQueue.add('send-email', data, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
    });
    res.json({ success: true, jobId: job.id, status: 'queued' });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: error.errors });
    }
    res.status(500).json({ success: false, error: error.message });
  }
});

// Send SMS (synchronous)
notificationRouter.post('/sms', async (req, res) => {
  try {
    const data = smsSchema.parse(req.body);
    const result = await notificationService.sendSMS(data);
    res.json({ success: true, ...result });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: error.errors });
    }
    res.status(500).json({ success: false, error: error.message });
  }
});

// Send SMS (asynchronous via queue)
notificationRouter.post('/sms/async', async (req, res) => {
  try {
    const data = smsSchema.parse(req.body);
    const job = await notificationQueue.add('send-sms', data, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
    });
    res.json({ success: true, jobId: job.id, status: 'queued' });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: error.errors });
    }
    res.status(500).json({ success: false, error: error.message });
  }
});

// Send payment reminder (template-based)
notificationRouter.post('/payment-reminder', async (req, res) => {
  try {
    const schema = z.object({
      borrowerName: z.string().min(1),
      borrowerEmail: z.string().email(),
      borrowerPhone: z.string().optional(),
      dueAmount: z.number().positive(),
      dueDate: z.string(),
      sendEmail: z.boolean().default(true),
      sendSMS: z.boolean().default(false),
    });
    
    const data = schema.parse(req.body);
    const results = [];
    
    if (data.sendEmail) {
      const emailResult = await notificationService.sendPaymentReminderEmail({
        borrowerName: data.borrowerName,
        borrowerEmail: data.borrowerEmail,
        dueAmount: data.dueAmount,
        dueDate: data.dueDate,
      });
      results.push({ type: 'email', ...emailResult });
    }
    
    if (data.sendSMS && data.borrowerPhone) {
      const smsResult = await notificationService.sendPaymentReminderSMS({
        borrowerName: data.borrowerName,
        borrowerPhone: data.borrowerPhone,
        dueAmount: data.dueAmount,
        dueDate: data.dueDate,
      });
      results.push({ type: 'sms', ...smsResult });
    }
    
    res.json({ success: true, results });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: error.errors });
    }
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get notification history (placeholder - would need database)
notificationRouter.get('/history', async (req, res) => {
  res.json({
    success: true,
    message: 'History feature coming soon',
    data: [],
  });
});




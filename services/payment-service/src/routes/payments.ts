import { Router } from 'express';
import { z } from 'zod';
import { PaymentService } from '../services/PaymentService';

export const paymentRouter = Router();
const paymentService = new PaymentService();

// Validation schemas
const processPaymentSchema = z.object({
  borrowerId: z.string().min(1),
  amount: z.number().positive(),
  currency: z.string().default('usd'),
  paymentMethod: z.enum(['card', 'ach', 'cash', 'check']),
  paymentMethodId: z.string().optional(), // Stripe payment method ID for card/ACH
  description: z.string().optional(),
  metadata: z.record(z.string()).optional(),
});

const validatePaymentSchema = z.object({
  borrowerId: z.string().min(1),
  amount: z.number().positive(),
  dueAmount: z.number().nonnegative(),
  paymentDate: z.string().optional(),
});

const refundSchema = z.object({
  paymentId: z.string().min(1),
  amount: z.number().positive().optional(), // Partial refund if provided
  reason: z.string().optional(),
});

// Process payment
paymentRouter.post('/process', async (req, res) => {
  try {
    const data = processPaymentSchema.parse(req.body);
    const result = await paymentService.processPayment(data);
    res.json({ success: true, ...result });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: error.errors });
    }
    res.status(500).json({ success: false, error: error.message });
  }
});

// Validate payment
paymentRouter.post('/validate', async (req, res) => {
  try {
    const data = validatePaymentSchema.parse(req.body);
    const validation = await paymentService.validatePayment(data);
    res.json({ success: true, ...validation });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: error.errors });
    }
    res.status(500).json({ success: false, error: error.message });
  }
});

// Process refund
paymentRouter.post('/refund', async (req, res) => {
  try {
    const data = refundSchema.parse(req.body);
    const result = await paymentService.processRefund(data);
    res.json({ success: true, ...result });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: error.errors });
    }
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create payment intent (for Stripe)
paymentRouter.post('/create-intent', async (req, res) => {
  try {
    const schema = z.object({
      amount: z.number().positive(),
      currency: z.string().default('usd'),
      borrowerId: z.string().min(1),
      metadata: z.record(z.string()).optional(),
    });
    
    const data = schema.parse(req.body);
    const result = await paymentService.createPaymentIntent(data);
    res.json({ success: true, ...result });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: error.errors });
    }
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get payment history (placeholder - would need database)
paymentRouter.get('/history/:borrowerId', async (req, res) => {
  res.json({
    success: true,
    message: 'History feature coming soon',
    borrowerId: req.params.borrowerId,
    data: [],
  });
});

// Get payment by ID
paymentRouter.get('/:paymentId', async (req, res) => {
  try {
    const payment = await paymentService.getPayment(req.params.paymentId);
    if (!payment) {
      return res.status(404).json({ success: false, error: 'Payment not found' });
    }
    res.json({ success: true, data: payment });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});




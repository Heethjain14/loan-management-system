import Stripe from 'stripe';

export interface ProcessPaymentData {
  borrowerId: string;
  amount: number;
  currency?: string;
  paymentMethod: 'card' | 'ach' | 'cash' | 'check';
  paymentMethodId?: string;
  description?: string;
  metadata?: Record<string, string>;
}

export interface ValidatePaymentData {
  borrowerId: string;
  amount: number;
  dueAmount: number;
  paymentDate?: string;
}

export interface RefundData {
  paymentId: string;
  amount?: number;
  reason?: string;
}

export interface PaymentIntentData {
  amount: number;
  currency?: string;
  borrowerId: string;
  metadata?: Record<string, string>;
}

export class PaymentService {
  private stripe: Stripe | null = null;
  private stripeSecretKey: string | undefined;

  constructor() {
    this.stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    
    if (this.stripeSecretKey) {
      this.stripe = new Stripe(this.stripeSecretKey, {
        apiVersion: '2024-12-18.acacia',
      });
    } else {
      console.warn('⚠️  STRIPE_SECRET_KEY not set. Stripe payment processing will be disabled.');
    }
  }

  async processPayment(data: ProcessPaymentData): Promise<{
    paymentId: string;
    status: string;
    amount: number;
    method: string;
    transactionId?: string;
    processedAt: string;
  }> {
    // Validate payment amount
    if (data.amount <= 0) {
      throw new Error('Payment amount must be greater than zero');
    }

    // Handle different payment methods
    switch (data.paymentMethod) {
      case 'card':
      case 'ach':
        return this.processStripePayment(data);
      
      case 'cash':
      case 'check':
        return this.processOfflinePayment(data);
      
      default:
        throw new Error(`Unsupported payment method: ${data.paymentMethod}`);
    }
  }

  private async processStripePayment(data: ProcessPaymentData): Promise<{
    paymentId: string;
    status: string;
    amount: number;
    method: string;
    transactionId?: string;
    processedAt: string;
  }> {
    if (!this.stripe) {
      throw new Error('Stripe is not configured');
    }

    if (!data.paymentMethodId) {
      throw new Error('Payment method ID is required for card/ACH payments');
    }

    try {
      // Create payment intent
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(data.amount * 100), // Convert to cents
        currency: data.currency || 'usd',
        payment_method: data.paymentMethodId,
        confirm: true,
        description: data.description || `Payment for borrower ${data.borrowerId}`,
        metadata: {
          borrowerId: data.borrowerId,
          ...data.metadata,
        },
      });

      return {
        paymentId: paymentIntent.id,
        status: paymentIntent.status,
        amount: data.amount,
        method: data.paymentMethod,
        transactionId: paymentIntent.id,
        processedAt: new Date().toISOString(),
      };
    } catch (error: any) {
      console.error('Stripe payment error:', error);
      throw new Error(`Payment processing failed: ${error.message}`);
    }
  }

  private async processOfflinePayment(data: ProcessPaymentData): Promise<{
    paymentId: string;
    status: string;
    amount: number;
    method: string;
    transactionId?: string;
    processedAt: string;
  }> {
    // For cash/check payments, we just record them
    // In a real system, you'd save this to a database
    const paymentId = `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      paymentId,
      status: 'succeeded',
      amount: data.amount,
      method: data.paymentMethod,
      processedAt: new Date().toISOString(),
    };
  }

  async validatePayment(data: ValidatePaymentData): Promise<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
  }> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate amount
    if (data.amount <= 0) {
      errors.push('Payment amount must be greater than zero');
    }

    // Check if payment exceeds due amount
    if (data.amount > data.dueAmount * 1.1) {
      warnings.push('Payment amount exceeds due amount by more than 10%');
    }

    // Validate payment date (if provided)
    if (data.paymentDate) {
      const paymentDate = new Date(data.paymentDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (paymentDate > today) {
        warnings.push('Payment date is in the future');
      }
    }

    // Validate borrower ID format
    if (!data.borrowerId || data.borrowerId.trim().length === 0) {
      errors.push('Borrower ID is required');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  async processRefund(data: RefundData): Promise<{
    refundId: string;
    amount: number;
    status: string;
    processedAt: string;
  }> {
    if (!this.stripe) {
      throw new Error('Stripe is not configured');
    }

    try {
      // Retrieve the payment intent
      const paymentIntent = await this.stripe.paymentIntents.retrieve(data.paymentId);
      
      if (!paymentIntent) {
        throw new Error('Payment not found');
      }

      // Create refund
      const refund = await this.stripe.refunds.create({
        payment_intent: data.paymentId,
        amount: data.amount ? Math.round(data.amount * 100) : undefined, // Partial refund
        reason: data.reason ? (data.reason as Stripe.RefundCreateParams.Reason) : undefined,
      });

      return {
        refundId: refund.id,
        amount: data.amount || paymentIntent.amount / 100,
        status: refund.status,
        processedAt: new Date().toISOString(),
      };
    } catch (error: any) {
      console.error('Refund error:', error);
      throw new Error(`Refund processing failed: ${error.message}`);
    }
  }

  async createPaymentIntent(data: PaymentIntentData): Promise<{
    clientSecret: string;
    paymentIntentId: string;
    amount: number;
  }> {
    if (!this.stripe) {
      throw new Error('Stripe is not configured');
    }

    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(data.amount * 100),
        currency: data.currency || 'usd',
        metadata: {
          borrowerId: data.borrowerId,
          ...data.metadata,
        },
      });

      return {
        clientSecret: paymentIntent.client_secret || '',
        paymentIntentId: paymentIntent.id,
        amount: data.amount,
      };
    } catch (error: any) {
      console.error('Payment intent creation error:', error);
      throw new Error(`Failed to create payment intent: ${error.message}`);
    }
  }

  async getPayment(paymentId: string): Promise<any> {
    if (!this.stripe) {
      throw new Error('Stripe is not configured');
    }

    try {
      const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentId);
      return {
        id: paymentIntent.id,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency,
        status: paymentIntent.status,
        metadata: paymentIntent.metadata,
        created: new Date(paymentIntent.created * 1000).toISOString(),
      };
    } catch (error: any) {
      if (error.code === 'resource_missing') {
        return null;
      }
      throw error;
    }
  }
}




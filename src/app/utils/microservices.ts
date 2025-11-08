// Microservices client utilities

const NOTIFICATION_SERVICE_URL = process.env.NEXT_PUBLIC_NOTIFICATION_SERVICE_URL || 'http://localhost:3001';
const PAYMENT_SERVICE_URL = process.env.NEXT_PUBLIC_PAYMENT_SERVICE_URL || 'http://localhost:3002';

export interface NotificationResponse {
  success: boolean;
  messageId?: string;
  sentAt?: string;
  error?: string;
}

export interface PaymentResponse {
  success: boolean;
  paymentId?: string;
  status?: string;
  error?: string;
}

/**
 * Send email notification via Notification Service
 */
export async function sendEmailNotification(data: {
  to: string;
  subject: string;
  body: string;
  html?: string;
}): Promise<NotificationResponse> {
  try {
    const response = await fetch(`${NOTIFICATION_SERVICE_URL}/api/v1/notifications/email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error || 'Failed to send email');
    }
    return result;
  } catch (error: any) {
    console.error('Email notification error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Send email notification asynchronously via Notification Service
 */
export async function sendEmailNotificationAsync(data: {
  to: string;
  subject: string;
  body: string;
  html?: string;
}): Promise<NotificationResponse> {
  try {
    const response = await fetch(`${NOTIFICATION_SERVICE_URL}/api/v1/notifications/email/async`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error || 'Failed to queue email');
    }
    return result;
  } catch (error: any) {
    console.error('Email notification error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Send SMS notification via Notification Service
 */
export async function sendSMSNotification(data: {
  to: string;
  message: string;
}): Promise<NotificationResponse> {
  try {
    const response = await fetch(`${NOTIFICATION_SERVICE_URL}/api/v1/notifications/sms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error || 'Failed to send SMS');
    }
    return result;
  } catch (error: any) {
    console.error('SMS notification error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Send payment reminder via Notification Service
 */
export async function sendPaymentReminder(data: {
  borrowerName: string;
  borrowerEmail: string;
  borrowerPhone?: string;
  dueAmount: number;
  dueDate: string;
  sendEmail?: boolean;
  sendSMS?: boolean;
}): Promise<{ success: boolean; results?: any[]; error?: string }> {
  try {
    const response = await fetch(`${NOTIFICATION_SERVICE_URL}/api/v1/notifications/payment-reminder`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sendEmail: true,
        sendSMS: false,
        ...data,
      }),
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error || 'Failed to send payment reminder');
    }
    return result;
  } catch (error: any) {
    console.error('Payment reminder error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Process payment via Payment Service
 */
export async function processPayment(data: {
  borrowerId: string;
  amount: number;
  currency?: string;
  paymentMethod: 'card' | 'ach' | 'cash' | 'check';
  paymentMethodId?: string;
  description?: string;
  metadata?: Record<string, string>;
}): Promise<PaymentResponse> {
  try {
    const response = await fetch(`${PAYMENT_SERVICE_URL}/api/v1/payments/process`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error || 'Failed to process payment');
    }
    return result;
  } catch (error: any) {
    console.error('Payment processing error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Validate payment via Payment Service
 */
export async function validatePayment(data: {
  borrowerId: string;
  amount: number;
  dueAmount: number;
  paymentDate?: string;
}): Promise<{ success: boolean; isValid?: boolean; errors?: string[]; warnings?: string[]; error?: string }> {
  try {
    const response = await fetch(`${PAYMENT_SERVICE_URL}/api/v1/payments/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error || 'Failed to validate payment');
    }
    return result;
  } catch (error: any) {
    console.error('Payment validation error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Create payment intent via Payment Service (for Stripe)
 */
export async function createPaymentIntent(data: {
  amount: number;
  currency?: string;
  borrowerId: string;
  metadata?: Record<string, string>;
}): Promise<{ success: boolean; clientSecret?: string; paymentIntentId?: string; error?: string }> {
  try {
    const response = await fetch(`${PAYMENT_SERVICE_URL}/api/v1/payments/create-intent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error || 'Failed to create payment intent');
    }
    return result;
  } catch (error: any) {
    console.error('Payment intent creation error:', error);
    return { success: false, error: error.message };
  }
}




import sgMail from '@sendgrid/mail';
import twilio from 'twilio';

export interface EmailData {
  to: string;
  subject: string;
  body: string;
  html?: string;
  from?: string;
}

export interface SMSData {
  to: string;
  message: string;
}

export class NotificationService {
  private sendGridApiKey: string;
  private fromEmail: string;
  private twilioAccountSid: string | undefined;
  private twilioAuthToken: string | undefined;
  private twilioPhoneNumber: string | undefined;
  private twilioClient: twilio.Twilio | null = null;

  constructor() {
    this.sendGridApiKey = process.env.SENDGRID_API_KEY || '';
    this.fromEmail = process.env.FROM_EMAIL || 'noreply@loanmanagement.com';
    
    if (!this.sendGridApiKey) {
      console.warn('⚠️  SENDGRID_API_KEY not set. Email functionality will be disabled.');
    } else {
      sgMail.setApiKey(this.sendGridApiKey);
    }

    // Twilio configuration (optional)
    this.twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
    this.twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
    this.twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

    if (this.twilioAccountSid && this.twilioAuthToken) {
      this.twilioClient = twilio(this.twilioAccountSid, this.twilioAuthToken);
    } else {
      console.warn('⚠️  Twilio credentials not set. SMS functionality will be disabled.');
    }
  }

  async sendEmail(data: EmailData): Promise<{ messageId?: string; sentAt: string }> {
    if (!this.sendGridApiKey) {
      throw new Error('SendGrid API key not configured');
    }

    try {
      const msg = {
        to: data.to,
        from: data.from || this.fromEmail,
        subject: data.subject,
        text: data.body,
        html: data.html || data.body.replace(/\n/g, '<br>'),
      };

      const [response] = await sgMail.send(msg);
      
      return {
        messageId: response.headers['x-message-id'] as string,
        sentAt: new Date().toISOString(),
      };
    } catch (error: any) {
      console.error('Error sending email:', error);
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }

  async sendSMS(data: SMSData): Promise<{ messageId?: string; sentAt: string }> {
    if (!this.twilioClient || !this.twilioPhoneNumber) {
      throw new Error('Twilio not configured');
    }

    try {
      const message = await this.twilioClient.messages.create({
        body: data.message,
        from: this.twilioPhoneNumber,
        to: data.to,
      });

      return {
        messageId: message.sid,
        sentAt: new Date().toISOString(),
      };
    } catch (error: any) {
      console.error('Error sending SMS:', error);
      throw new Error(`Failed to send SMS: ${error.message}`);
    }
  }

  async sendPaymentReminderEmail(data: {
    borrowerName: string;
    borrowerEmail: string;
    dueAmount: number;
    dueDate: string;
  }): Promise<{ messageId?: string; sentAt: string }> {
    const subject = `Payment Due Reminder for ${data.borrowerName}`;
    const formattedAmount = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(data.dueAmount);

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Payment Reminder</h2>
        <p>Hello ${data.borrowerName},</p>
        <p>This is a friendly reminder that you have a payment due.</p>
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0;"><strong>Due Amount:</strong> ${formattedAmount}</p>
          <p style="margin: 10px 0 0 0;"><strong>Due Date:</strong> ${new Date(data.dueDate).toLocaleDateString()}</p>
        </div>
        <p>Please make a payment at your earliest convenience.</p>
        <p>Thank you for your business.</p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
        <p style="color: #6b7280; font-size: 12px;">This is an automated message. Please do not reply to this email.</p>
      </div>
    `;

    const text = `Hello ${data.borrowerName},\n\nThis is a friendly reminder that your due amount is ${formattedAmount} with a due date of ${new Date(data.dueDate).toLocaleDateString()}. Please make a payment at your earliest convenience.\n\nThank you.`;

    return this.sendEmail({
      to: data.borrowerEmail,
      subject,
      body: text,
      html,
    });
  }

  async sendPaymentReminderSMS(data: {
    borrowerName: string;
    borrowerPhone: string;
    dueAmount: number;
    dueDate: string;
  }): Promise<{ messageId?: string; sentAt: string }> {
    const formattedAmount = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(data.dueAmount);

    const message = `Hi ${data.borrowerName}, payment reminder: ${formattedAmount} due on ${new Date(data.dueDate).toLocaleDateString()}. Please make payment soon. Thank you!`;

    return this.sendSMS({
      to: data.borrowerPhone,
      message,
    });
  }
}




import { NextResponse } from 'next/server';
import { sendEmailNotification } from '../../utils/microservices';

/**
 * Legacy notification endpoint - now proxies to Notification Service
 * This maintains backward compatibility while using the microservice
 */
export async function POST(req: Request) {
  try {
    const { to, subject, body } = await req.json();
    if (!to || !subject || !body) {
      return NextResponse.json({ ok: false, error: 'Missing fields' }, { status: 400 });
    }

    // Use the Notification Service
    const result = await sendEmailNotification({ to, subject, body });
    
    if (!result.success) {
      return NextResponse.json({ ok: false, error: result.error || 'Failed to send email' }, { status: 500 });
    }

    return NextResponse.json({ ok: true, messageId: result.messageId });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'Unknown error' }, { status: 500 });
  }
}



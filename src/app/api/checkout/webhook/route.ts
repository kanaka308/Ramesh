import { NextRequest, NextResponse } from 'next/server';
import db from '@/db';
import { verifyWebhookSignature } from '@/lib/payments';
import { config } from '@/lib/config';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-razorpay-signature');

    if (!signature) {
      return NextResponse.json({ success: false, error: 'Signature header missing' }, { status: 400 });
    }

    // Verify webhook signature
    const isValid = verifyWebhookSignature(rawBody, signature, config.razorpay.webhookSecret);

    if (!isValid) {
      return NextResponse.json({ success: false, error: 'Invalid signature' }, { status: 400 });
    }

    const payload = JSON.parse(rawBody);

    if (payload.event === 'payment.captured') {
      const orderId = payload.payload.payment.entity.order_id;
      
      // Update purchase record to completed
      db.prepare("UPDATE purchases SET status = 'completed', purchased_at = ? WHERE payment_id = ? AND status != 'completed'")
        .run(new Date().toISOString(), orderId);
        
      console.log(`[Webhook] Unlocked course access for Order ID: ${orderId}`);
    }

    return NextResponse.json({ status: 'processed' });

  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import db from '@/db';
import { verifyWebhookSignature } from '@/lib/payments';
import { config } from '@/lib/config';

export async function POST(req: NextRequest) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { success: false, error: 'Invalid payment response arguments.' },
        { status: 400 }
      );
    }

    let isValid = false;

    if (config.razorpay.keyId === 'rzp_test_mock_id' || razorpay_order_id.startsWith('order_mock_')) {
      // Mock validation
      isValid = true;
    } else {
      // HMAC-SHA256 signature verification
      const rawText = `${razorpay_order_id}|${razorpay_payment_id}`;
      isValid = verifyWebhookSignature(rawText, razorpay_signature, config.razorpay.keySecret);
    }

    if (isValid) {
      // Update purchase record to completed
      const updateResult = db.prepare("UPDATE purchases SET status = 'completed', purchased_at = ? WHERE payment_id = ?")
        .run(new Date().toISOString(), razorpay_order_id);

      if (updateResult.changes > 0) {
        return NextResponse.json({ success: true, message: 'Payment verified and unlocked.' });
      } else {
        return NextResponse.json(
          { success: false, error: 'Order record not found in system.' },
          { status: 404 }
        );
      }
    } else {
      return NextResponse.json(
        { success: false, error: 'Signature mismatch. Unauthorized transaction.' },
        { status: 400 }
      );
    }

  } catch (error: any) {
    console.error('Error verifying payment:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server verification error.' },
      { status: 500 }
    );
  }
}

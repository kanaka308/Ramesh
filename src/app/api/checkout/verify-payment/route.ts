import { NextRequest, NextResponse } from 'next/server';
import repo from '@/db/repo';
import { verifyWebhookSignature } from '@/lib/payments';
import { config } from '@/lib/config';

export const dynamic = 'force-dynamic';

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
      let updated = await repo.completePurchase(razorpay_order_id);
      let isMaterial = false;

      if (!updated) {
        updated = await repo.completeMaterialPurchase(razorpay_order_id);
        isMaterial = true;
      }

      if (updated) {
        // Create admin notification (preventing duplicates)
        const notifCheck = await repo.checkNotificationExists(`%${razorpay_order_id}%`);
        if (!notifCheck) {
          if (isMaterial) {
            const order = await repo.getMaterialOrderById(razorpay_order_id);
            if (order) {
              const materials = await repo.getMaterials();
              const mat = materials.find(m => m.id === order.materialId);
              await repo.addNotification(
                'New Material Purchase',
                `User ${order.email} purchased template "${mat ? mat.title : 'Unknown'}" for ₹${(mat ? mat.price : 0) / 100} (Order ID: ${razorpay_order_id})`,
                'payment'
              );
            }
          } else {
            const purchase = await repo.getPurchaseByPaymentId(razorpay_order_id);

            if (purchase) {
              await repo.addNotification(
                'New Course Purchase',
                `Student ${purchase.student_email} purchased "${purchase.course_title}" for ₹${purchase.price / 100} (Order ID: ${razorpay_order_id})`,
                'payment'
              );
            }
          }
        }
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

import { NextRequest, NextResponse } from 'next/server';
import repo from '@/db/repo';
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
      let updated = await repo.completePurchase(orderId);
      let isMaterial = false;
      if (!updated) {
        updated = await repo.completeMaterialPurchase(orderId);
        isMaterial = true;
      }
        
      console.log(`[Webhook] Unlocked ${isMaterial ? 'material' : 'course'} access for Order ID: ${orderId}`);

      // Create admin notification (preventing duplicates)
      const notifCheck = await repo.checkNotificationExists(`%${orderId}%`);
      if (!notifCheck && updated) {
        if (isMaterial) {
          const order = await repo.getMaterialOrderById(orderId);
          if (order) {
            const materials = await repo.getMaterials();
            const mat = materials.find(m => m.id === order.materialId);
            await repo.addNotification(
              'New Material Purchase',
              `User ${order.email} purchased template "${mat ? mat.title : 'Unknown'}" for ₹${(mat ? mat.price : 0) / 100} (Order ID: ${orderId})`,
              'payment'
            );
          }
        } else {
          const purchase = await repo.getPurchaseByPaymentId(orderId);

          if (purchase) {
            await repo.addNotification(
              'New Course Purchase',
              `Student ${purchase.student_email} purchased "${purchase.course_title}" for ₹${purchase.price / 100} (Order ID: ${orderId})`,
              'payment'
            );
          }
        }
      }
    }

    return NextResponse.json({ status: 'processed' });

  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

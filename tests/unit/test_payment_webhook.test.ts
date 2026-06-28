import { verifyWebhookSignature } from '@/lib/payments';
import crypto from 'crypto';

describe('Payment Webhook Verification', () => {
  const secret = 'webhook_signing_secret';
  const body = JSON.stringify({
    event: 'payment.captured',
    payload: {
      payment: {
        entity: {
          id: 'pay_Hj12ksJaa9',
          order_id: 'order_Hj28ksJa9P',
          amount: 99900
        }
      }
    }
  });

  it('should pass validation when signature matches the payload', () => {
    const signature = crypto
      .createHmac('sha256', secret)
      .update(body)
      .digest('hex');

    const isValid = verifyWebhookSignature(body, signature, secret);
    expect(isValid).toBe(true);
  });

  it('should fail validation when signature does not match the payload', () => {
    const signature = 'incorrect_signature';
    const isValid = verifyWebhookSignature(body, signature, secret);
    expect(isValid).toBe(false);
  });
});

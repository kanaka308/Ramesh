import crypto from 'crypto';

export const verifyWebhookSignature = (body: string, signature: string, secret: string): boolean => {
  try {
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body)
      .digest('hex');
    
    // Constant time comparison to prevent timing attacks
    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature, 'hex'),
      Buffer.from(signature, 'hex')
    );
  } catch (error) {
    return false;
  }
};

export const config = {
  appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  databaseUrl: process.env.DATABASE_URL || 'academy.db',
  jwtSecret: process.env.JWT_SECRET || 'fallback_jwt_signing_secret_for_development_purposes',
  
  smtp: {
    host: process.env.SMTP_HOST || 'smtp.mailtrap.io',
    port: parseInt(process.env.SMTP_PORT || '2525', 10),
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.SMTP_FROM || 'academy@example.com',
  },
  
  razorpay: {
    keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_mock_id',
    keySecret: process.env.RAZORPAY_KEY_SECRET || 'mock_secret_key',
    webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET || 'mock_webhook_secret',
  },
  
  admin: {
    username: process.env.ADMIN_USERNAME || 'ramesh',
    password: process.env.ADMIN_PASSWORD || 'ramesh123',
  }
};

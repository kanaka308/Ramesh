import nodemailer from 'nodemailer';
import { config } from './config';

const transporter = nodemailer.createTransport({
  host: config.smtp.host,
  port: config.smtp.port,
  auth: {
    user: config.smtp.user,
    pass: config.smtp.pass,
  },
});

export const sendMagicLinkEmail = async (email: string, token: string) => {
  const loginUrl = `${config.appUrl}/api/auth/verify?token=${token}`;
  
  const mailOptions = {
    from: config.smtp.from,
    to: email,
    subject: 'Login to Photography Academy Storefront',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
        <h2 style="color: #111; text-align: center;">Photography Academy</h2>
        <p>Hello,</p>
        <p>You requested a login link to access your recorded photography/cinematography courses. Click the button below to sign in instantly:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${loginUrl}" style="background-color: #111; color: #fff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold; display: inline-block;">Sign In Instantly</a>
        </div>
        <p style="color: #666; font-size: 14px;">This link will expire in 15 minutes. If you did not make this request, you can safely ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #eee;" />
        <p style="color: #999; font-size: 12px; text-align: center;">Vijayapur Academy of Photography & Production</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

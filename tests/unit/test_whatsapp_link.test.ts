import { generateWhatsAppLink } from '@/lib/whatsapp';

describe('WhatsApp Link Generator', () => {
  it('should generate a valid wa.me URL with phone and message encoded', () => {
    const phone = '919900000000';
    const message = "Hi, I'm interested in the 30-day Photography Bootcamp in Vijayapur.";
    const expected = 'https://wa.me/919900000000?text=Hi%2C%20I%27m%20interested%20in%20the%2030-day%20Photography%20Bootcamp%20in%20Vijayapur.';
    
    const result = generateWhatsAppLink(phone, message);
    expect(result).toBe(expected);
  });

  it('should clean non-numeric characters from the phone number', () => {
    const phone = '+91 99000-00000';
    const message = 'Hello';
    const expected = 'https://wa.me/919900000000?text=Hello';
    
    const result = generateWhatsAppLink(phone, message);
    expect(result).toBe(expected);
  });
});

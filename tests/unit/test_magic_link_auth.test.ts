import { generateMagicLinkToken, verifyMagicLinkToken } from '@/lib/auth';

describe('Magic Link Authentication', () => {
  it('should generate a token and verify it successfully for the correct email', () => {
    const email = 'student@test.com';
    const token = generateMagicLinkToken(email);
    
    expect(token).toBeDefined();
    expect(typeof token).toBe('string');
    
    const verifiedEmail = verifyMagicLinkToken(token);
    expect(verifiedEmail).toBe(email);
  });

  it('should return null for expired or manipulated tokens', () => {
    const invalidToken = 'this_is_clearly_not_a_valid_jwt_token';
    const result = verifyMagicLinkToken(invalidToken);
    
    expect(result).toBeNull();
  });
});

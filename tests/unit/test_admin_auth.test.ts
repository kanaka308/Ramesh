import { verifyAdminCredentials } from '@/lib/auth';
import { config } from '@/lib/config';

describe('Admin Authentication', () => {
  it('should validate correct admin credentials', () => {
    // Expected default config admin user
    const username = config.admin.username;
    const password = config.admin.password;
    
    const isValid = verifyAdminCredentials(username, password);
    expect(isValid).toBe(true);
  });

  it('should reject incorrect username or password', () => {
    const isValid = verifyAdminCredentials('wrong_user', 'wrong_pass');
    expect(isValid).toBe(false);
  });
});

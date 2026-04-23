import { test, expect } from '@playwright/test';

// Docker එක ඇතුලෙදි run වෙද්දි මේක ඉබේම 'http://web:5173' විදිහට හැදෙනවා
// ඔයාගේ කම්පියුටර් එකේ නිකන් run කරද්දි 'http://localhost:5173' විදිහට වැඩ කරනවා.
const baseURL = process.env.BASE_URL || 'http://localhost:5173';

test.describe('Login Page Tests', () => {
  
  test('1. Should display the login form correctly', async ({ page }) => {
    // 1. Login page එකට යන්න
    await page.goto(`${baseURL}/login`);
    
    // 2. Page එකේ තියෙන්න ඕනේ ප්‍රධාන දේවල් පෙන්නනවද කියලා check කරනවා
    await expect(page.getByRole('heading', { name: 'Welcome back!' })).toBeVisible();
    await expect(page.getByPlaceholder('john@example.com')).toBeVisible();
    await expect(page.getByPlaceholder('Enter your password')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign In →' })).toBeVisible();
  });

  test('2. Should show validation errors when submitting empty fields', async ({ page }) => {
    await page.goto(`${baseURL}/login`);
    
    // මුකුත් type කරන්නේ නැතුව Sign In button එක click කරනවා
    await page.getByRole('button', { name: 'Sign In →' }).click();
    
    // Error messages පෙන්නනවද කියලා check කරනවා
    await expect(page.getByText('Email field cannot be empty.')).toBeVisible();
    await expect(page.getByText('Password field cannot be empty.')).toBeVisible();
  });

  test('3. Should show error for invalid email format', async ({ page }) => {
    await page.goto(`${baseURL}/login`);
    
    // වැරදි email එකක් type කරනවා
    await page.getByPlaceholder('john@example.com').fill('invalid-email-format');
    await page.getByPlaceholder('Enter your password').fill('password123');
    
    // Sign In button එක click කරනවා
    await page.getByRole('button', { name: 'Sign In →' }).click();
    
    // Email එක වැරදියි කියන error එක පෙන්නනවද කියලා check කරනවා
    await expect(page.getByText('Please enter a valid email address.')).toBeVisible();
  });

});

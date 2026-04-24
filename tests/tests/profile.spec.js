const { test, expect } = require('@playwright/test');

test.describe('Student Profile Management', () => {
  const randomAlpha = () => String.fromCharCode(...Array.from({length: 8}, () => Math.floor(Math.random() * 26) + 97));
  let testUser = {
    username: `Test User ${randomAlpha()}`,
    email: `student_${Date.now()}@test.com`,
    password: 'password123'
  };

  test('should register, view profile, and edit username', async ({ page }) => {
    // 1. Sign up through the UI
    await page.goto('/signup');
    await page.getByPlaceholder('John Doe').fill(testUser.username);
    await page.getByPlaceholder('john@example.com').fill(testUser.email);
    await page.getByPlaceholder('Min. 8 characters').fill(testUser.password);
    // Student is the default role in the dropdown
    await page.getByRole('button', { name: 'Get Started' }).click();

    // After signup, it navigates to login
    await expect(page).toHaveURL(/\/login/);

    // 2. Login
    await page.fill('input[type="email"]', testUser.email);
    await page.fill('input[type="password"]', testUser.password);
    await page.click('button[type="submit"]');

    // 3. Wait for dashboard and navigate to profile
    await expect(page).toHaveURL(/\/student-dashboard/);
    
    // Go to profile
    await page.goto('/student-dashboard/profile');

    // 4. Verify Profile Page loaded correctly
    await expect(page.getByRole('heading', { name: 'Profile Settings' })).toBeVisible();
    await expect(page.getByText(testUser.email, { exact: true })).toBeVisible();

    // 5. Edit Profile
    await page.getByRole('button', { name: 'Edit' }).click();
    
    // Change username - making sure it's under 20 chars and only letters/spaces
    const newUsername = `Upd ${randomAlpha().substring(0, 5)}`;
    const usernameInput = page.locator('input[type="text"]').first();
    await usernameInput.fill('');
    await usernameInput.fill(newUsername);
    
    // Save
    await page.getByRole('button', { name: 'Save Changes' }).click();

    // 6. Verify the update persisted
    await expect(page.getByText(newUsername)).toBeVisible();
  });
});

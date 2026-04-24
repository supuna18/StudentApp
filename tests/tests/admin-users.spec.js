const { test, expect } = require('@playwright/test');

test.describe('Admin User Management', () => {
  const randomAlpha = () => String.fromCharCode(...Array.from({length: 8}, () => Math.floor(Math.random() * 26) + 97));
  let adminUser = {
    username: `Admin User ${randomAlpha()}`,
    email: `admin_${Date.now()}@test.com`,
    password: 'password123'
  };

  test('Admin should be able to register, view users, and add a new user via modal', async ({ page }) => {
    // 1. Sign up as Admin through the UI
    await page.goto('/signup');
    await page.getByPlaceholder('John Doe').fill(adminUser.username);
    
    // Select Admin role
    await page.locator('select').selectOption('Admin');
    
    await page.getByPlaceholder('john@example.com').fill(adminUser.email);
    await page.getByPlaceholder('Min. 8 characters').fill(adminUser.password);
    await page.getByRole('button', { name: 'Get Started' }).click();

    // Navigate to login
    await expect(page).toHaveURL(/\/login/);

    // 2. Login as Admin
    await page.fill('input[type="email"]', adminUser.email);
    await page.fill('input[type="password"]', adminUser.password);
    await page.click('button[type="submit"]');

    // 3. Navigate to Admin Dashboard (User Management is usually a tab or default view)
    await expect(page).toHaveURL(/\/admin-dashboard/);
    
    // Ensure we are on User Management tab (click if necessary)
    await page.getByRole('button', { name: 'User Management' }).click();
    
    // 4. Verify the table loads
    await expect(page.getByText('All Users')).toBeVisible();

    // 5. Add a new user via the Admin panel
    await page.getByRole('button', { name: 'Add User' }).click();
    
    // Fill the Add User modal
    const newUserEmail = `newstd${Date.now()}@test.com`;
    const newUserName = `Std ${randomAlpha().substring(0, 5)}`;
    
    await page.getByPlaceholder('John Doe').fill(newUserName);
    await page.getByPlaceholder('john@example.com').fill(newUserEmail);
    await page.getByPlaceholder('••••••••').fill('password123');
    
    // Submit the form
    await page.getByRole('button', { name: 'Add User', exact: true }).click();

    // 6. Handle standard alert
    page.on('dialog', dialog => dialog.accept());

    // 7. Verify the newly added user appears in the list
    await page.getByPlaceholder('Search users…').fill(newUserEmail);
    await expect(page.getByText(newUserName)).toBeVisible();
    await expect(page.getByText(newUserEmail)).toBeVisible();
  });
});

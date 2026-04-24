const { test, expect } = require('@playwright/test');

test.describe('Member 3: Wellbeing & Habit Tracking Workflow', () => {
  const randomAlpha = () => String.fromCharCode(...Array.from({length: 8}, () => Math.floor(Math.random() * 26) + 97));
  
  const student = {
    username: `Student ${randomAlpha()}`,
    email: `wellbeing_${Date.now()}@test.com`,
    password: 'password123'
  };

  test('1. Freedom Path (Student Habit Tracker)', async ({ page }) => {
    // Signup & Login
    await page.goto('/signup');
    await page.getByPlaceholder('John Doe').fill(student.username);
    await page.getByPlaceholder('john@example.com').fill(student.email);
    await page.getByPlaceholder('Min. 8 characters').fill('Password@123'); // Stronger password
    await page.getByRole('button', { name: 'Get Started' }).click();

    // Check if there is a server error message
    const serverError = page.locator('div.text-red-500').first();
    if (await serverError.isVisible({ timeout: 5000 })) {
        const errorText = await serverError.textContent();
        console.error("Signup failed with error:", errorText);
    }

    await expect(page).toHaveURL(/\/login/, { timeout: 15000 });

    await page.fill('input[type="email"]', student.email);
    await page.fill('input[type="password"]', 'Password@123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/student-dashboard/);

    // Navigate to Freedom Path
    await page.goto('/student-dashboard/habit-impact');
    await expect(page.getByText('Freedom Path')).toBeVisible();

    // Configure Baseline
    await page.getByRole('button', { name: 'Configure Dashboard' }).click();
    await page.locator('input[type="number"]').nth(0).fill('10'); // Daily average
    await page.locator('input[type="number"]').nth(1).fill('1600'); // Pack price
    await page.locator('input[type="number"]').nth(2).fill('5'); // Years active
    await page.getByRole('button', { name: 'Initialize Journey' }).click();

    // Verify Active Journey
    await expect(page.getByText('Active Journey')).toBeVisible();

    // Mark Today Clean
    await page.getByRole('button', { name: 'Mark Today Clean' }).click();
    await expect(page.getByText('Another clean day!')).toBeVisible();

    // Log Usage
    await page.getByPlaceholder('0').fill('2');
    await page.getByRole('button', { name: 'Rs.160' }).click();
    await page.getByRole('button', { name: 'Add Log Entry' }).click();

    // Verify Log in History
    await expect(page.getByText('2 units')).toBeVisible();
    await expect(page.getByText('Price: Rs.160')).toBeVisible();
  });

  test('2. Wellbeing Intelligence (Admin Telemetry View)', async ({ page }) => {
    // 1. Sign up as Admin through the UI
    const adminUser = {
      username: `Admin ${randomAlpha()}`,
      email: `admin_${Date.now()}@test.com`,
      password: 'password123'
    };

    await page.goto('/signup');
    await page.getByPlaceholder('John Doe').fill(adminUser.username);
    await page.locator('select').selectOption('Admin');
    await page.getByPlaceholder('john@example.com').fill(adminUser.email);
    await page.getByPlaceholder('Min. 8 characters').fill(adminUser.password);
    await page.getByRole('button', { name: 'Get Started' }).click();

    await expect(page).toHaveURL(/\/login/, { timeout: 15000 });

    // Admin Login
    await page.fill('input[type="email"]', adminUser.email);
    await page.fill('input[type="password"]', adminUser.password);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/admin-dashboard/);

    // Navigate to Digital Wellbeing Tab
    await page.getByRole('button', { name: 'Digital Wellbeing' }).click();

    // Verify Intelligence Dashboard is loaded
    await expect(page.getByText('Wellbeing Intelligence')).toBeVisible();
    await expect(page.getByText('High-Traffic Nodes')).toBeVisible();
    await expect(page.getByText('Tracked Students')).toBeVisible();
    
    // Check if the student table is visible
    await expect(page.getByPlaceholder('Search students...')).toBeVisible();
  });
});

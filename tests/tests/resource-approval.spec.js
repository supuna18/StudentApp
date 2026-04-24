const { test, expect } = require('@playwright/test');
const path = require('path');

test.describe('Resource Upload and Approval Workflow', () => {
  const randomAlpha = () => String.fromCharCode(...Array.from({length: 8}, () => Math.floor(Math.random() * 26) + 97));

  let student = {
    username: `Student User ${randomAlpha()}`,
    email: `res_student_${Date.now()}@test.com`,
    password: 'password123'
  };

  let admin = {
    username: `Admin User ${randomAlpha()}`,
    email: `res_admin_${Date.now()}@test.com`,
    password: 'password123'
  };

  const resourceTitle = `Res ${randomAlpha().substring(0, 5)}`;

  test('Student uploads resource, Admin approves it', async ({ page }) => {
    // --- PART 0: SIGNUP BOTH USERS ---
    
    // 1. Sign up Student
    await page.goto('/signup');
    await page.getByPlaceholder('John Doe').fill(student.username);
    // Student is default role
    await page.getByPlaceholder('john@example.com').fill(student.email);
    await page.getByPlaceholder('Min. 8 characters').fill(student.password);
    await page.getByRole('button', { name: 'Get Started' }).click();
    await expect(page).toHaveURL(/\/login/);

    // 2. Sign up Admin
    await page.goto('/signup');
    await page.getByPlaceholder('John Doe').fill(admin.username);
    await page.locator('select').selectOption('Admin');
    await page.getByPlaceholder('john@example.com').fill(admin.email);
    await page.getByPlaceholder('Min. 8 characters').fill(admin.password);
    await page.getByRole('button', { name: 'Get Started' }).click();
    await expect(page).toHaveURL(/\/login/);

    // --- PART 1: STUDENT UPLOADS RESOURCE ---
    await page.fill('input[type="email"]', student.email);
    await page.fill('input[type="password"]', student.password);
    await page.click('button[type="submit"]');

    // Go to Resources
    await expect(page).toHaveURL(/\/student-dashboard/);
    await page.goto('/student-dashboard/resources');

    // Click Upload
    await page.getByRole('button', { name: 'Upload Resource' }).click();

    // Fill the form
    await page.locator('input[name="title"]').fill(resourceTitle);
    await page.locator('select[name="category"]').selectOption('Computer Science');
    await page.locator('textarea[name="description"]').fill('This is a test description for the E2E workflow testing.');
    
    // Attach file
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(path.join(__dirname, 'dummy.pdf'));

    // Submit
    await page.getByRole('button', { name: 'Share Resource' }).click();

    // Verify it appears as Pending
    await expect(page.getByText('Resource uploaded successfully!')).toBeVisible();
    await expect(page.getByText(resourceTitle)).toBeVisible();
    await expect(page.locator('.bg-amber-50', { hasText: 'Pending' }).first()).toBeVisible();

    // Log out by clearing storage
    await page.evaluate(() => localStorage.clear());

    // --- PART 2: ADMIN APPROVES RESOURCE ---
    await page.goto('/login');
    await page.fill('input[type="email"]', admin.email);
    await page.fill('input[type="password"]', admin.password);
    await page.click('button[type="submit"]');

    // Go to Admin Dashboard -> Resource Manager
    await expect(page).toHaveURL(/\/admin-dashboard/);
    await page.getByRole('button', { name: 'Resource Manager' }).click();

    // Find the resource
    await page.getByPlaceholder('Search resources...').fill(resourceTitle);
    
    // Verify it is PENDING
    await expect(page.getByText(resourceTitle)).toBeVisible();
    await expect(page.getByText('PENDING')).toBeVisible();

    // Approve the resource
    await page.locator(`button[title="Approve Resource"]`).first().click();

    // Verify it changed to APPROVED
    await expect(page.getByText('APPROVED')).toBeVisible();
  });
});

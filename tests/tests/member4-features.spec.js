const { test, expect } = require('@playwright/test');

test.describe.serial('Member 4: Bloom, Mindfulness, and Safety Reports', () => {
  const randomAlpha = () => String.fromCharCode(...Array.from({length: 8}, () => Math.floor(Math.random() * 26) + 97));
  
  const student = {
    username: `Student ${randomAlpha()}`,
    email: `member4_${Date.now()}@test.com`,
    password: 'password123'
  };

  const admin = {
    username: `Admin ${randomAlpha()}`,
    email: `admin_m4_${Date.now()}@test.com`,
    password: 'password123'
  };

  const testUrl = `https://badsite-${Date.now()}.com`;

  // --- 1. Student Signup ---
  test('0. Setup Student Account', async ({ page }) => {
    await page.goto('/signup');
    await page.getByPlaceholder('John Doe').fill(student.username);
    await page.getByPlaceholder('john@example.com').fill(student.email);
    await page.getByPlaceholder('Min. 8 characters').fill(student.password);
    await page.getByRole('button', { name: 'Get Started' }).click();
    await expect(page).toHaveURL(/\/login/, { timeout: 15000 });
  });

  // --- 2. Bloom Tracking ---
  test('1. Bloom: Log Period and Daily Mood', async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('input[type="email"]', student.email);
    await page.fill('input[type="password"]', student.password);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/student-dashboard/);

    // Go to Bloom
    await page.goto('/student-dashboard/bloom');
    
    // Log Period
    await page.getByRole('button', { name: 'Log Period' }).click();
    await page.getByRole('button', { name: 'Save record' }).click();
    
    // Verify success toast
    await expect(page.getByText('Records Updated Successfully!')).toBeVisible();

    // Log Mood
    await page.getByRole('button', { name: 'Log Mood & Wellness' }).click();
    await page.getByRole('button', { name: 'Normal', exact: true }).last().click();
    await page.getByRole('button', { name: 'Calm', exact: true }).last().click();
    await page.getByPlaceholder('How are you feeling today?').fill('Feeling peaceful and relaxed.');
    await page.getByRole('button', { name: 'Save Entry' }).click();

    // Verify
    await expect(page.getByText('Calm')).toBeVisible();
  });

  // --- 3. Mindfulness Zone ---
  test('2. Mindfulness Zone: Start Breathing Exercise', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', student.email);
    await page.fill('input[type="password"]', student.password);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/student-dashboard/);

    // Go to Mindfulness Zone
    await page.goto('/student-dashboard/wellness');

    // Select 'Box' Exercise
    await page.getByRole('heading', { name: 'Box' }).click();

    // Start Session
    await page.getByRole('button', { name: 'Activate Session' }).click();

    // Wait a bit to ensure timer starts
    await page.waitForTimeout(2000);

    // Pause Session
    await page.getByRole('button', { name: 'PAUSE FOCUS' }).click();
  });

  // --- 4. Safety Reports (Student) ---
  test('3. Safety Reports: Submit a Suspicious Link', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', student.email);
    await page.fill('input[type="password"]', student.password);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/student-dashboard/);

    // Go to Safety Reports
    await page.goto('/student-dashboard/safety');

    // Fill the form
    await page.getByPlaceholder('https://example.com/suspicious-article').fill(testUrl);
    await page.getByPlaceholder('e.g., Claims to be a certified peer-reviewed journal').fill('This site asks for personal information falsely.');
    await page.getByRole('button', { name: 'Submit Security Report' }).click();

    // Verify it's in the list
    await expect(page.getByText('Report Submitted!')).toBeVisible();
    await expect(page.getByText(testUrl)).toBeVisible();
  });

  // --- 5. Safety Approvals (Admin) ---
  test('4. Safety Approvals: Admin Reviews and Approves Report', async ({ page }) => {
    // Sign up as Admin first
    await page.goto('/signup');
    await page.getByPlaceholder('John Doe').fill(admin.username);
    await page.locator('select').selectOption('Admin');
    await page.getByPlaceholder('john@example.com').fill(admin.email);
    await page.getByPlaceholder('Min. 8 characters').fill(admin.password);
    await page.getByRole('button', { name: 'Get Started' }).click();
    await expect(page).toHaveURL(/\/login/, { timeout: 15000 });

    // Login as Admin
    await page.fill('input[type="email"]', admin.email);
    await page.fill('input[type="password"]', admin.password);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/admin-dashboard/);

    // Go to Safety Approvals tab
    await page.getByRole('button', { name: 'Safety Approvals' }).click();

    // Search for the reported URL
    await page.getByPlaceholder('Search reports…').fill(testUrl);

    // Verify the URL is in the table
    await expect(page.getByText(testUrl)).toBeVisible();

    // Handle alert and Approve
    page.on('dialog', dialog => dialog.accept());
    await page.getByTitle('Approve Report').click();

    // Verify status changes to Approved
    await expect(page.getByText('Approved')).toBeVisible();
  });
});

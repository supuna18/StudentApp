const { test, expect } = require('@playwright/test');

test.describe('Member 2: Collaboration Hub Workflow', () => {
  const randomAlpha = () => String.fromCharCode(...Array.from({length: 8}, () => Math.floor(Math.random() * 26) + 97));
  
  const creator = {
    username: `Creator ${randomAlpha()}`,
    email: `creator_${Date.now()}@test.com`,
    password: 'password123'
  };

  const joiner = {
    username: `Joiner ${randomAlpha()}`,
    email: `joiner_${Date.now()}@test.com`,
    password: 'password123'
  };

  const groupName = `Study Circle ${randomAlpha().substring(0, 4)}`;
  let accessCode = '';

  test('Complete Collaboration Flow: Create, Join, Chat and Calendar', async ({ browser }) => {
    test.setTimeout(120000); // Increase timeout for this long flow
    // --- STEP 1: CREATOR CREATES A GROUP ---
    const creatorContext = await browser.newContext();
    const creatorPage = await creatorContext.newPage();

    // Sign up Creator
    await creatorPage.goto('/signup');
    await creatorPage.getByPlaceholder('John Doe').fill(creator.username);
    await creatorPage.getByPlaceholder('john@example.com').fill(creator.email);
    await creatorPage.getByPlaceholder('Min. 8 characters').fill(creator.password);
    await creatorPage.getByRole('button', { name: 'Get Started' }).click();
    
    // Wait for signup to complete and redirect to login
    await expect(creatorPage).toHaveURL(/\/login/);

    // Login Creator
    await creatorPage.goto('/login');
    await creatorPage.fill('input[type="email"]', creator.email);
    await creatorPage.fill('input[type="password"]', creator.password);
    await creatorPage.click('button[type="submit"]');

    // Go to Collaboration Hub
    await expect(creatorPage).toHaveURL(/\/student-dashboard/);
    await creatorPage.goto('/hub/study-groups');

    // Create Group
    await creatorPage.getByRole('button', { name: 'Create Circle' }).click();
    await creatorPage.getByPlaceholder('e.g. Computer Science Geniuses').fill(groupName);
    await creatorPage.getByPlaceholder('What are we studying?').fill('Test description for member 2 components.');
    await creatorPage.getByPlaceholder('10-digit phone number').fill('0712345678');

    // Capture Access Code from Alert
    creatorPage.on('dialog', async dialog => {
      const message = dialog.message();
      // "Circle created! Access Code: XXXXXX"
      const match = message.match(/Code: (\d+)/);
      if (match) accessCode = match[1];
      await dialog.accept();
    });
    await creatorPage.getByRole('button', { name: 'Create Discussion Hub →' }).click();

    // Verify group appears in "Managed by you"
    await expect(creatorPage.getByText(groupName)).toBeVisible();

    // --- STEP 2: JOINER JOINS THE GROUP ---
    const joinerContext = await browser.newContext();
    const joinerPage = await joinerContext.newPage();

    // Sign up Joiner
    await joinerPage.goto('/signup');
    await joinerPage.getByPlaceholder('John Doe').fill(joiner.username);
    await joinerPage.getByPlaceholder('john@example.com').fill(joiner.email);
    await joinerPage.getByPlaceholder('Min. 8 characters').fill(joiner.password);
    await joinerPage.getByRole('button', { name: 'Get Started' }).click();
    
    // Wait for signup to complete
    await expect(joinerPage).toHaveURL(/\/login/);

    // Login Joiner
    await joinerPage.goto('/login');
    await joinerPage.fill('input[type="email"]', joiner.email);
    await joinerPage.fill('input[type="password"]', joiner.password);
    await joinerPage.click('button[type="submit"]');

    // Wait for login to complete before navigating away
    await expect(joinerPage).toHaveURL(/\/student-dashboard/);

    // Go to Hub and Join
    await joinerPage.goto('/hub/study-groups');
    await joinerPage.getByRole('button', { name: 'Join a Circle' }).click();
    await joinerPage.getByPlaceholder('10-digit phone number').fill('0771234567');
    await joinerPage.getByPlaceholder('Exact subject match (e.g. Maths)').fill(groupName); // Subject must match Group Name
    
    // Wait for the access code to be populated by the creator test step
    await expect.poll(() => accessCode).not.toBe('');
    await joinerPage.getByPlaceholder('000000').fill(accessCode);

    // Handle Join Success Alert
    joinerPage.on('dialog', dialog => dialog.accept());
    await joinerPage.getByRole('button', { name: 'Join Session →' }).click();

    // Verify landing in Chat
    await expect(joinerPage).toHaveURL(/\/chat\//);
    await expect(joinerPage.getByText('Study Circle')).toBeVisible();

    // --- STEP 3: CHAT INTERACTION ---
    // First, make sure the Creator is already in the Chat room to test Real-time SignalR
    await creatorPage.click(`p:has-text("${groupName}")`); 
    await expect(creatorPage).toHaveURL(/\/chat\//);
    await expect(creatorPage.getByText('Study Circle')).toBeVisible();

    const testMessage = "Hello from the Joiner!";
    await joinerPage.getByPlaceholder('Type a message...').fill(testMessage);
    
    // Give SignalR a moment to connect
    await joinerPage.waitForTimeout(2000);
    await joinerPage.click('button:has-text("➤")');

    // First, verify Joiner sees their OWN message (confirms it was sent)
    await expect(joinerPage.getByText(testMessage)).toBeVisible({ timeout: 10000 });

    // Verify Creator sees the message in real-time
    await expect(creatorPage.getByText(testMessage)).toBeVisible({ timeout: 15000 });

    // --- STEP 4: CALENDAR EVENT ---
    const groupIdMatch = creatorPage.url().match(/\/chat\/(.+)/);
    const groupId = groupIdMatch ? groupIdMatch[1] : '';
    
    await creatorPage.goto(`/hub/calendar/${groupId}`);
    await creatorPage.getByPlaceholder('Topic Name...').fill('Exam Prep Session');
    await creatorPage.locator('input[type="time"]').fill('10:00');
    await creatorPage.getByRole('button', { name: 'Save to Calendar' }).click();

    // Verify list (this is a simple check if the component didn't crash)
    await expect(creatorPage.getByText('Exam Prep Session')).toBeVisible();
  });
});

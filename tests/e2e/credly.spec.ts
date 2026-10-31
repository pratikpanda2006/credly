import { test, expect } from '@playwright/test';

test.describe('Credly: Group Contribution Tracker E2E User Flows', () => {
  const testEmail = `student_${Date.now()}@university.edu`;
  const testPassword = 'StrongPassword123!';
  const teamName = 'Autonomous Drone Robotics Project';

  test('Full Journey: Signup -> Walkthrough -> Create Team -> Post -> Vote -> Share Code -> Logout', async ({
    page,
  }) => {
    // 1. Visit application
    await page.goto('http://localhost:5173');

    // 2. Sign up flow
    await expect(page.locator('text=Sign In')).toBeVisible();
    await page.click('button:has-text("Create Account")');

    await page.fill('input[placeholder="e.g. Alex Chen"]', 'Pratik Student');
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[placeholder="••••••••"]', testPassword);
    await page.click('button[type="submit"]');

    // 3. Welcome Walkthrough appears on first launch
    await expect(page.locator('text=Welcome to Credly')).toBeVisible();
    await page.click('button:has-text("Next")');
    await expect(page.locator('text=Post what you do')).toBeVisible();
    await page.click('button:has-text("Next")');
    await expect(page.locator('text=Teammates review it')).toBeVisible();
    await page.click('button:has-text("Next")');
    await expect(page.locator('text=See the fair share')).toBeVisible();
    await page.click('button:has-text("Get Started")');

    // 4. "Add a team" screen with 3 equal cards
    await expect(page.locator('text=Add a team')).toBeVisible();
    await expect(page.locator('text=Create a team')).toBeVisible();
    await expect(page.locator('text=Join a team')).toBeVisible();
    await expect(page.locator('text=Try the demo')).toBeVisible();

    // 5. Test invalid join code shows exact required error
    await page.fill('input[placeholder="e.g. J8M9X2"]', 'BADCOD');
    await page.click('button:has-text("Join Team")');
    await expect(
      page.locator('text=No team found with this code. Please check it with your team admin.')
    ).toBeVisible();

    // 6. Create a team
    await page.fill('input[placeholder="e.g. HCI Capstone Project"]', teamName);
    await page.click('button:has-text("Create Team")');

    // 7. Verify Home Screen order:
    // (1) Team name with Switch button
    await expect(page.locator(`text=${teamName}`)).toBeVisible();
    await expect(page.locator('button:has-text("Switch")')).toBeVisible();

    // (2) Share-of-work donut chart with "No chart yet" empty state
    await expect(page.locator('text=No chart yet')).toBeVisible();

    // (3) "What did you do for the group?" post box
    await expect(page.locator('text=What did you do for the group?')).toBeVisible();

    // 8. Test post validation (too short < 8 chars)
    await page.fill('textarea', 'Brief');
    await page.click('button:has-text("Record Task")');
    await expect(page.locator('text=Add a bit more detail (8+ characters).')).toBeVisible();

    // 9. Submit a valid post
    const taskText = 'Configured OpenCV object recognition pipeline on the drone hardware';
    await page.fill('textarea', taskText);
    await page.click('button:has-text("Record Task")');

    // 10. Test duplicate post rejection (case-insensitive)
    await page.fill('textarea', taskText.toLowerCase());
    await page.click('button:has-text("Record Task")');
    await expect(page.locator('text=You already posted this.')).toBeVisible();

    // 11. Navigate to My Work
    await page.click('nav button:has-text("My Work"), aside button:has-text("My Work")');
    await expect(page.locator(`text=${taskText}`)).toBeVisible();
    await expect(page.locator('text=1 base')).toBeVisible();

    // 12. Try Demo Team via Add a team
    await page.click('nav button:has-text("Teams"), aside button:has-text("My Teams")');
    await page.click('button:has-text("Create or join a team")');
    await page.click('button:has-text("Load Sample Demo Team")');

    // 13. Verify Home now has Live Share-of-work Donut Chart
    await expect(page.locator('text=Share of Work')).toBeVisible();
    await expect(page.locator('text=Live')).toBeVisible();

    // 14. Navigate to Contributions and test voting UI
    await page.click('nav button:has-text("Contribs"), aside button:has-text("Contributions")');
    await expect(page.locator('text=Contribution Details')).toBeVisible();

    // Find unreviewed post and vote "For the group"
    const groupVoteBtn = page.locator('button:has-text("For the group")').first();
    if (await groupVoteBtn.isVisible()) {
      await groupVoteBtn.click();
      await expect(page.locator('text=You reviewed this')).toBeVisible();
    }

    // Test "No" vote with reason validation
    const noVoteBtn = page.locator('button:has-text("No")').first();
    if (await noVoteBtn.isVisible()) {
      await noVoteBtn.click();
      await expect(page.locator('text=Why was it not helpful?')).toBeVisible();

      // Submit without reason -> button disabled
      const submitBtn = page.locator('button:has-text("Submit")');
      await expect(submitBtn).toBeDisabled();

      // Submit with reason >= 5 chars
      await page.fill('textarea[placeholder*="Incomplete notes"]', 'Scope of work was not met');
      await expect(submitBtn).toBeEnabled();
      await submitBtn.click();
      await expect(page.locator('text=Feedback recorded.')).toBeVisible();
    }

    // 15. Test Share Code action (verifies non-disruptive clipboard / toast)
    const shareBtn = page.locator('button:has-text("Share"), button:has-text("Share code")').first();
    await shareBtn.click();
    await expect(page.locator('text=copied')).toBeVisible();

    // 16. Test Settings & Switch Teams
    await page.click('nav button:has-text("Teams"), aside button:has-text("My Teams")');
    await expect(page.locator('text=Sample project (demo data)')).toBeVisible();
    await expect(page.locator(`text=${teamName}`)).toBeVisible();

    // 17. Logout
    const logoutBtn = page.locator('button[aria-label="Logout"], button[aria-label="Sign Out"]').first();
    await logoutBtn.click();
    await expect(page.locator('text=Sign In to Credly')).toBeVisible();
  });
});

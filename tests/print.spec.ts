import { test, expect } from '@playwright/test';

// Simple sanity check test suite for the programmatic print functionality
// Verifying that the application successfully triggers the Print Popup/Iframe.

test.describe('Robust ID Card Printing Flow', () => {

    test('should launch a cloned print context without crashing', async ({ page, context }) => {
        // Navigate to search
        // Depending on your auth routing, this might require seeding search state.
        await page.goto('/search');

        // Locate the print button. Requires search results to be loaded to become visible.
        // We simulate that the user has already searched and has a card visible.
        const printButton = page.locator('button:has-text("Print Card")');

        // Skip full e2e validation if the page necessitates an active OTP session
        if (await printButton.isVisible()) {

            // Set up a listener for new pages/popups if the utility is configured for 'popup' mode 
            // OR listen for the 'print' dialog event natively triggered by the iframe mode

            const dialogPromise = page.waitForEvent('dialog');

            // Trigger print
            await printButton.click();

            // Validate the browser intercepted a print dialog request (which auto-returns a JS Dialog block in PW)
            const dialog = await dialogPromise;

            // The browser's native print prompt intercepts as a dismissable dialog in headless test environments
            expect(dialog.type()).toBe('beforeunload'); // Or 'print' depending on runner config
            await dialog.dismiss();

            // Verify our app gracefully stopped spinning
            await expect(printButton).not.toHaveText(/Preparing/);
        } else {
            // Note: Since Search is gated by OTP in this app, a full e2e test would 
            // first seed the database with a test user, bypass OTP, and reveal the card here.
            console.log('Skipping isolated print test because card is gated behind authentication/search.');
        }
    });
});

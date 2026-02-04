# Google Sheets Integration Setup Guide

Follow these steps to generate the required credentials for `GOOGLE_SHEETS_ID`, `GOOGLE_SERVICE_ACCOUNT_EMAIL`, and `GOOGLE_PRIVATE_KEY`.

## 1. Create a Google Cloud Project
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Click the project dropdown (top left) and select **"New Project"**.
3. Name it `HRDA-Connect` (or similar) and click **Create**.

## 2. Enable Google Sheets API
1. In the search bar at the top, type **"Google Sheets API"**.
2. Click on the result and click **Enable**.

## 3. Create a Service Account
1. In the search bar, type **"Credentials"** (under APIs & Services).
2. Click **"Create Credentials"** -> **"Service Account"**.
3. Name it `hrda-sheet-bot`.
4. Click **Create and Continue**, then **Done** (no roles needed for simple sheet access).

## 4. Generate Keys
1. In the **Service Accounts** list, click on the email address of the account you just created (e.g., `hrda-sheet-bot@...`).
2. Go to the **Keys** tab.
3. Click **Add Key** -> **Create new key**.
4. Select **JSON** and click **Create**.
5. A `.json` file will automatically download to your computer. **Keep this safe!**

## 5. Get Your Values

### `GOOGLE_SERVICE_ACCOUNT_EMAIL`
- Look inside the downloaded JSON file for `"client_email"`.
- OR Copy the email from the Service Account page in Cloud Console.
- Example: `hrda-sheet-bot@hrda-connect-123.iam.gserviceaccount.com`

### `GOOGLE_PRIVATE_KEY`
- Look inside the downloaded JSON file for `"private_key"`.
- It will look like `-----BEGIN PRIVATE KEY-----\nMIIEv...`.
- Copy the **entire string** including the `BEGIN` and `END` parts.

### `GOOGLE_SHEETS_ID`
1. Open your target Google Sheet in your browser.
2. Look at the URL: `https://docs.google.com/spreadsheets/d/1XyZ.../edit`
3. The ID is the long string between `/d/` and `/edit`.
4. Example ID: `1XyZ_random_letters_and_numbers_abc123`

## 6. CRITICAL STEP: Share the Sheet
1. Open your Google Sheet.
2. Click the big **Share** button (top right).
3. Paste the **`GOOGLE_SERVICE_ACCOUNT_EMAIL`** you got in Step 5.
4. Set permission to **Editor**.
5. Click **Send** (uncheck "Notify people" if you want).

---

## 7. Update .env
Copy these values into your `.env` file:
```env
GOOGLE_SHEETS_ID=your_sheet_id_here
GOOGLE_SERVICE_ACCOUNT_EMAIL=your_service_email_here
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY----- ... -----END PRIVATE KEY-----"
```
**Note:** Wrap the private key in double quotes `"` if it contains newlines (`\n`).

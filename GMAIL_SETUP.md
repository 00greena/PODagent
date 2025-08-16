# Gmail Setup Guide for PODagent

## Quick Setup with Gmail (No Custom Domain Required)

Follow these steps to set up email notifications using your Gmail account:

### Step 1: Enable 2-Factor Authentication on Gmail
1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Under "Signing in to Google", click **2-Step Verification**
3. Follow the prompts to enable 2FA (required for app passwords)

### Step 2: Generate App Password
1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Under "Signing in to Google", click **2-Step Verification**
3. At the bottom, click **App passwords**
4. Select "Mail" and your device
5. Click **Generate**
6. **Copy the 16-character password** (it will look like: `abcd efgh ijkl mnop`)

### Step 3: Configure Environment Variables

In your Vercel dashboard, add these environment variables:

```
DATABASE_URL=your_postgres_connection_string
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=abcdefghijklmnop
EMAIL_TO=admin@veologistics.com
```

**Important:** 
- Use your actual Gmail address for `GMAIL_USER`
- Use the 16-character app password (without spaces) for `GMAIL_APP_PASSWORD`
- Set `EMAIL_TO` to the email where you want to receive notifications

### Step 4: Deploy to Vercel

1. Push your code to GitHub (already done)
2. Import the repository in Vercel
3. Add the environment variables above
4. Deploy!

## Alternative: Free Email Services

If you don't want to use Gmail, here are other options:

### Option 1: Resend with a Free Domain
1. Get a free domain from [Freenom](https://freenom.com) or use a subdomain
2. Set up basic DNS records
3. Use Resend with your free domain

### Option 2: EmailJS (Frontend-only solution)
1. Sign up at [EmailJS](https://emailjs.com)
2. No backend email configuration needed
3. Emails sent directly from the browser

### Option 3: Formspree (Form handling service)
1. Sign up at [Formspree](https://formspree.io)
2. Simple form submission to email
3. Free tier available

## Testing Your Email Setup

1. Deploy your app
2. Fill out the POD form
3. Check that admin@veologistics.com receives the email
4. Check your Gmail "Sent" folder to confirm

## Common Issues

### "Invalid login" error
- Make sure 2FA is enabled on your Google account
- Double-check the app password (16 characters, no spaces)
- Verify the Gmail address is correct

### "Less secure app access" error
- This shouldn't happen with app passwords
- If it does, use the app password method above

### Emails not being received
- Check spam/junk folders
- Verify the EMAIL_TO address is correct
- Check Vercel function logs for errors

## Security Notes

- App passwords are more secure than using your main password
- Each app password is unique and can be revoked individually
- Never share your app password publicly
- Store it securely in Vercel environment variables only
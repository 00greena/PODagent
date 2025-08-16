# PODagent - Delivery Management System

A web application for managing Proof of Delivery (POD) documents and job sheets with automated time tracking, OCR capabilities, and weekly reconciliation features.

## Features

- **POD & Job Sheet Upload**: Drag-and-drop file upload for delivery documents
- **Time Tracking**: Manual time input with automatic GMT time capture
- **OCR Intelligence**: Automatic extraction of delivery addresses and reference numbers from images
- **Email Notifications**: Automated emails to admin@veologistics.com upon submission
- **Database Storage**: Persistent storage of all submissions
- **Export to Excel**: Download all entries as Excel spreadsheet
- **Weekly Reconciliation**: Generate weekly reports (Monday-Friday) with total hours and delivery summaries

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **OCR**: Tesseract.js for text extraction
- **Email**: Resend API (or Nodemailer as alternative)
- **File Processing**: XLSX for Excel export
- **Deployment**: Vercel

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
cd podagent
npm install
```

### 2. Database Setup

#### Option A: Use Vercel Postgres (Recommended for Vercel deployment)
1. Create a Vercel Postgres database in your Vercel dashboard
2. Copy the connection string

#### Option B: Use Local PostgreSQL
1. Install PostgreSQL locally
2. Create a new database: `createdb podagent`

### 3. Environment Variables

Create a `.env.local` file based on `.env.example`:

```env
# Database
DATABASE_URL="your_postgres_connection_string"

# Email Configuration
RESEND_API_KEY="your_resend_api_key"
EMAIL_FROM="noreply@yourdomain.com"
EMAIL_TO="admin@veologistics.com"
```

### 4. Initialize Database

```bash
npx prisma generate
npx prisma db push
```

### 5. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` to see the application.

## Deployment to Vercel

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin your-github-repo
git push -u origin main
```

### 2. Deploy on Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Add environment variables:
   - `DATABASE_URL` - Your Postgres connection string
   - `RESEND_API_KEY` - Your Resend API key
   - `EMAIL_FROM` - Sender email address
   - `EMAIL_TO` - admin@veologistics.com

5. Click "Deploy"

### 3. Configure Database

After deployment, run database migrations:

```bash
npx vercel env pull .env.local
npx prisma generate
npx prisma db push
```

## Getting Email API Keys

### Resend (Recommended)
1. Sign up at [resend.com](https://resend.com)
2. Create an API key
3. Add your domain for sending emails
4. Update `RESEND_API_KEY` in environment variables

### Alternative: Gmail with Nodemailer
1. Enable 2-factor authentication on your Gmail account
2. Generate an app-specific password
3. Update environment variables:
   - `SMTP_HOST=smtp.gmail.com`
   - `SMTP_PORT=587`
   - `SMTP_USER=your-email@gmail.com`
   - `SMTP_PASSWORD=your-app-password`

## Usage

1. **Upload Documents**: Drag and drop or click to upload POD and Job Sheet images/PDFs
2. **Enter Time**: Input start time manually, click clock button for current GMT time for end time
3. **Submit**: Click Send to save to database and send email notification
4. **Export Data**: Click "Export to Sheet" to download all entries as Excel
5. **Weekly Reconciliation**: Click "Weekly Reconciliation" for current week's summary

## Features in Detail

### OCR Processing
- Automatically extracts text from uploaded images
- Identifies delivery addresses using pattern matching
- Extracts reference numbers from documents
- Stores both raw text and extracted data

### Weekly Reconciliation
- Groups entries by day (Monday-Friday)
- Calculates total hours per day
- Shows number of deliveries
- Exports multi-sheet Excel with:
  - Weekly summary
  - Daily breakdowns
  - All entries detail

### Data Storage
Each entry stores:
- POD and Job Sheet images (base64)
- Time in/out
- Extracted delivery address
- Reference numbers
- Week number and year
- Creation timestamp

## Troubleshooting

### Database Connection Issues
- Ensure `DATABASE_URL` is correctly formatted
- For Vercel Postgres, use the `POSTGRES_PRISMA_URL` value
- Run `npx prisma db push` after any schema changes

### Email Not Sending
- Verify Resend API key is valid
- Check sender domain is verified in Resend
- Ensure `EMAIL_TO` is set correctly

### OCR Not Working
- Large images may take time to process
- Clear, high-contrast images work best
- Text should be legible and not handwritten

## License

MIT

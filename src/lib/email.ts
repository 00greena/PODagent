import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

interface EmailData {
  timeIn: string
  timeOut: string
  deliveryAddress?: string
  referenceNumber?: string
  date: string
}

export async function sendNotificationEmail(data: EmailData) {
  try {
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">New POD Submission</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>Date:</strong></td>
            <td style="padding: 10px; border-bottom: 1px solid #ddd;">${data.date}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>Time In:</strong></td>
            <td style="padding: 10px; border-bottom: 1px solid #ddd;">${data.timeIn}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>Time Out:</strong></td>
            <td style="padding: 10px; border-bottom: 1px solid #ddd;">${data.timeOut}</td>
          </tr>
          ${data.deliveryAddress ? `
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>Delivery Address:</strong></td>
            <td style="padding: 10px; border-bottom: 1px solid #ddd;">${data.deliveryAddress}</td>
          </tr>
          ` : ''}
          ${data.referenceNumber ? `
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>Reference Number:</strong></td>
            <td style="padding: 10px; border-bottom: 1px solid #ddd;">${data.referenceNumber}</td>
          </tr>
          ` : ''}
        </table>
        <p style="margin-top: 20px; color: #666;">This is an automated message from PODagent.</p>
      </div>
    `

    const result = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'PODagent <noreply@yourdomain.com>',
      to: process.env.EMAIL_TO || 'admin@veologistics.com',
      subject: `POD Submission - ${data.date}`,
      html: emailHtml,
    })

    return { success: true, data: result }
  } catch (error) {
    console.error('Email sending error:', error)
    return { success: false, error }
  }
}

// Alternative using nodemailer if Resend is not preferred
import nodemailer from 'nodemailer'

export async function sendNotificationEmailNodemailer(data: EmailData) {
  // Create transporter
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  })

  const mailOptions = {
    from: process.env.EMAIL_FROM || 'noreply@yourdomain.com',
    to: process.env.EMAIL_TO || 'admin@veologistics.com',
    subject: `POD Submission - ${data.date}`,
    html: `
      <div style="font-family: Arial, sans-serif;">
        <h2>New POD Submission</h2>
        <p><strong>Date:</strong> ${data.date}</p>
        <p><strong>Time In:</strong> ${data.timeIn}</p>
        <p><strong>Time Out:</strong> ${data.timeOut}</p>
        ${data.deliveryAddress ? `<p><strong>Delivery Address:</strong> ${data.deliveryAddress}</p>` : ''}
        ${data.referenceNumber ? `<p><strong>Reference Number:</strong> ${data.referenceNumber}</p>` : ''}
      </div>
    `
  }

  try {
    const info = await transporter.sendMail(mailOptions)
    return { success: true, data: info }
  } catch (error) {
    console.error('Email error:', error)
    return { success: false, error }
  }
}
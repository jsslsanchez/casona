// /lib/sendEmail.ts

import sgMail from '@sendgrid/mail';

// Ensure the API key is set
if (!process.env.SENDGRID_API_KEY) {
  throw new Error("SENDGRID_API_KEY is not defined in environment variables.");
}

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

export const sendEmail = async ({ to, subject, text, html }: EmailOptions) => {
  const msg = {
    to,
    from: 'santhoughtvm@gmail.com', // Ensure this is a verified SendGrid sender
    subject,
    text,
    html,
  };

  try {
    await sgMail.send(msg);
    console.log(`Email successfully sent to ${to}`);
  } catch (error: any) {
    console.error('Error sending email:', error);
    if (error.response) {
      console.error('SendGrid Response Body:', error.response.body);
    }
    throw new Error('Failed to send email');
  }
};
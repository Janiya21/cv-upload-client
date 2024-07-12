// lib/mail.js
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  auth: {
    user: process.env.MAIL_USERNAME,
    pass: process.env.MAIL_PASSWORD,
  },
});

export const sendEmail = async ({ to, subject, text, html }) => {
  const mailOptions = {
    from: '"Your Name" <your-email@example.com>',
    to,
    subject,
    text,
    html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: ' + info.messageId);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

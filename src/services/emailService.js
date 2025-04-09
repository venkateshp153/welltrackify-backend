const nodemailer = require('nodemailer');
const logger = require('../config/logger');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_PORT === '465', // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const sendPasswordResetEmail = async (email, resetToken) => {
  try {
    const resetUrl = `http://yourapp.com/reset-password?token=${resetToken}`;
    
    await transporter.sendMail({
      from: `"Your App" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Password Reset Request',
      html: `
        <p>You requested a password reset. Click the link below to set a new password:</p>
        <a href="${resetUrl}">${resetUrl}</a>
        <p>This link will expire in 1 hour.</p>
      `,
    });

    logger.info(`Password reset email sent to ${email}`);
  } catch (err) {
    logger.error(`Error sending password reset email: ${err.message}`);
    throw err;
  }
};

module.exports = {
  sendPasswordResetEmail,
};
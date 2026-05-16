const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendOTP = async (email, otp) => {
  try {
    const info = await transporter.sendMail({
      from: `"PantryPal" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Verify your PantryPal account',
      html: `
        <div style="font-family: sans-serif; max-w-md mx-auto p-4 border rounded">
          <h2>Welcome to PantryPal! 🥗</h2>
          <p>Your one-time password (OTP) for account verification is:</p>
          <h1 style="font-size: 32px; letter-spacing: 5px; color: #10B981;">${otp}</h1>
          <p>This code will expire in 10 minutes.</p>
        </div>
      `
    });

    console.log('Real email sent successfully to:', email);
    return true;
  } catch (error) {
    console.error('Error sending real email:', error);
    return false;
  }
};

const sendPasswordResetOTP = async (email, otp) => {
  try {
    await transporter.sendMail({
      from: `"PantryPal" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Reset your PantryPal password',
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; border: 1px solid #e5e7eb; border-radius: 12px;">
          <h2 style="color: #1D4ED8; margin-bottom: 8px;">🔒 Password Reset Request</h2>
          <p style="color: #6b7280;">We received a request to reset your PantryPal password. Use the OTP below to proceed:</p>
          <div style="background: #EFF6FF; border: 2px dashed #93C5FD; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0;">
            <p style="margin: 0; font-size: 13px; color: #6b7280; letter-spacing: 1px; text-transform: uppercase;">Your Reset Code</p>
            <h1 style="font-size: 42px; letter-spacing: 10px; color: #1D4ED8; margin: 8px 0;">${otp}</h1>
            <p style="margin: 0; font-size: 12px; color: #9ca3af;">Expires in 10 minutes</p>
          </div>
          <p style="color: #6b7280; font-size: 13px;">If you didn't request this, you can safely ignore this email. Your password will not change.</p>
        </div>
      `
    });
    console.log('Password reset OTP sent to:', email);
    return true;
  } catch (error) {
    console.error('Error sending reset OTP:', error);
    return false;
  }
};

module.exports = { sendOTP, sendPasswordResetOTP };

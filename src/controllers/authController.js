const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../../db');
const { sendOTP, sendPasswordResetOTP } = require('../utils/mailer');

// In-memory store for pending verifications (Does not use the Database!)
const pendingVerifications = new Map();

// Generate 6-digit OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // 1. Check if user already exists in the permanent users table
    const userCheck = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userCheck.rows.length > 0) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    // 2. Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // 3. Generate OTP and Expiry (10 mins)
    const otp = generateOTP();
    const otpExpires = Date.now() + 10 * 60 * 1000;

    // 4. Store temporarily IN-MEMORY ONLY (Not in Database!)
    pendingVerifications.set(email, {
      name,
      email,
      passwordHash,
      otp,
      otpExpires
    });

    // 5. Send OTP email
    await sendOTP(email, otp);

    res.status(200).json({
      success: true,
      message: 'OTP sent successfully to your email.',
      status: 'pending_verification'
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // 1. Check if the verification request exists in MEMORY
    const tempUser = pendingVerifications.get(email);

    if (!tempUser) {
      return res.status(400).json({ success: false, message: 'No pending verification found. Please register again.' });
    }

    // 2. Validate OTP
    if (tempUser.otp !== otp) {
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }

    if (Date.now() > tempUser.otpExpires) {
      pendingVerifications.delete(email); // Clean up expired
      return res.status(400).json({ success: false, message: 'OTP has expired. Please register again.' });
    }

    // 3. Valid! NOW we insert into the database
    const insertQuery = `
      INSERT INTO users (name, email, password_hash)
      VALUES ($1, $2, $3)
      RETURNING id, name, email;
    `;
    await db.query(insertQuery, [tempUser.name, tempUser.email, tempUser.passwordHash]);

    // 4. Delete the temporary record from memory
    pendingVerifications.delete(email);

    res.status(200).json({
      success: true,
      message: 'Email verified successfully! You can now log in.'
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid email or password' });
    }

    const user = result.rows[0];

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'fallback_secret', {
      expiresIn: '7d'
    });

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { register, verifyOTP, login };

// ── In-memory store for password reset OTPs ──────────────────
const pendingResets = new Map();

// POST /api/auth/forgot-password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email is required' });

    // 1. Check user exists
    const result = await db.query('SELECT id, name FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      // Security: don't reveal if email exists — still return success
      return res.status(200).json({ success: true, message: 'If that email is registered, an OTP has been sent.' });
    }

    // 2. Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = Date.now() + 10 * 60 * 1000; // 10 mins

    // 3. Store in memory
    pendingResets.set(email, { otp, otpExpires, userId: result.rows[0].id });

    // 4. Send OTP email
    await sendPasswordResetOTP(email, otp);

    res.status(200).json({ success: true, message: 'OTP sent to your email address.' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// POST /api/auth/verify-reset-otp  — just validates OTP, returns a short-lived token for the reset step
const verifyResetOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ success: false, message: 'Email and OTP are required' });

    const pending = pendingResets.get(email);
    if (!pending) return res.status(400).json({ success: false, message: 'No reset request found. Please request again.' });

    if (pending.otp !== otp) return res.status(400).json({ success: false, message: 'Invalid OTP. Please try again.' });

    if (Date.now() > pending.otpExpires) {
      pendingResets.delete(email);
      return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one.' });
    }

    // Mark as verified (keep in map for the reset step)
    pendingResets.set(email, { ...pending, verified: true });

    res.status(200).json({ success: true, message: 'OTP verified. You may now set a new password.' });
  } catch (error) {
    console.error('Verify reset OTP error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// POST /api/auth/reset-password
const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword)
      return res.status(400).json({ success: false, message: 'Email, OTP and new password are required' });

    const pending = pendingResets.get(email);
    if (!pending || !pending.verified)
      return res.status(400).json({ success: false, message: 'OTP not verified. Please start over.' });

    if (pending.otp !== otp)
      return res.status(400).json({ success: false, message: 'Invalid OTP.' });

    if (Date.now() > pending.otpExpires) {
      pendingResets.delete(email);
      return res.status(400).json({ success: false, message: 'Session expired. Please request a new OTP.' });
    }

    if (newPassword.length < 8)
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters.' });

    // Hash and update
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    await db.query('UPDATE users SET password_hash = $1 WHERE email = $2', [passwordHash, email]);

    // Clean up
    pendingResets.delete(email);

    res.status(200).json({ success: true, message: 'Password updated successfully. You can now log in.' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { register, verifyOTP, login, forgotPassword, verifyResetOTP, resetPassword };

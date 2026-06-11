const db = require('../../db');
const bcrypt = require('bcryptjs');
const { sendAppResetOTP } = require('../utils/mailer');

// In-memory store for reset OTPs: userId -> { email, otp, expires, verified }
const resetAppOtps = new Map();

// Helper to get or create default settings
async function getOrCreateSettings(userId) {
  let result = await db.query('SELECT * FROM user_settings WHERE user_id = $1', [userId]);
  if (result.rows.length === 0) {
    result = await db.query(
      `INSERT INTO user_settings (user_id) VALUES ($1) RETURNING *`,
      [userId]
    );
  }
  return result.rows[0];
}

// GET /api/settings
const getSettings = async (req, res) => {
  try {
    const row = await getOrCreateSettings(req.user.id);
    res.json({ success: true, settings: mapSettings(row) });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// PUT /api/settings
const updateSettings = async (req, res) => {
  try {
    const {
      alertDays, showExpiredInDashboard, defaultUnit,
      defaultCategory, itemsPerPage, browserNotifications, alertSound, theme
    } = req.body;

    await getOrCreateSettings(req.user.id);

    const result = await db.query(
      `UPDATE user_settings SET
        alert_days = COALESCE($1, alert_days),
        show_expired_in_dashboard = COALESCE($2, show_expired_in_dashboard),
        default_unit = COALESCE($3, default_unit),
        default_category = COALESCE($4, default_category),
        items_per_page = COALESCE($5, items_per_page),
        browser_notifications = COALESCE($6, browser_notifications),
        alert_sound = COALESCE($7, alert_sound),
        theme = COALESCE($8, theme),
        updated_at = NOW()
       WHERE user_id = $9
       RETURNING *`,
      [alertDays, showExpiredInDashboard, defaultUnit, defaultCategory,
       itemsPerPage, browserNotifications, alertSound, theme, req.user.id]
    );

    res.json({ success: true, settings: mapSettings(result.rows[0]) });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/user/profile
const getProfile = async (req, res) => {
  try {
    const result = await db.query(
      'SELECT id, name, email, created_at FROM users WHERE id = $1',
      [req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    const u = result.rows[0];
    res.json({ success: true, user: { id: u.id, name: u.name, email: u.email, createdAt: u.created_at } });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// PUT /api/user/profile
const updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;
    if (!name && !email) {
      return res.status(400).json({ success: false, message: 'Nothing to update' });
    }

    if (name !== undefined && name.trim() === '') {
      return res.status(400).json({ success: false, message: 'Name cannot be empty' });
    }

    // Check email uniqueness if changing
    if (email) {
      if (email.trim() === '' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ success: false, message: 'Invalid email format' });
      }
      const emailCheck = await db.query(
        'SELECT id FROM users WHERE email = $1 AND id != $2', [email, req.user.id]
      );
      if (emailCheck.rows.length > 0) {
        return res.status(400).json({ success: false, message: 'Email already in use' });
      }
    }

    const result = await db.query(
      `UPDATE users SET
        name = COALESCE($1, name),
        email = COALESCE($2, email)
       WHERE id = $3
       RETURNING id, name, email`,
      [name, email, req.user.id]
    );

    res.json({ success: true, user: result.rows[0] });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// POST /api/user/export — export all user data
const exportData = async (req, res) => {
  try {
    const [items, grocery, settings] = await Promise.all([
      db.query('SELECT * FROM pantry_items WHERE user_id = $1', [req.user.id]),
      db.query('SELECT * FROM grocery_items WHERE user_id = $1', [req.user.id]),
      db.query('SELECT * FROM user_settings WHERE user_id = $1', [req.user.id])
    ]);
    res.json({
      success: true,
      data: {
        exportedAt: new Date().toISOString(),
        items: items.rows,
        grocery: grocery.rows,
        settings: settings.rows[0] || {}
      }
    });
  } catch (error) {
    console.error('Export data error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// DELETE /api/user/data — clear all user pantry data
const clearUserData = async (req, res) => {
  try {
    await db.query('DELETE FROM pantry_items WHERE user_id = $1', [req.user.id]);
    await db.query('DELETE FROM grocery_items WHERE user_id = $1', [req.user.id]);
    await db.query('DELETE FROM alerts WHERE user_id = $1', [req.user.id]);
    res.json({ success: true, message: 'All data cleared' });
  } catch (error) {
    console.error('Clear data error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

function mapSettings(row) {
  return {
    alertDays: row.alert_days,
    showExpiredInDashboard: row.show_expired_in_dashboard,
    defaultUnit: row.default_unit,
    defaultCategory: row.default_category,
    itemsPerPage: row.items_per_page,
    browserNotifications: row.browser_notifications,
    alertSound: row.alert_sound,
    theme: row.theme
  };
}


// POST /api/settings/reset/initiate
const initiateAppReset = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const userCheck = await db.query('SELECT * FROM users WHERE id = $1', [req.user.id]);
    if (userCheck.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const user = userCheck.rows[0];

    // Check if the input email matches user's registered email
    if (user.email.toLowerCase() !== email.toLowerCase()) {
      return res.status(400).json({ success: false, message: 'Incorrect email address' });
    }

    // Check password correctness
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Incorrect password' });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Store in-memory
    resetAppOtps.set(req.user.id, {
      email: user.email,
      otp,
      expires,
      verified: false
    });

    // Send OTP email
    const mailSent = await sendAppResetOTP(user.email, otp);
    if (!mailSent) {
      return res.status(500).json({ success: false, message: 'Failed to send verification email' });
    }

    res.status(200).json({ success: true, message: 'OTP sent to your email.' });
  } catch (error) {
    console.error('Initiate reset app error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// POST /api/settings/reset/verify
const verifyAppResetOTP = async (req, res) => {
  try {
    const { otp } = req.body;
    if (!otp) {
      return res.status(400).json({ success: false, message: 'OTP is required' });
    }

    const resetData = resetAppOtps.get(req.user.id);
    if (!resetData) {
      return res.status(400).json({ success: false, message: 'No pending reset request found. Please start over.' });
    }

    if (Date.now() > resetData.expires) {
      resetAppOtps.delete(req.user.id);
      return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new code.' });
    }

    if (resetData.otp !== otp) {
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }

    // Mark as verified
    resetData.verified = true;
    resetAppOtps.set(req.user.id, resetData);

    res.status(200).json({ success: true, message: 'OTP verified. Please confirm your decision.' });
  } catch (error) {
    console.error('Verify reset OTP error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// POST /api/settings/reset/confirm
const confirmAppReset = async (req, res) => {
  try {
    const resetData = resetAppOtps.get(req.user.id);
    if (!resetData || !resetData.verified) {
      return res.status(400).json({ success: false, message: 'Verification required. Please verify with OTP first.' });
    }

    const userId = req.user.id;

    // Delete user data
    await db.query('DELETE FROM pantry_items WHERE user_id = $1', [userId]);
    await db.query('DELETE FROM grocery_items WHERE user_id = $1', [userId]);
    await db.query('DELETE FROM alerts WHERE user_id = $1', [userId]);
    await db.query('DELETE FROM user_settings WHERE user_id = $1', [userId]);
    await db.query('DELETE FROM pantry_purchase_batches WHERE user_id = $1', [userId]);
    await db.query('DELETE FROM consumption_logs WHERE user_id = $1', [userId]);

    // Clean up
    resetAppOtps.delete(userId);

    res.status(200).json({ success: true, message: 'Application reset completed successfully.' });
  } catch (error) {
    console.error('Confirm reset app error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  getSettings,
  updateSettings,
  getProfile,
  updateProfile,
  exportData,
  clearUserData,
  initiateAppReset,
  verifyAppResetOTP,
  confirmAppReset
};

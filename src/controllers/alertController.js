const db = require('../../db');

// GET /api/alerts — Get all alerts for the user (computed from pantry items in DB)
const getAlerts = async (req, res) => {
  try {
    // Get user's alert threshold — auto-create settings row for new users
    const settingsResult = await db.query(
      `INSERT INTO user_settings (user_id, alert_days)
       VALUES ($1, 2)
       ON CONFLICT (user_id) DO UPDATE SET user_id = EXCLUDED.user_id
       RETURNING alert_days`,
      [req.user.id]
    );
    const alertDays = settingsResult.rows[0]?.alert_days ?? 2;

    // Compute alerts directly from pantry_items
    const result = await db.query(
      `SELECT
        pi.id AS item_id,
        pi.name AS item_name,
        pi.category,
        pi.quantity,
        pi.unit,
        pi.expiry_date,
        (pi.expiry_date - CURRENT_DATE) AS days_left,
        CASE
          WHEN pi.expiry_date < CURRENT_DATE THEN 'expired'
          WHEN (pi.expiry_date - CURRENT_DATE) <= 2 THEN 'critical'
          WHEN (pi.expiry_date - CURRENT_DATE) <= $2 THEN 'warning'
          ELSE 'info'
        END AS type,
        CASE
          WHEN pi.expiry_date < CURRENT_DATE THEN pi.name || ' has expired!'
          WHEN (pi.expiry_date - CURRENT_DATE) = 0 THEN pi.name || ' expires today!'
          WHEN (pi.expiry_date - CURRENT_DATE) = 1 THEN pi.name || ' expires tomorrow!'
          ELSE pi.name || ' expires in ' || (pi.expiry_date - CURRENT_DATE) || ' days'
        END AS message,
        COALESCE(a.dismissed, false) AS dismissed,
        COALESCE(a.is_read, false) AS is_read,
        a.id AS alert_id
       FROM pantry_items pi
       LEFT JOIN alerts a ON a.item_id = pi.id AND a.user_id = pi.user_id
       WHERE pi.user_id = $1
         AND pi.status = 'active'
         AND pi.expiry_date IS NOT NULL
         AND pi.expiry_date <= CURRENT_DATE + ($2::text || ' days')::INTERVAL
       ORDER BY pi.expiry_date ASC`,
      [req.user.id, alertDays]
    );

    const alerts = result.rows
      .map(row => ({
        id: row.alert_id || `pantry_${row.item_id}`,
        itemId: row.item_id,
        itemName: row.item_name,
        category: row.category,
        quantity: parseFloat(row.quantity),
        unit: row.unit,
        expiryDate: row.expiry_date || null,
        daysLeft: parseInt(row.days_left),
        type: row.type,
        message: row.message,
        isRead: row.is_read,
        dismissed: false   // always show; frontend handles per-session dismissals
      }));

    // Summary counts (all expiring items, regardless of dismiss state)
    const summary = {
      expired:  alerts.filter(a => a.daysLeft < 0).length,
      critical: alerts.filter(a => a.daysLeft >= 0 && a.daysLeft <= 2).length,
      soon:     alerts.filter(a => a.daysLeft > 2 && a.daysLeft <= 5).length,
      total:    alerts.length
    };

    res.json({ success: true, alerts, summary });
  } catch (error) {
    console.error('Get alerts error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// POST /api/alerts/generate — Sync alerts table from pantry_items
// Creates/updates alert rows in the alerts table for tracking read/dismiss state
const generateAlerts = async (req, res) => {
  try {
    // Auto-create settings row for new users
    const settingsResult = await db.query(
      `INSERT INTO user_settings (user_id, alert_days)
       VALUES ($1, 2)
       ON CONFLICT (user_id) DO UPDATE SET user_id = EXCLUDED.user_id
       RETURNING alert_days`,
      [req.user.id]
    );
    const alertDays = settingsResult.rows[0]?.alert_days ?? 2;

    // Get items needing alerts
    const items = await db.query(
      `SELECT id, name, category, expiry_date, (expiry_date - CURRENT_DATE) AS days_left
       FROM pantry_items
       WHERE user_id = $1
         AND status = 'active'
         AND expiry_date IS NOT NULL
         AND expiry_date <= CURRENT_DATE + ($2::text || ' days')::INTERVAL`,
      [req.user.id, alertDays]
    );

    let generated = 0;
    for (const item of items.rows) {
      // Upsert alert record
      const existing = await db.query(
        'SELECT id FROM alerts WHERE user_id = $1 AND item_id = $2',
        [req.user.id, item.id]
      );

      const daysLeft = parseInt(item.days_left);
      const type = daysLeft < 0 ? 'expired' : daysLeft <= 2 ? 'critical' : 'warning';
      const message = daysLeft < 0
        ? `${item.name} has expired!`
        : daysLeft === 0
        ? `${item.name} expires today!`
        : daysLeft === 1
        ? `${item.name} expires tomorrow!`
        : `${item.name} expires in ${daysLeft} days`;

      if (existing.rows.length === 0) {
        await db.query(
          `INSERT INTO alerts (user_id, item_id, item_name, category, expiry_date, days_left, message, type, is_read, dismissed)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, false, false)`,
          [req.user.id, item.id, item.name, item.category, item.expiry_date, daysLeft, message, type]
        );
        generated++;
      } else {
        // Update existing alert
        await db.query(
          `UPDATE alerts SET days_left = $1, message = $2, type = $3, expiry_date = $4
           WHERE user_id = $5 AND item_id = $6`,
          [daysLeft, message, type, item.expiry_date, req.user.id, item.id]
        );
      }
    }

    res.json({ success: true, generated, total: items.rows.length });
  } catch (error) {
    console.error('Generate alerts error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// PATCH /api/alerts/:id/read — Mark alert as read
const markRead = async (req, res) => {
  try {
    await db.query(
      'UPDATE alerts SET is_read = true WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Mark read error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// PATCH /api/alerts/:id/dismiss — Dismiss an alert
const dismissAlert = async (req, res) => {
  try {
    // Check if alert record exists; if not, create one
    const existing = await db.query(
      'SELECT id FROM alerts WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );

    if (existing.rows.length > 0) {
      await db.query(
        'UPDATE alerts SET dismissed = true WHERE id = $1 AND user_id = $2',
        [req.params.id, req.user.id]
      );
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Dismiss alert error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// PATCH /api/alerts/dismiss-by-item/:itemId — Dismiss alert by pantry item ID
const dismissByItem = async (req, res) => {
  try {
    // Check if alert record exists
    const existing = await db.query(
      'SELECT id FROM alerts WHERE item_id = $1 AND user_id = $2',
      [req.params.itemId, req.user.id]
    );

    if (existing.rows.length > 0) {
      await db.query(
        'UPDATE alerts SET dismissed = true WHERE item_id = $1 AND user_id = $2',
        [req.params.itemId, req.user.id]
      );
    } else {
      // Create a dismissed record so it doesn't reappear
      await db.query(
        `INSERT INTO alerts (user_id, item_id, message, type, dismissed, is_read)
         VALUES ($1, $2, 'Dismissed', 'info', true, true)`,
        [req.user.id, req.params.itemId]
      );
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Dismiss by item error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// DELETE /api/alerts/read — Clear all read alerts
const clearRead = async (req, res) => {
  try {
    const result = await db.query(
      'DELETE FROM alerts WHERE user_id = $1 AND is_read = true',
      [req.user.id]
    );
    res.json({ success: true, count: result.rowCount });
  } catch (error) {
    console.error('Clear read alerts error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { getAlerts, generateAlerts, markRead, dismissAlert, dismissByItem, clearRead };

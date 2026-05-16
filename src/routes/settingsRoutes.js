const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const {
  getSettings, updateSettings, getProfile, updateProfile, exportData, clearUserData
} = require('../controllers/settingsController');

router.use(auth);

// Settings routes
router.get('/', getSettings);
router.put('/', updateSettings);

// User profile & data routes
router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.post('/export', exportData);
router.delete('/data', clearUserData);

module.exports = router;

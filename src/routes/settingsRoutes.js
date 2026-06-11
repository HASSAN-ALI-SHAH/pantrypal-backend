const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const {
  getSettings, updateSettings, getProfile, updateProfile, exportData, clearUserData,
  initiateAppReset, verifyAppResetOTP, confirmAppReset
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

// App reset routes
router.post('/reset/initiate', initiateAppReset);
router.post('/reset/verify', verifyAppResetOTP);
router.post('/reset/confirm', confirmAppReset);

module.exports = router;

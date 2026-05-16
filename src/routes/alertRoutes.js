const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const {
  getAlerts, generateAlerts, markRead, dismissAlert, dismissByItem, clearRead
} = require('../controllers/alertController');

router.use(auth);

router.get('/', getAlerts);
router.post('/generate', generateAlerts);
router.delete('/read', clearRead);
router.patch('/:id/read', markRead);
router.patch('/:id/dismiss', dismissAlert);
router.patch('/dismiss-by-item/:itemId', dismissByItem);

module.exports = router;

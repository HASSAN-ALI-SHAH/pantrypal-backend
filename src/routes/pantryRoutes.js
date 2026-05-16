const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const {
  getAllItems, getItem, addItem, updateItem, deleteItem,
  updateStatus, bulkConsume, bulkDelete, getStats,
  getBatches, addBatch,
  logConsumption, getConsumptionLog,
} = require('../controllers/pantryController');

// All routes require authentication
router.use(auth);

// ── Static routes MUST come before /:id to avoid conflicts ──────
router.get('/stats', getStats);

// Bulk operations (must be before /:id)
router.post('/bulk-consume', bulkConsume);
router.post('/bulk-delete', bulkDelete);

// ── CRUD ─────────────────────────────────────────────────────────
router.get('/', getAllItems);
router.post('/', addItem);

// ── Per-item routes (all use /:id) ────────────────────────────────
router.get('/:id', getItem);
router.put('/:id', updateItem);
router.delete('/:id', deleteItem);

// Status
router.patch('/:id/status', updateStatus);

// Purchase batches
router.get('/:id/batches', getBatches);
router.post('/:id/batches', addBatch);

// Consumption tracking
router.post('/:id/consume-qty', logConsumption);
router.get('/:id/consumption', getConsumptionLog);

module.exports = router;

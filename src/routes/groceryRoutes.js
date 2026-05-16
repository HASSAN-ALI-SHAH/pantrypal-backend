const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const {
  getAllGrocery, addGrocery, togglePurchased, restoreGrocery,
  removeGrocery, clearPurchased, bulkPurchase, bulkDeleteGrocery,
  purchaseGrocery,
} = require('../controllers/groceryController');

router.use(auth);

// Clear purchased must be before /:id routes
router.delete('/purchased', clearPurchased);

// Bulk operations
router.post('/bulk-purchase', bulkPurchase);
router.post('/bulk-delete', bulkDeleteGrocery);

// CRUD
router.get('/', getAllGrocery);
router.post('/', addGrocery);
router.post('/:id/purchase', purchaseGrocery);
router.patch('/:id/toggle', togglePurchased);
router.patch('/:id/restore', restoreGrocery);
router.delete('/:id', removeGrocery);

module.exports = router;

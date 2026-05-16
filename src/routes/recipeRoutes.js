const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const {
  getAllRecipes, getRecipe, getSuggestions, createRecipe, deleteRecipe
} = require('../controllers/recipeController');

router.use(auth);

// Suggestions must be before /:id
router.get('/suggestions', getSuggestions);

router.get('/', getAllRecipes);
router.get('/:id', getRecipe);
router.post('/', createRecipe);
router.delete('/:id', deleteRecipe);

module.exports = router;

const db = require('../../db');

// GET /api/recipes — Get all recipes from the catalog
const getAllRecipes = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT rc.*,
        COALESCE(
          json_agg(
            json_build_object(
              'id', rci.id,
              'ingredientName', rci.ingredient_name,
              'quantity', rci.quantity,
              'unit', rci.unit,
              'isKeyIngredient', rci.is_key_ingredient
            )
          ) FILTER (WHERE rci.id IS NOT NULL),
          '[]'
        ) AS ingredients
       FROM recipe_catalog rc
       LEFT JOIN recipe_catalog_ingredients rci ON rci.recipe_id = rc.id
       GROUP BY rc.id
       ORDER BY rc.title`
    );

    const recipes = result.rows.map(mapRecipeToFrontend);
    res.json({ success: true, recipes });
  } catch (error) {
    console.error('Get recipes error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/recipes/:id — Get a single recipe with ingredients
const getRecipe = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT rc.*,
        COALESCE(
          json_agg(
            json_build_object(
              'id', rci.id,
              'ingredientName', rci.ingredient_name,
              'quantity', rci.quantity,
              'unit', rci.unit,
              'isKeyIngredient', rci.is_key_ingredient
            )
          ) FILTER (WHERE rci.id IS NOT NULL),
          '[]'
        ) AS ingredients
       FROM recipe_catalog rc
       LEFT JOIN recipe_catalog_ingredients rci ON rci.recipe_id = rc.id
       WHERE rc.id = $1
       GROUP BY rc.id`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Recipe not found' });
    }

    res.json({ success: true, recipe: mapRecipeToFrontend(result.rows[0]) });
  } catch (error) {
    console.error('Get recipe error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/recipes/suggestions — Get recipes matched to near-expiry pantry items
// This is the KEY endpoint: only shows recipes whose ingredients match expiring items
const getSuggestions = async (req, res) => {
  try {
    // 1. Get user's settings — auto-create row for new users
    const settingsResult = await db.query(
      `INSERT INTO user_settings (user_id, alert_days)
       VALUES ($1, 2)
       ON CONFLICT (user_id) DO UPDATE SET user_id = EXCLUDED.user_id
       RETURNING alert_days`,
      [req.user.id]
    );
    const alertDays = settingsResult.rows[0]?.alert_days ?? 2;

    // 2. Get active pantry items that are near expiry (within alertDays)
    const nearExpiryResult = await db.query(
      `SELECT id, name, category, quantity, unit, expiry_date,
              (expiry_date - CURRENT_DATE) AS days_left
       FROM pantry_items
       WHERE user_id = $1
         AND status = 'active'
         AND expiry_date IS NOT NULL
         AND expiry_date <= CURRENT_DATE + ($2::text || ' days')::INTERVAL
       ORDER BY expiry_date ASC`,
      [req.user.id, alertDays]
    );

    const nearExpiryItems = nearExpiryResult.rows.map(row => ({
      id: row.id,
      name: row.name,
      category: row.category,
      quantity: parseFloat(row.quantity),
      unit: row.unit,
      expiryDate: row.expiry_date || null,
      daysLeft: parseInt(row.days_left)
    }));

    if (nearExpiryItems.length === 0) {
      return res.json({
        success: true,
        recipes: [],
        nearExpiryItems: [],
        message: 'All items are fresh! No urgent recipes needed.'
      });
    }

    // 3. Get significant words from near-expiry items for better matching
    const expiringWords = new Set();
    nearExpiryItems.forEach(i => {
      const name = i.name.toLowerCase();
      expiringWords.add(name); // full name
      // split by spaces/hyphens and keep words > 2 chars (e.g. "chicken broast" -> "chicken", "broast")
      const words = name.split(/[\s-]+/).filter(w => w.length > 2);
      words.forEach(w => expiringWords.add(w));
    });
    const expiringWordsArr = Array.from(expiringWords);

    // 4. Get all recipes with their ingredients
    const recipesResult = await db.query(
      `SELECT rc.*,
        COALESCE(
          json_agg(
            json_build_object(
              'id', rci.id,
              'ingredientName', rci.ingredient_name,
              'quantity', rci.quantity,
              'unit', rci.unit,
              'isKeyIngredient', rci.is_key_ingredient
            )
          ) FILTER (WHERE rci.id IS NOT NULL),
          '[]'
        ) AS ingredients
       FROM recipe_catalog rc
       LEFT JOIN recipe_catalog_ingredients rci ON rci.recipe_id = rc.id
       GROUP BY rc.id`
    );

    // 5. Score and filter recipes by how many near-expiry ingredients they use
    const scoredRecipes = recipesResult.rows
      .map(recipe => {
        const mapped = mapRecipeToFrontend(recipe);
        const ingredients = mapped.ingredients || [];

        // Count how many recipe ingredients match near-expiry pantry items
        const matchedIngredients = ingredients.filter(ing => {
          const ingName = ing.ingredientName.toLowerCase();
          return expiringWordsArr.some(word =>
            ingName.includes(word) || word.includes(ingName)
          );
        });

        return {
          ...mapped,
          matchCount: matchedIngredients.length,
          totalIngredients: ingredients.length,
          matchedIngredients: matchedIngredients.map(i => i.ingredientName),
          matchPercentage: ingredients.length > 0
            ? Math.round((matchedIngredients.length / ingredients.length) * 100)
            : 0
        };
      })
      .filter(r => r.matchCount > 0)  // Only include recipes with at least 1 match
      .sort((a, b) => b.matchCount - a.matchCount); // Best matches first

    res.json({
      success: true,
      recipes: scoredRecipes,
      nearExpiryItems
    });
  } catch (error) {
    console.error('Get recipe suggestions error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// POST /api/recipes — Create a custom recipe
const createRecipe = async (req, res) => {
  try {
    const { title, emoji, description, instructions, difficulty, prepTime, cookTime, servings, tags, ingredients } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, message: 'Recipe title is required' });
    }

    // Insert recipe
    const recipeResult = await db.query(
      `INSERT INTO recipe_catalog (title, emoji, description, instructions, difficulty, prep_time, cook_time, servings, tags)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [title, emoji || '🍽️', description || '', instructions || '', difficulty || 'Medium',
       prepTime || 10, cookTime || 15, servings || 2, tags || []]
    );

    const recipeId = recipeResult.rows[0].id;

    // Insert ingredients if provided
    if (ingredients && Array.isArray(ingredients) && ingredients.length > 0) {
      for (const ing of ingredients) {
        await db.query(
          `INSERT INTO recipe_catalog_ingredients (recipe_id, ingredient_name, quantity, unit, is_key_ingredient)
           VALUES ($1, $2, $3, $4, $5)`,
          [recipeId, ing.ingredientName, ing.quantity || '', ing.unit || '', ing.isKeyIngredient !== false]
        );
      }
    }

    // Fetch the complete recipe
    const fullResult = await db.query(
      `SELECT rc.*,
        COALESCE(
          json_agg(
            json_build_object(
              'id', rci.id,
              'ingredientName', rci.ingredient_name,
              'quantity', rci.quantity,
              'unit', rci.unit,
              'isKeyIngredient', rci.is_key_ingredient
            )
          ) FILTER (WHERE rci.id IS NOT NULL),
          '[]'
        ) AS ingredients
       FROM recipe_catalog rc
       LEFT JOIN recipe_catalog_ingredients rci ON rci.recipe_id = rc.id
       WHERE rc.id = $1
       GROUP BY rc.id`,
      [recipeId]
    );

    res.status(201).json({ success: true, recipe: mapRecipeToFrontend(fullResult.rows[0]) });
  } catch (error) {
    console.error('Create recipe error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// DELETE /api/recipes/:id — Delete a recipe
const deleteRecipe = async (req, res) => {
  try {
    const result = await db.query(
      'DELETE FROM recipe_catalog WHERE id = $1 RETURNING id',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Recipe not found' });
    }

    res.json({ success: true, message: 'Recipe deleted' });
  } catch (error) {
    console.error('Delete recipe error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Helper: map DB row to frontend
function mapRecipeToFrontend(row) {
  return {
    id: row.id,
    name: row.title,
    title: row.title,
    emoji: row.emoji || '🍽️',
    description: row.description,
    instructions: row.instructions,
    difficulty: row.difficulty,
    time: `${(row.prep_time || 0) + (row.cook_time || 0)} min`,
    prepTime: row.prep_time,
    cookTime: row.cook_time,
    servings: row.servings,
    tags: row.tags || [],
    ingredients: row.ingredients || [],
    createdAt: row.created_at
  };
}

module.exports = { getAllRecipes, getRecipe, getSuggestions, createRecipe, deleteRecipe };

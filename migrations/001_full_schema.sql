-- ============================================================
-- PantryPal Full Schema Migration
-- Run this ONCE to upgrade the existing database
-- ============================================================

-- 1. Add missing columns to pantry_items
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='pantry_items' AND column_name='status') THEN
    ALTER TABLE pantry_items ADD COLUMN status VARCHAR(20) DEFAULT 'active';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='pantry_items' AND column_name='notes') THEN
    ALTER TABLE pantry_items ADD COLUMN notes TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='pantry_items' AND column_name='image_url') THEN
    ALTER TABLE pantry_items ADD COLUMN image_url TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='pantry_items' AND column_name='entry_date') THEN
    ALTER TABLE pantry_items ADD COLUMN entry_date DATE DEFAULT CURRENT_DATE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='pantry_items' AND column_name='auto_add_to_grocery') THEN
    ALTER TABLE pantry_items ADD COLUMN auto_add_to_grocery BOOLEAN DEFAULT FALSE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='pantry_items' AND column_name='current_quantity') THEN
    ALTER TABLE pantry_items ADD COLUMN current_quantity NUMERIC;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='pantry_items' AND column_name='min_quantity') THEN
    ALTER TABLE pantry_items ADD COLUMN min_quantity NUMERIC;
  END IF;
END $$;

-- 2. Add missing columns to grocery_items
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='grocery_items' AND column_name='category') THEN
    ALTER TABLE grocery_items ADD COLUMN category VARCHAR(100);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='grocery_items' AND column_name='suggested_quantity') THEN
    ALTER TABLE grocery_items ADD COLUMN suggested_quantity NUMERIC DEFAULT 1;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='grocery_items' AND column_name='purchased_at') THEN
    ALTER TABLE grocery_items ADD COLUMN purchased_at TIMESTAMP;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='grocery_items' AND column_name='triggered_by') THEN
    ALTER TABLE grocery_items ADD COLUMN triggered_by VARCHAR(20) DEFAULT 'manual';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='grocery_items' AND column_name='min_quantity') THEN
    ALTER TABLE grocery_items ADD COLUMN min_quantity NUMERIC;
  END IF;
END $$;

-- 3. Add missing columns to alerts
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='alerts' AND column_name='item_id') THEN
    ALTER TABLE alerts ADD COLUMN item_id INTEGER REFERENCES pantry_items(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='alerts' AND column_name='days_left') THEN
    ALTER TABLE alerts ADD COLUMN days_left INTEGER;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='alerts' AND column_name='dismissed') THEN
    ALTER TABLE alerts ADD COLUMN dismissed BOOLEAN DEFAULT FALSE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='alerts' AND column_name='item_name') THEN
    ALTER TABLE alerts ADD COLUMN item_name VARCHAR(255);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='alerts' AND column_name='category') THEN
    ALTER TABLE alerts ADD COLUMN category VARCHAR(100);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='alerts' AND column_name='expiry_date') THEN
    ALTER TABLE alerts ADD COLUMN expiry_date DATE;
  END IF;
END $$;

-- 4. Create user_settings table
CREATE TABLE IF NOT EXISTS user_settings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    alert_days INTEGER DEFAULT 3,
    show_expired_in_dashboard BOOLEAN DEFAULT TRUE,
    default_unit VARCHAR(50) DEFAULT 'Pieces',
    default_category VARCHAR(100) DEFAULT 'Other',
    items_per_page INTEGER DEFAULT 10,
    browser_notifications BOOLEAN DEFAULT FALSE,
    alert_sound BOOLEAN DEFAULT FALSE,
    theme VARCHAR(20) DEFAULT 'light',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Create recipe_catalog table (global recipes, not user-specific)
CREATE TABLE IF NOT EXISTS recipe_catalog (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    emoji VARCHAR(10) DEFAULT '🍽️',
    description TEXT,
    instructions TEXT,
    difficulty VARCHAR(20) DEFAULT 'Medium',
    prep_time INTEGER DEFAULT 10,
    cook_time INTEGER DEFAULT 15,
    servings INTEGER DEFAULT 2,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Create recipe_catalog_ingredients table
CREATE TABLE IF NOT EXISTS recipe_catalog_ingredients (
    id SERIAL PRIMARY KEY,
    recipe_id INTEGER REFERENCES recipe_catalog(id) ON DELETE CASCADE,
    ingredient_name VARCHAR(255) NOT NULL,
    quantity VARCHAR(50),
    unit VARCHAR(50),
    is_key_ingredient BOOLEAN DEFAULT TRUE
);

-- 7. Seed the recipe catalog with common recipes
INSERT INTO recipe_catalog (title, emoji, description, instructions, difficulty, prep_time, cook_time, servings, tags)
VALUES
  ('Milk Chai', '☕', 'Classic Pakistani doodh patti chai', 'Boil water with tea leaves. Add milk, sugar, and cardamom. Simmer for 5 min.', 'Easy', 2, 8, 2, ARRAY['Dairy','Beverages']),
  ('Chicken Karahi', '🍗', 'Spicy tomato-based chicken karahi', 'Cook chicken with tomatoes, green chilies, ginger, garlic. Add spices and cook until oil separates.', 'Medium', 15, 30, 4, ARRAY['Meat','Spices']),
  ('Vegetable Stir Fry', '🥦', 'Quick mixed vegetable stir fry', 'Heat oil, sauté garlic, add broccoli, spinach, tomatoes. Season with soy sauce and pepper.', 'Easy', 10, 10, 2, ARRAY['Vegetables']),
  ('Fruit Smoothie', '🍓', 'Fresh mixed fruit smoothie', 'Blend bananas, strawberries, yogurt, and a splash of milk until smooth.', 'Easy', 5, 0, 2, ARRAY['Fruits','Dairy']),
  ('Egg Omelette', '🥚', 'Quick fluffy omelette', 'Whisk eggs with salt and pepper. Cook in butter on medium heat. Add cheese if desired.', 'Easy', 3, 5, 1, ARRAY['Dairy']),
  ('Pasta Alfredo', '🍝', 'Creamy pasta with parmesan', 'Cook pasta al dente. Make sauce with butter, cream, garlic, and parmesan. Toss together.', 'Medium', 10, 15, 3, ARRAY['Grains','Dairy']),
  ('Chicken Sandwich', '🥪', 'Grilled chicken breast sandwich', 'Grill chicken, toast bread, layer with lettuce, tomato, and mayo.', 'Easy', 10, 10, 2, ARRAY['Meat','Grains']),
  ('Rice Pilaf', '🍚', 'Fragrant basmati rice pilaf', 'Sauté onions, add rice, stock, and spices. Cook covered for 20 min.', 'Medium', 10, 25, 4, ARRAY['Grains','Spices']),
  ('Greek Salad', '🥗', 'Fresh salad with feta', 'Chop tomatoes, cucumber, onion. Add olives and feta. Dress with olive oil and lemon.', 'Easy', 10, 0, 2, ARRAY['Vegetables','Dairy']),
  ('Banana Pancakes', '🥞', 'Healthy banana oat pancakes', 'Mash bananas, mix with oats and eggs. Cook on griddle until golden.', 'Easy', 5, 10, 2, ARRAY['Fruits','Grains']),
  ('Salmon Teriyaki', '🐟', 'Pan-seared salmon with teriyaki glaze', 'Season salmon, pan-sear skin-side down. Glaze with soy, honey, ginger sauce.', 'Medium', 5, 12, 2, ARRAY['Meat']),
  ('Spinach Soup', '🍲', 'Creamy spinach and potato soup', 'Sauté onions and garlic. Add spinach and potatoes. Blend with cream.', 'Easy', 10, 20, 4, ARRAY['Vegetables','Dairy']),
  ('Cheese Toast', '🧀', 'Quick melted cheese on toast', 'Top bread with butter and cheese slices. Broil until melted and bubbly.', 'Easy', 2, 5, 1, ARRAY['Dairy','Grains']),
  ('Chicken Rice Bowl', '🍛', 'Simple chicken and rice bowl', 'Cook rice. Sauté chicken with spices. Serve over rice with vegetables.', 'Medium', 10, 25, 2, ARRAY['Meat','Grains']),
  ('Mango Lassi', '🥭', 'Traditional mango yogurt drink', 'Blend ripe mango, yogurt, milk, sugar, and cardamom until smooth.', 'Easy', 5, 0, 2, ARRAY['Fruits','Dairy']),
  ('Avocado Toast', '🥑', 'Smashed avocado on sourdough', 'Toast bread, mash avocado with lemon and salt. Top with chili flakes.', 'Easy', 5, 3, 1, ARRAY['Fruits','Grains']),
  ('Tomato Soup', '🍅', 'Classic roasted tomato soup', 'Roast tomatoes with garlic. Blend with basil, cream, and broth.', 'Easy', 10, 25, 4, ARRAY['Vegetables']),
  ('Butter Chicken', '🍗', 'Creamy tomato butter chicken', 'Marinate chicken in yogurt and spices. Cook in tomato-butter-cream sauce.', 'Hard', 20, 35, 4, ARRAY['Meat','Dairy','Spices']),
  ('Fresh Juice', '🧃', 'Orange and apple fresh juice', 'Juice oranges and apples together. Serve chilled with ice.', 'Easy', 5, 0, 2, ARRAY['Fruits','Beverages']),
  ('Oatmeal Bowl', '🥣', 'Warm oatmeal with fruits and honey', 'Cook oats with milk. Top with sliced bananas, berries, and honey.', 'Easy', 3, 5, 1, ARRAY['Grains','Fruits','Dairy'])
ON CONFLICT DO NOTHING;

-- 8. Seed recipe ingredients (linking to recipe_catalog)
-- We use a DO block to insert ingredients referencing recipe IDs by title
DO $$
DECLARE
  r_id INTEGER;
BEGIN
  -- Milk Chai
  SELECT id INTO r_id FROM recipe_catalog WHERE title = 'Milk Chai' LIMIT 1;
  IF r_id IS NOT NULL THEN
    INSERT INTO recipe_catalog_ingredients (recipe_id, ingredient_name, quantity, unit, is_key_ingredient) VALUES
      (r_id, 'Whole Milk', '500', 'ml', true),
      (r_id, 'Tea Leaves', '2', 'tsp', false);
  END IF;

  -- Chicken Karahi
  SELECT id INTO r_id FROM recipe_catalog WHERE title = 'Chicken Karahi' LIMIT 1;
  IF r_id IS NOT NULL THEN
    INSERT INTO recipe_catalog_ingredients (recipe_id, ingredient_name, quantity, unit, is_key_ingredient) VALUES
      (r_id, 'Chicken Breast', '500', 'g', true),
      (r_id, 'Cherry Tomatoes', '300', 'g', true),
      (r_id, 'Green Chilies', '4', 'pcs', false);
  END IF;

  -- Vegetable Stir Fry
  SELECT id INTO r_id FROM recipe_catalog WHERE title = 'Vegetable Stir Fry' LIMIT 1;
  IF r_id IS NOT NULL THEN
    INSERT INTO recipe_catalog_ingredients (recipe_id, ingredient_name, quantity, unit, is_key_ingredient) VALUES
      (r_id, 'Broccoli', '200', 'g', true),
      (r_id, 'Baby Spinach', '100', 'g', true),
      (r_id, 'Cherry Tomatoes', '150', 'g', true);
  END IF;

  -- Fruit Smoothie
  SELECT id INTO r_id FROM recipe_catalog WHERE title = 'Fruit Smoothie' LIMIT 1;
  IF r_id IS NOT NULL THEN
    INSERT INTO recipe_catalog_ingredients (recipe_id, ingredient_name, quantity, unit, is_key_ingredient) VALUES
      (r_id, 'Bananas', '2', 'pcs', true),
      (r_id, 'Strawberries', '200', 'g', true),
      (r_id, 'Greek Yogurt', '1', 'cup', true),
      (r_id, 'Whole Milk', '100', 'ml', false);
  END IF;

  -- Egg Omelette
  SELECT id INTO r_id FROM recipe_catalog WHERE title = 'Egg Omelette' LIMIT 1;
  IF r_id IS NOT NULL THEN
    INSERT INTO recipe_catalog_ingredients (recipe_id, ingredient_name, quantity, unit, is_key_ingredient) VALUES
      (r_id, 'Butter', '1', 'tbsp', true),
      (r_id, 'Cheddar Cheese', '50', 'g', false);
  END IF;

  -- Pasta Alfredo
  SELECT id INTO r_id FROM recipe_catalog WHERE title = 'Pasta Alfredo' LIMIT 1;
  IF r_id IS NOT NULL THEN
    INSERT INTO recipe_catalog_ingredients (recipe_id, ingredient_name, quantity, unit, is_key_ingredient) VALUES
      (r_id, 'Pasta', '300', 'g', true),
      (r_id, 'Butter', '50', 'g', true),
      (r_id, 'Cheddar Cheese', '100', 'g', true),
      (r_id, 'Whole Milk', '200', 'ml', false);
  END IF;

  -- Chicken Sandwich
  SELECT id INTO r_id FROM recipe_catalog WHERE title = 'Chicken Sandwich' LIMIT 1;
  IF r_id IS NOT NULL THEN
    INSERT INTO recipe_catalog_ingredients (recipe_id, ingredient_name, quantity, unit, is_key_ingredient) VALUES
      (r_id, 'Chicken Breast', '200', 'g', true),
      (r_id, 'Whole Wheat Bread', '4', 'slices', true),
      (r_id, 'Cherry Tomatoes', '100', 'g', false);
  END IF;

  -- Rice Pilaf
  SELECT id INTO r_id FROM recipe_catalog WHERE title = 'Rice Pilaf' LIMIT 1;
  IF r_id IS NOT NULL THEN
    INSERT INTO recipe_catalog_ingredients (recipe_id, ingredient_name, quantity, unit, is_key_ingredient) VALUES
      (r_id, 'Basmati Rice', '2', 'cups', true),
      (r_id, 'Butter', '2', 'tbsp', false);
  END IF;

  -- Greek Salad
  SELECT id INTO r_id FROM recipe_catalog WHERE title = 'Greek Salad' LIMIT 1;
  IF r_id IS NOT NULL THEN
    INSERT INTO recipe_catalog_ingredients (recipe_id, ingredient_name, quantity, unit, is_key_ingredient) VALUES
      (r_id, 'Cherry Tomatoes', '200', 'g', true),
      (r_id, 'Cheddar Cheese', '100', 'g', true);
  END IF;

  -- Banana Pancakes
  SELECT id INTO r_id FROM recipe_catalog WHERE title = 'Banana Pancakes' LIMIT 1;
  IF r_id IS NOT NULL THEN
    INSERT INTO recipe_catalog_ingredients (recipe_id, ingredient_name, quantity, unit, is_key_ingredient) VALUES
      (r_id, 'Bananas', '2', 'pcs', true),
      (r_id, 'Oats', '1', 'cup', true),
      (r_id, 'Whole Milk', '100', 'ml', false);
  END IF;

  -- Salmon Teriyaki
  SELECT id INTO r_id FROM recipe_catalog WHERE title = 'Salmon Teriyaki' LIMIT 1;
  IF r_id IS NOT NULL THEN
    INSERT INTO recipe_catalog_ingredients (recipe_id, ingredient_name, quantity, unit, is_key_ingredient) VALUES
      (r_id, 'Salmon Fillet', '300', 'g', true);
  END IF;

  -- Spinach Soup
  SELECT id INTO r_id FROM recipe_catalog WHERE title = 'Spinach Soup' LIMIT 1;
  IF r_id IS NOT NULL THEN
    INSERT INTO recipe_catalog_ingredients (recipe_id, ingredient_name, quantity, unit, is_key_ingredient) VALUES
      (r_id, 'Baby Spinach', '300', 'g', true),
      (r_id, 'Whole Milk', '200', 'ml', false),
      (r_id, 'Butter', '1', 'tbsp', false);
  END IF;

  -- Cheese Toast
  SELECT id INTO r_id FROM recipe_catalog WHERE title = 'Cheese Toast' LIMIT 1;
  IF r_id IS NOT NULL THEN
    INSERT INTO recipe_catalog_ingredients (recipe_id, ingredient_name, quantity, unit, is_key_ingredient) VALUES
      (r_id, 'Whole Wheat Bread', '2', 'slices', true),
      (r_id, 'Cheddar Cheese', '60', 'g', true),
      (r_id, 'Butter', '1', 'tbsp', false);
  END IF;

  -- Chicken Rice Bowl
  SELECT id INTO r_id FROM recipe_catalog WHERE title = 'Chicken Rice Bowl' LIMIT 1;
  IF r_id IS NOT NULL THEN
    INSERT INTO recipe_catalog_ingredients (recipe_id, ingredient_name, quantity, unit, is_key_ingredient) VALUES
      (r_id, 'Chicken Breast', '300', 'g', true),
      (r_id, 'Basmati Rice', '1', 'cup', true),
      (r_id, 'Broccoli', '100', 'g', false);
  END IF;

  -- Mango Lassi
  SELECT id INTO r_id FROM recipe_catalog WHERE title = 'Mango Lassi' LIMIT 1;
  IF r_id IS NOT NULL THEN
    INSERT INTO recipe_catalog_ingredients (recipe_id, ingredient_name, quantity, unit, is_key_ingredient) VALUES
      (r_id, 'Greek Yogurt', '1', 'cup', true),
      (r_id, 'Whole Milk', '100', 'ml', false);
  END IF;

  -- Avocado Toast
  SELECT id INTO r_id FROM recipe_catalog WHERE title = 'Avocado Toast' LIMIT 1;
  IF r_id IS NOT NULL THEN
    INSERT INTO recipe_catalog_ingredients (recipe_id, ingredient_name, quantity, unit, is_key_ingredient) VALUES
      (r_id, 'Avocados', '1', 'pc', true),
      (r_id, 'Whole Wheat Bread', '2', 'slices', true);
  END IF;

  -- Tomato Soup
  SELECT id INTO r_id FROM recipe_catalog WHERE title = 'Tomato Soup' LIMIT 1;
  IF r_id IS NOT NULL THEN
    INSERT INTO recipe_catalog_ingredients (recipe_id, ingredient_name, quantity, unit, is_key_ingredient) VALUES
      (r_id, 'Cherry Tomatoes', '500', 'g', true),
      (r_id, 'Whole Milk', '100', 'ml', false);
  END IF;

  -- Butter Chicken
  SELECT id INTO r_id FROM recipe_catalog WHERE title = 'Butter Chicken' LIMIT 1;
  IF r_id IS NOT NULL THEN
    INSERT INTO recipe_catalog_ingredients (recipe_id, ingredient_name, quantity, unit, is_key_ingredient) VALUES
      (r_id, 'Chicken Breast', '500', 'g', true),
      (r_id, 'Greek Yogurt', '1', 'cup', true),
      (r_id, 'Butter', '50', 'g', true),
      (r_id, 'Cherry Tomatoes', '300', 'g', true);
  END IF;

  -- Fresh Juice
  SELECT id INTO r_id FROM recipe_catalog WHERE title = 'Fresh Juice' LIMIT 1;
  IF r_id IS NOT NULL THEN
    INSERT INTO recipe_catalog_ingredients (recipe_id, ingredient_name, quantity, unit, is_key_ingredient) VALUES
      (r_id, 'Red Apples', '2', 'pcs', true),
      (r_id, 'Orange Juice', '200', 'ml', true);
  END IF;

  -- Oatmeal Bowl
  SELECT id INTO r_id FROM recipe_catalog WHERE title = 'Oatmeal Bowl' LIMIT 1;
  IF r_id IS NOT NULL THEN
    INSERT INTO recipe_catalog_ingredients (recipe_id, ingredient_name, quantity, unit, is_key_ingredient) VALUES
      (r_id, 'Oats', '1', 'cup', true),
      (r_id, 'Whole Milk', '200', 'ml', true),
      (r_id, 'Bananas', '1', 'pc', true),
      (r_id, 'Strawberries', '100', 'g', false);
  END IF;
END $$;

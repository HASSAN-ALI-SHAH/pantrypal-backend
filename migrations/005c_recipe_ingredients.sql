-- 005c: Seed all recipe ingredients with precise quantities

DO $$
DECLARE r_id INTEGER;
BEGIN
  -- Milk Chai
  SELECT id INTO r_id FROM recipe_catalog WHERE title='Milk Chai' LIMIT 1;
  IF r_id IS NOT NULL THEN
    INSERT INTO recipe_catalog_ingredients (recipe_id, ingredient_name, quantity, unit, is_key_ingredient) VALUES
      (r_id, 'Whole Milk', '500', 'ml', true),
      (r_id, 'Tea Leaves', '2', 'tsp', false),
      (r_id, 'Sugar', '2', 'tbsp', false),
      (r_id, 'Cardamom', '2', 'pods', false),
      (r_id, 'Cinnamon', '1', 'stick', false);
  END IF;

  -- Chicken Karahi
  SELECT id INTO r_id FROM recipe_catalog WHERE title='Chicken Karahi' LIMIT 1;
  IF r_id IS NOT NULL THEN
    INSERT INTO recipe_catalog_ingredients (recipe_id, ingredient_name, quantity, unit, is_key_ingredient) VALUES
      (r_id, 'Chicken', '500', 'g', true),
      (r_id, 'Tomatoes', '3', 'pcs', true),
      (r_id, 'Green Chilies', '5', 'pcs', false),
      (r_id, 'Ginger', '1', 'tbsp', false),
      (r_id, 'Garlic', '1', 'tbsp', false),
      (r_id, 'Cooking Oil', '3', 'tbsp', false);
  END IF;

  -- Vegetable Stir Fry
  SELECT id INTO r_id FROM recipe_catalog WHERE title='Vegetable Stir Fry' LIMIT 1;
  IF r_id IS NOT NULL THEN
    INSERT INTO recipe_catalog_ingredients (recipe_id, ingredient_name, quantity, unit, is_key_ingredient) VALUES
      (r_id, 'Broccoli', '200', 'g', true),
      (r_id, 'Spinach', '100', 'g', true),
      (r_id, 'Tomatoes', '150', 'g', true),
      (r_id, 'Bell Pepper', '1', 'pc', true),
      (r_id, 'Garlic', '3', 'cloves', false),
      (r_id, 'Soy Sauce', '1', 'tbsp', false);
  END IF;

  -- Fruit Smoothie
  SELECT id INTO r_id FROM recipe_catalog WHERE title='Fruit Smoothie' LIMIT 1;
  IF r_id IS NOT NULL THEN
    INSERT INTO recipe_catalog_ingredients (recipe_id, ingredient_name, quantity, unit, is_key_ingredient) VALUES
      (r_id, 'Bananas', '2', 'pcs', true),
      (r_id, 'Strawberries', '200', 'g', true),
      (r_id, 'Yogurt', '1', 'cup', true),
      (r_id, 'Milk', '100', 'ml', false),
      (r_id, 'Honey', '1', 'tbsp', false);
  END IF;

  -- Egg Omelette
  SELECT id INTO r_id FROM recipe_catalog WHERE title='Egg Omelette' LIMIT 1;
  IF r_id IS NOT NULL THEN
    INSERT INTO recipe_catalog_ingredients (recipe_id, ingredient_name, quantity, unit, is_key_ingredient) VALUES
      (r_id, 'Eggs', '3', 'pcs', true),
      (r_id, 'Butter', '1', 'tbsp', false),
      (r_id, 'Cheese', '50', 'g', false),
      (r_id, 'Milk', '2', 'tbsp', false);
  END IF;

  -- Pasta Alfredo
  SELECT id INTO r_id FROM recipe_catalog WHERE title='Pasta Alfredo' LIMIT 1;
  IF r_id IS NOT NULL THEN
    INSERT INTO recipe_catalog_ingredients (recipe_id, ingredient_name, quantity, unit, is_key_ingredient) VALUES
      (r_id, 'Pasta', '300', 'g', true),
      (r_id, 'Butter', '50', 'g', true),
      (r_id, 'Cream', '200', 'ml', true),
      (r_id, 'Cheese', '100', 'g', true),
      (r_id, 'Garlic', '3', 'cloves', false);
  END IF;

  -- Chicken Sandwich
  SELECT id INTO r_id FROM recipe_catalog WHERE title='Chicken Sandwich' LIMIT 1;
  IF r_id IS NOT NULL THEN
    INSERT INTO recipe_catalog_ingredients (recipe_id, ingredient_name, quantity, unit, is_key_ingredient) VALUES
      (r_id, 'Chicken', '200', 'g', true),
      (r_id, 'Bread', '4', 'slices', true),
      (r_id, 'Tomatoes', '1', 'pc', false),
      (r_id, 'Lettuce', '2', 'leaves', false),
      (r_id, 'Mayonnaise', '2', 'tbsp', false);
  END IF;

  -- Rice Pilaf
  SELECT id INTO r_id FROM recipe_catalog WHERE title='Rice Pilaf' LIMIT 1;
  IF r_id IS NOT NULL THEN
    INSERT INTO recipe_catalog_ingredients (recipe_id, ingredient_name, quantity, unit, is_key_ingredient) VALUES
      (r_id, 'Rice', '2', 'cups', true),
      (r_id, 'Butter', '2', 'tbsp', false),
      (r_id, 'Onion', '1', 'pc', false),
      (r_id, 'Cardamom', '3', 'pods', false);
  END IF;

  -- Greek Salad
  SELECT id INTO r_id FROM recipe_catalog WHERE title='Greek Salad' LIMIT 1;
  IF r_id IS NOT NULL THEN
    INSERT INTO recipe_catalog_ingredients (recipe_id, ingredient_name, quantity, unit, is_key_ingredient) VALUES
      (r_id, 'Tomatoes', '200', 'g', true),
      (r_id, 'Cucumber', '1', 'pc', true),
      (r_id, 'Cheese', '100', 'g', true),
      (r_id, 'Olives', '80', 'g', false),
      (r_id, 'Onion', '0.5', 'pc', false),
      (r_id, 'Olive Oil', '3', 'tbsp', false);
  END IF;

  -- Banana Pancakes
  SELECT id INTO r_id FROM recipe_catalog WHERE title='Banana Pancakes' LIMIT 1;
  IF r_id IS NOT NULL THEN
    INSERT INTO recipe_catalog_ingredients (recipe_id, ingredient_name, quantity, unit, is_key_ingredient) VALUES
      (r_id, 'Bananas', '2', 'pcs', true),
      (r_id, 'Oats', '1', 'cup', true),
      (r_id, 'Eggs', '2', 'pcs', true),
      (r_id, 'Milk', '100', 'ml', false);
  END IF;

  -- Butter Chicken
  SELECT id INTO r_id FROM recipe_catalog WHERE title='Butter Chicken' LIMIT 1;
  IF r_id IS NOT NULL THEN
    INSERT INTO recipe_catalog_ingredients (recipe_id, ingredient_name, quantity, unit, is_key_ingredient) VALUES
      (r_id, 'Chicken', '500', 'g', true),
      (r_id, 'Yogurt', '1', 'cup', true),
      (r_id, 'Butter', '4', 'tbsp', true),
      (r_id, 'Tomatoes', '300', 'g', true),
      (r_id, 'Cream', '200', 'ml', true),
      (r_id, 'Onion', '1', 'pc', false);
  END IF;

  -- Spinach Soup
  SELECT id INTO r_id FROM recipe_catalog WHERE title='Spinach Soup' LIMIT 1;
  IF r_id IS NOT NULL THEN
    INSERT INTO recipe_catalog_ingredients (recipe_id, ingredient_name, quantity, unit, is_key_ingredient) VALUES
      (r_id, 'Spinach', '300', 'g', true),
      (r_id, 'Potatoes', '2', 'pcs', true),
      (r_id, 'Cream', '100', 'ml', false),
      (r_id, 'Butter', '1', 'tbsp', false),
      (r_id, 'Onion', '1', 'pc', false);
  END IF;

  -- Cheese Toast
  SELECT id INTO r_id FROM recipe_catalog WHERE title='Cheese Toast' LIMIT 1;
  IF r_id IS NOT NULL THEN
    INSERT INTO recipe_catalog_ingredients (recipe_id, ingredient_name, quantity, unit, is_key_ingredient) VALUES
      (r_id, 'Bread', '2', 'slices', true),
      (r_id, 'Cheese', '60', 'g', true),
      (r_id, 'Butter', '1', 'tbsp', false);
  END IF;

  -- Chicken Rice Bowl
  SELECT id INTO r_id FROM recipe_catalog WHERE title='Chicken Rice Bowl' LIMIT 1;
  IF r_id IS NOT NULL THEN
    INSERT INTO recipe_catalog_ingredients (recipe_id, ingredient_name, quantity, unit, is_key_ingredient) VALUES
      (r_id, 'Chicken', '300', 'g', true),
      (r_id, 'Rice', '1', 'cup', true),
      (r_id, 'Broccoli', '100', 'g', false);
  END IF;

  -- Mango Lassi
  SELECT id INTO r_id FROM recipe_catalog WHERE title='Mango Lassi' LIMIT 1;
  IF r_id IS NOT NULL THEN
    INSERT INTO recipe_catalog_ingredients (recipe_id, ingredient_name, quantity, unit, is_key_ingredient) VALUES
      (r_id, 'Mango', '1', 'pc', true),
      (r_id, 'Yogurt', '1', 'cup', true),
      (r_id, 'Milk', '100', 'ml', false),
      (r_id, 'Sugar', '2', 'tbsp', false);
  END IF;

  -- Avocado Toast
  SELECT id INTO r_id FROM recipe_catalog WHERE title='Avocado Toast' LIMIT 1;
  IF r_id IS NOT NULL THEN
    INSERT INTO recipe_catalog_ingredients (recipe_id, ingredient_name, quantity, unit, is_key_ingredient) VALUES
      (r_id, 'Avocado', '1', 'pc', true),
      (r_id, 'Bread', '2', 'slices', true),
      (r_id, 'Lemon', '1', 'tbsp', false);
  END IF;

  -- Tomato Soup
  SELECT id INTO r_id FROM recipe_catalog WHERE title='Tomato Soup' LIMIT 1;
  IF r_id IS NOT NULL THEN
    INSERT INTO recipe_catalog_ingredients (recipe_id, ingredient_name, quantity, unit, is_key_ingredient) VALUES
      (r_id, 'Tomatoes', '500', 'g', true),
      (r_id, 'Garlic', '4', 'cloves', false),
      (r_id, 'Cream', '100', 'ml', false),
      (r_id, 'Basil', '1', 'handful', false);
  END IF;

  -- Fresh Juice
  SELECT id INTO r_id FROM recipe_catalog WHERE title='Fresh Juice' LIMIT 1;
  IF r_id IS NOT NULL THEN
    INSERT INTO recipe_catalog_ingredients (recipe_id, ingredient_name, quantity, unit, is_key_ingredient) VALUES
      (r_id, 'Oranges', '4', 'pcs', true),
      (r_id, 'Apples', '2', 'pcs', true);
  END IF;

  -- Oatmeal Bowl
  SELECT id INTO r_id FROM recipe_catalog WHERE title='Oatmeal Bowl' LIMIT 1;
  IF r_id IS NOT NULL THEN
    INSERT INTO recipe_catalog_ingredients (recipe_id, ingredient_name, quantity, unit, is_key_ingredient) VALUES
      (r_id, 'Oats', '1', 'cup', true),
      (r_id, 'Milk', '200', 'ml', true),
      (r_id, 'Bananas', '1', 'pc', true),
      (r_id, 'Strawberries', '100', 'g', false),
      (r_id, 'Honey', '1', 'tbsp', false);
  END IF;

  -- Salmon Teriyaki
  SELECT id INTO r_id FROM recipe_catalog WHERE title='Salmon Teriyaki' LIMIT 1;
  IF r_id IS NOT NULL THEN
    INSERT INTO recipe_catalog_ingredients (recipe_id, ingredient_name, quantity, unit, is_key_ingredient) VALUES
      (r_id, 'Salmon', '300', 'g', true),
      (r_id, 'Soy Sauce', '3', 'tbsp', false),
      (r_id, 'Honey', '2', 'tbsp', false),
      (r_id, 'Ginger', '1', 'tsp', false);
  END IF;

  -- Dal Tadka
  SELECT id INTO r_id FROM recipe_catalog WHERE title='Dal Tadka' LIMIT 1;
  IF r_id IS NOT NULL THEN
    INSERT INTO recipe_catalog_ingredients (recipe_id, ingredient_name, quantity, unit, is_key_ingredient) VALUES
      (r_id, 'Lentils', '1', 'cup', true),
      (r_id, 'Onion', '1', 'pc', false),
      (r_id, 'Tomatoes', '2', 'pcs', true),
      (r_id, 'Garlic', '2', 'cloves', false),
      (r_id, 'Ghee', '2', 'tbsp', false),
      (r_id, 'Cumin Seeds', '1', 'tsp', false);
  END IF;

  -- Fish Tacos
  SELECT id INTO r_id FROM recipe_catalog WHERE title='Fish Tacos' LIMIT 1;
  IF r_id IS NOT NULL THEN
    INSERT INTO recipe_catalog_ingredients (recipe_id, ingredient_name, quantity, unit, is_key_ingredient) VALUES
      (r_id, 'Fish', '300', 'g', true),
      (r_id, 'Tortillas', '6', 'pcs', true),
      (r_id, 'Cabbage', '1', 'cup', false),
      (r_id, 'Sour Cream', '0.5', 'cup', false),
      (r_id, 'Lime', '1', 'pc', false);
  END IF;

  -- Mushroom Risotto
  SELECT id INTO r_id FROM recipe_catalog WHERE title='Mushroom Risotto' LIMIT 1;
  IF r_id IS NOT NULL THEN
    INSERT INTO recipe_catalog_ingredients (recipe_id, ingredient_name, quantity, unit, is_key_ingredient) VALUES
      (r_id, 'Mushrooms', '250', 'g', true),
      (r_id, 'Rice', '1.5', 'cups', true),
      (r_id, 'Butter', '2', 'tbsp', true),
      (r_id, 'Cheese', '50', 'g', false),
      (r_id, 'Onion', '1', 'pc', false);
  END IF;

  -- Yogurt Parfait
  SELECT id INTO r_id FROM recipe_catalog WHERE title='Yogurt Parfait' LIMIT 1;
  IF r_id IS NOT NULL THEN
    INSERT INTO recipe_catalog_ingredients (recipe_id, ingredient_name, quantity, unit, is_key_ingredient) VALUES
      (r_id, 'Yogurt', '1', 'cup', true),
      (r_id, 'Granola', '3', 'tbsp', false),
      (r_id, 'Strawberries', '100', 'g', true),
      (r_id, 'Honey', '1', 'tbsp', false);
  END IF;

  -- Garlic Bread
  SELECT id INTO r_id FROM recipe_catalog WHERE title='Garlic Bread' LIMIT 1;
  IF r_id IS NOT NULL THEN
    INSERT INTO recipe_catalog_ingredients (recipe_id, ingredient_name, quantity, unit, is_key_ingredient) VALUES
      (r_id, 'Bread', '1', 'baguette', true),
      (r_id, 'Butter', '4', 'tbsp', true),
      (r_id, 'Garlic', '3', 'cloves', true),
      (r_id, 'Cheese', '30', 'g', false);
  END IF;

  -- Chicken Soup
  SELECT id INTO r_id FROM recipe_catalog WHERE title='Chicken Soup' LIMIT 1;
  IF r_id IS NOT NULL THEN
    INSERT INTO recipe_catalog_ingredients (recipe_id, ingredient_name, quantity, unit, is_key_ingredient) VALUES
      (r_id, 'Chicken', '300', 'g', true),
      (r_id, 'Carrots', '2', 'pcs', true),
      (r_id, 'Celery', '2', 'stalks', false),
      (r_id, 'Onion', '1', 'pc', false),
      (r_id, 'Noodles', '1', 'cup', false);
  END IF;

  -- Paneer Tikka
  SELECT id INTO r_id FROM recipe_catalog WHERE title='Paneer Tikka' LIMIT 1;
  IF r_id IS NOT NULL THEN
    INSERT INTO recipe_catalog_ingredients (recipe_id, ingredient_name, quantity, unit, is_key_ingredient) VALUES
      (r_id, 'Paneer', '250', 'g', true),
      (r_id, 'Yogurt', '1', 'cup', true),
      (r_id, 'Bell Pepper', '1', 'pc', false),
      (r_id, 'Onion', '1', 'pc', false);
  END IF;

  -- Fried Rice
  SELECT id INTO r_id FROM recipe_catalog WHERE title='Fried Rice' LIMIT 1;
  IF r_id IS NOT NULL THEN
    INSERT INTO recipe_catalog_ingredients (recipe_id, ingredient_name, quantity, unit, is_key_ingredient) VALUES
      (r_id, 'Rice', '3', 'cups', true),
      (r_id, 'Eggs', '2', 'pcs', true),
      (r_id, 'Carrots', '1', 'pc', false),
      (r_id, 'Peas', '0.5', 'cup', false),
      (r_id, 'Soy Sauce', '2', 'tbsp', false);
  END IF;

  -- Chocolate Milkshake
  SELECT id INTO r_id FROM recipe_catalog WHERE title='Chocolate Milkshake' LIMIT 1;
  IF r_id IS NOT NULL THEN
    INSERT INTO recipe_catalog_ingredients (recipe_id, ingredient_name, quantity, unit, is_key_ingredient) VALUES
      (r_id, 'Milk', '200', 'ml', true),
      (r_id, 'Ice Cream', '2', 'scoops', true),
      (r_id, 'Cocoa Powder', '2', 'tbsp', false);
  END IF;

  -- Beef Stew
  SELECT id INTO r_id FROM recipe_catalog WHERE title='Beef Stew' LIMIT 1;
  IF r_id IS NOT NULL THEN
    INSERT INTO recipe_catalog_ingredients (recipe_id, ingredient_name, quantity, unit, is_key_ingredient) VALUES
      (r_id, 'Beef', '500', 'g', true),
      (r_id, 'Potatoes', '2', 'pcs', true),
      (r_id, 'Carrots', '2', 'pcs', true),
      (r_id, 'Onion', '1', 'pc', false),
      (r_id, 'Tomato Paste', '2', 'tbsp', false);
  END IF;
END $$;

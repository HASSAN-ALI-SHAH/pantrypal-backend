-- Migration 005: Enrich recipe catalog with detailed instructions and more recipes
-- This clears old seed data and re-inserts with full step-by-step instructions

-- Clear old seed data
DELETE FROM recipe_catalog_ingredients;
DELETE FROM recipe_catalog;

-- Reset sequence
ALTER SEQUENCE recipe_catalog_id_seq RESTART WITH 1;
ALTER SEQUENCE recipe_catalog_ingredients_id_seq RESTART WITH 1;

-- Insert enriched recipes
INSERT INTO recipe_catalog (title, emoji, description, instructions, difficulty, prep_time, cook_time, servings, tags) VALUES
('Milk Chai', '☕', 'Classic South Asian doodh patti chai — rich, aromatic, and perfectly spiced with cardamom and cinnamon.',
'1. Pour 2 cups of whole milk into a saucepan and bring to a gentle simmer over medium heat.
2. Add 2 teaspoons of loose black tea leaves (or 2 tea bags) and stir.
3. Crush 2 green cardamom pods and a small piece of cinnamon stick, add to the pot.
4. Add 2 tablespoons of sugar (adjust to taste) and stir well.
5. Let the mixture simmer on low heat for 5-7 minutes, stirring occasionally to prevent boiling over.
6. The chai should turn a deep caramel color — this means the tea has fully infused.
7. Strain through a fine sieve into cups, pouring from a height to create a frothy top.
8. Serve immediately while piping hot. Pair with biscuits or rusks.',
'Easy', 3, 8, 2, ARRAY['Dairy','Beverages']),

('Chicken Karahi', '🍗', 'Authentic Pakistani chicken karahi cooked in a wok with fresh tomatoes, green chilies, and aromatic spices.',
'1. Cut 500g bone-in chicken into medium pieces, wash and pat dry.
2. Heat 3 tablespoons of cooking oil in a karahi (wok) over high heat.
3. Add 1 tablespoon of ginger-garlic paste and sauté for 30 seconds until fragrant.
4. Add the chicken pieces and sear on high heat for 3-4 minutes until lightly browned.
5. Add 3 large tomatoes (chopped) and cook on medium-high heat for 10 minutes until tomatoes break down.
6. Add salt (1 tsp), red chili powder (1 tsp), turmeric (½ tsp), and coriander powder (1 tsp).
7. Cook uncovered on medium heat for 15-20 minutes until oil separates from the masala.
8. Slit 4-5 green chilies and add them along with 1 tablespoon of freshly crushed ginger.
9. Toss for 2 minutes on high heat.
10. Garnish with fresh coriander leaves and serve with hot naan bread.',
'Medium', 15, 30, 4, ARRAY['Meat','Spices']),

('Vegetable Stir Fry', '🥦', 'A vibrant, quick stir fry loaded with fresh vegetables — crisp, colorful, and packed with nutrition.',
'1. Wash and prep all vegetables: cut 200g broccoli into small florets, slice 1 bell pepper, halve 150g cherry tomatoes, and roughly chop 100g baby spinach.
2. Mince 3 cloves of garlic and slice 1 inch of fresh ginger.
3. Heat 2 tablespoons of vegetable oil in a large wok or skillet over high heat until smoking.
4. Add garlic and ginger, stir-fry for 15 seconds.
5. Add broccoli florets first (they take longest), stir-fry for 2 minutes.
6. Add bell pepper and cherry tomatoes, toss for another 2 minutes.
7. Add baby spinach and toss until just wilted (about 30 seconds).
8. Drizzle 1 tablespoon soy sauce, ½ tablespoon sesame oil, and a pinch of black pepper.
9. Toss everything together for 30 seconds more.
10. Serve immediately over steamed rice or noodles. Garnish with sesame seeds.',
'Easy', 10, 10, 2, ARRAY['Vegetables']),

('Fruit Smoothie', '🍓', 'A thick, creamy smoothie blending fresh bananas, strawberries, and yogurt — perfect as a quick breakfast or snack.',
'1. Peel 2 ripe bananas and break them into chunks.
2. Wash and hull 200g fresh strawberries (or use frozen for a thicker texture).
3. Add the bananas and strawberries to a blender.
4. Add 1 cup (240ml) of Greek yogurt and 100ml of cold whole milk.
5. Add 1 tablespoon of honey for natural sweetness (optional).
6. Blend on high speed for 45-60 seconds until completely smooth and creamy.
7. Taste and adjust sweetness — add more honey or a ripe date if needed.
8. Pour into tall glasses and serve immediately.
9. Optional toppings: chia seeds, granola, sliced almonds, or a drizzle of honey.',
'Easy', 5, 0, 2, ARRAY['Fruits','Dairy']),

('Egg Omelette', '🥚', 'A fluffy, golden omelette with melted cheese — the perfect quick protein-packed breakfast in under 10 minutes.',
'1. Crack 3 large eggs into a bowl.
2. Add 2 tablespoons of milk, a pinch of salt, and a pinch of black pepper.
3. Whisk vigorously with a fork for 30 seconds until the mixture is uniform and slightly frothy.
4. Heat a non-stick pan over medium heat and add 1 tablespoon of butter.
5. Once the butter melts and foams, pour in the egg mixture.
6. Let it cook undisturbed for 30 seconds until the edges begin to set.
7. Using a spatula, gently push the cooked edges toward the center and tilt the pan to let uncooked egg flow to the edges.
8. When the top is still slightly moist, sprinkle 50g of grated cheddar cheese on one half.
9. Fold the omelette in half and cook for another 30 seconds.
10. Slide onto a plate and serve with toast and a side of fresh salad.',
'Easy', 3, 5, 1, ARRAY['Dairy']),

('Pasta Alfredo', '🍝', 'Luxuriously creamy pasta tossed in a rich garlic butter parmesan sauce — restaurant quality at home.',
'1. Bring a large pot of salted water to a rolling boil.
2. Cook 300g of fettuccine or penne pasta according to package directions until al dente. Reserve 1 cup of pasta water before draining.
3. While pasta cooks, melt 50g of butter in a large skillet over medium heat.
4. Add 3 cloves of minced garlic and sauté for 1 minute until fragrant (do not brown).
5. Pour in 200ml of heavy cream and bring to a gentle simmer.
6. Add 100g of freshly grated Parmesan cheese and stir continuously until the sauce is smooth and thick.
7. Season with salt, black pepper, and a pinch of nutmeg.
8. Add the drained pasta directly to the sauce and toss to coat evenly.
9. If the sauce is too thick, add reserved pasta water 1 tablespoon at a time.
10. Serve immediately on warm plates, garnished with extra Parmesan and chopped parsley.',
'Medium', 10, 15, 3, ARRAY['Grains','Dairy']),

('Chicken Sandwich', '🥪', 'A hearty grilled chicken breast sandwich with crisp lettuce, juicy tomatoes, and tangy mayo on toasted bread.',
'1. Place 200g chicken breast between plastic wrap and pound to even ½-inch thickness.
2. Season both sides with salt, pepper, garlic powder, and a drizzle of olive oil.
3. Heat a grill pan or skillet over medium-high heat.
4. Grill the chicken for 4-5 minutes per side until cooked through (internal temp 165°F/74°C).
5. Let the chicken rest for 2 minutes, then slice diagonally.
6. Toast 4 slices of whole wheat bread until golden and crisp.
7. Spread mayonnaise on one side of each slice.
8. Layer lettuce leaves, sliced tomato, and the grilled chicken on two slices.
9. Add a few slices of cheese if desired and top with the remaining bread.
10. Cut diagonally and serve with a side of chips or salad.',
'Easy', 10, 10, 2, ARRAY['Meat','Grains']),

('Rice Pilaf', '🍚', 'Fragrant basmati rice pilaf with caramelized onions and whole spices — the perfect side dish for any curry.',
'1. Rinse 2 cups of basmati rice in cold water 3-4 times until the water runs clear. Soak for 20 minutes, then drain.
2. Heat 2 tablespoons of butter and 1 tablespoon of oil in a heavy-bottomed pot.
3. Add 1 bay leaf, 3 green cardamom pods, 4 cloves, and 1 cinnamon stick. Let them sizzle for 30 seconds.
4. Add 1 large thinly sliced onion and cook until golden brown (8-10 minutes).
5. Add the drained rice and gently stir for 2 minutes, coating each grain with the buttery spices.
6. Pour in 3½ cups of hot chicken or vegetable stock and add 1 teaspoon of salt.
7. Bring to a boil, then reduce heat to the lowest setting and cover tightly.
8. Cook for 18-20 minutes without lifting the lid.
9. Remove from heat and let it steam covered for 5 minutes.
10. Fluff gently with a fork, remove whole spices, and serve garnished with toasted cashews and fresh mint.',
'Medium', 10, 25, 4, ARRAY['Grains','Spices']),

('Greek Salad', '🥗', 'A refreshing Mediterranean salad with juicy tomatoes, crunchy cucumber, briny olives, and creamy feta cheese.',
'1. Wash and cut 200g cherry tomatoes in half.
2. Peel and dice 1 large cucumber into bite-sized chunks.
3. Thinly slice ½ red onion into rings and soak in cold water for 5 minutes (this removes the harsh bite).
4. Pit and halve 80g of Kalamata olives.
5. Cut 100g of feta cheese into cubes (do not crumble — cubes look and taste better).
6. Combine all vegetables in a large bowl.
7. Drizzle with 3 tablespoons of extra-virgin olive oil and 1 tablespoon of fresh lemon juice.
8. Sprinkle with 1 teaspoon of dried oregano, salt, and freshly cracked black pepper.
9. Toss gently, being careful not to break the feta cubes.
10. Let it rest for 5 minutes before serving to allow flavors to meld. Serve with crusty bread.',
'Easy', 10, 0, 2, ARRAY['Vegetables','Dairy']),

('Banana Pancakes', '🥞', 'Fluffy, naturally sweet banana oat pancakes — a healthy breakfast treat the whole family will love.',
'1. Mash 2 ripe bananas in a large bowl with a fork until smooth (a few small lumps are fine).
2. Add 1 cup of rolled oats, 2 eggs, and 100ml of whole milk. Mix until combined.
3. Add ½ teaspoon of baking powder, ½ teaspoon of cinnamon, and a pinch of salt. Stir well.
4. Let the batter rest for 5 minutes — this allows the oats to absorb moisture and thicken.
5. Heat a non-stick skillet or griddle over medium heat and lightly grease with butter.
6. Pour about ¼ cup of batter per pancake onto the skillet.
7. Cook until bubbles form on the surface and edges look set (about 2-3 minutes).
8. Flip carefully and cook for another 1-2 minutes until golden.
9. Repeat with remaining batter, keeping finished pancakes warm in a 200°F oven.
10. Stack and serve drizzled with maple syrup, sliced bananas, and a handful of blueberries.',
'Easy', 5, 10, 2, ARRAY['Fruits','Grains']),

('Butter Chicken', '🍗', 'Rich, creamy butter chicken (Murgh Makhani) — a beloved classic with tender marinated chicken in a velvety tomato-cream sauce.',
'1. Cut 500g boneless chicken into bite-sized pieces.
2. Marinate in 1 cup yogurt, 1 tsp turmeric, 1 tsp chili powder, 1 tsp garam masala, and salt. Refrigerate for 30 minutes (or overnight).
3. Heat 2 tablespoons of butter in a heavy pan and sear the marinated chicken in batches until lightly charred. Set aside.
4. In the same pan, add 2 tablespoons of butter. Sauté 1 chopped onion until soft.
5. Add 1 tablespoon of ginger-garlic paste and cook for 1 minute.
6. Add 300g puréed tomatoes (or canned crushed tomatoes) and cook for 10 minutes until thickened.
7. Stir in 200ml of heavy cream, 1 teaspoon of sugar, 1 teaspoon of garam masala, and ½ teaspoon of kasuri methi (dried fenugreek leaves).
8. Return the seared chicken to the sauce and simmer gently for 15 minutes.
9. Finish with 1 tablespoon of cold butter for extra richness.
10. Garnish with a swirl of cream and fresh cilantro. Serve with naan or basmati rice.',
'Hard', 20, 35, 4, ARRAY['Meat','Dairy','Spices']);

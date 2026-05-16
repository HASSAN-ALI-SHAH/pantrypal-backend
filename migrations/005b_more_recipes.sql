-- 005b: Additional recipes (appended after 005_rich_recipes.sql)

INSERT INTO recipe_catalog (title, emoji, description, instructions, difficulty, prep_time, cook_time, servings, tags) VALUES
('Spinach Soup', '🍲', 'Velvety spinach and potato soup — comforting, nutritious, and beautifully green.',
'1. Wash 300g fresh spinach thoroughly.
2. Peel and dice 2 medium potatoes.
3. Sauté 1 diced onion and 2 minced garlic cloves in 1 tbsp butter until soft.
4. Add potatoes, 3 cups vegetable stock, salt and pepper. Boil until potatoes are tender (12 min).
5. Add spinach and cook for 2 minutes until wilted.
6. Blend the mixture until smooth using an immersion blender.
7. Stir in 100ml cream. Reheat gently.
8. Serve in warm bowls with a drizzle of cream and croutons.',
'Easy', 10, 20, 4, ARRAY['Vegetables','Dairy']),

('Cheese Toast', '🧀', 'Golden, bubbly cheese on crispy toast — the ultimate quick comfort snack.',
'1. Preheat your oven broiler to high.
2. Slice 2 pieces of thick bread (sourdough or whole wheat).
3. Spread each slice with a thin layer of butter.
4. Grate 60g cheddar cheese and pile generously on top.
5. Add a pinch of paprika and dried herbs for extra flavor.
6. Place under the broiler for 3-4 minutes until cheese is melted, bubbly, and golden.
7. Remove carefully and serve immediately.',
'Easy', 2, 5, 1, ARRAY['Dairy','Grains']),

('Chicken Rice Bowl', '🍛', 'A satisfying one-bowl meal with spiced chicken, fluffy rice, and fresh vegetables.',
'1. Cook 1 cup basmati rice according to package instructions.
2. Cut 300g chicken breast into strips. Season with cumin, paprika, salt, and pepper.
3. Heat oil in a skillet and cook chicken for 6-7 minutes until golden and cooked through.
4. Steam 100g broccoli florets until tender-crisp (3 min).
5. Assemble bowls: rice on the bottom, chicken on one side, broccoli on the other.
6. Drizzle with soy sauce or your favorite dressing.
7. Top with sesame seeds and sliced green onions.',
'Medium', 10, 25, 2, ARRAY['Meat','Grains']),

('Mango Lassi', '🥭', 'A traditional creamy mango yogurt drink — sweet, refreshing, and perfect for hot days.',
'1. Peel and chop 1 large ripe mango (or use 1 cup canned mango pulp).
2. Add mango to a blender with 1 cup Greek yogurt and 100ml cold milk.
3. Add 2 tablespoons sugar and 2 crushed cardamom pods.
4. Blend on high for 45 seconds until perfectly smooth.
5. Taste and adjust sweetness.
6. Pour over ice in tall glasses.
7. Garnish with a pinch of saffron threads or chopped pistachios.',
'Easy', 5, 0, 2, ARRAY['Fruits','Dairy']),

('Avocado Toast', '🥑', 'Trendy smashed avocado on sourdough — simple, nutritious, and endlessly customizable.',
'1. Toast 2 slices of sourdough or whole wheat bread until golden and crisp.
2. Cut 1 ripe avocado in half, remove the pit, and scoop the flesh into a bowl.
3. Mash with a fork, leaving some chunks for texture.
4. Mix in 1 tablespoon fresh lemon juice, salt, and black pepper.
5. Spread the mashed avocado thickly on the toast.
6. Top with red chili flakes, everything bagel seasoning, or microgreens.
7. For extra protein, add a poached or fried egg on top.',
'Easy', 5, 3, 1, ARRAY['Fruits','Grains']),

('Tomato Soup', '🍅', 'Classic roasted tomato soup — rich, tangy, and perfect with a grilled cheese sandwich.',
'1. Preheat oven to 400°F (200°C).
2. Halve 500g tomatoes and place cut-side up on a baking sheet with 4 garlic cloves.
3. Drizzle with olive oil, salt, and pepper. Roast for 25 minutes until caramelized.
4. Transfer roasted tomatoes and garlic to a pot. Add 2 cups vegetable broth.
5. Simmer for 10 minutes. Add a handful of fresh basil leaves.
6. Blend until smooth using an immersion blender.
7. Stir in 100ml cream. Season to taste.
8. Serve hot, garnished with basil and a drizzle of olive oil.',
'Easy', 10, 25, 4, ARRAY['Vegetables']),

('Fresh Juice', '🧃', 'Vibrant fresh-pressed orange and apple juice — pure, natural, and energizing.',
'1. Wash 4 large oranges and 2 red apples thoroughly.
2. Cut oranges in half and juice using a citrus juicer.
3. Core the apples (no need to peel) and run through a juicer or blender.
4. If using a blender, strain through a fine mesh sieve.
5. Combine both juices and stir well.
6. Add ice cubes to glasses and pour the fresh juice over them.
7. Serve immediately for maximum nutrition. Add a sprig of mint for garnish.',
'Easy', 5, 0, 2, ARRAY['Fruits','Beverages']),

('Oatmeal Bowl', '🥣', 'Warm, creamy oatmeal topped with fresh fruits, nuts, and a drizzle of honey — the perfect start to any morning.',
'1. Bring 200ml whole milk and 200ml water to a simmer in a saucepan.
2. Add 1 cup rolled oats and a pinch of salt. Stir to combine.
3. Cook on medium-low heat for 4-5 minutes, stirring occasionally, until thick and creamy.
4. Remove from heat and stir in 1 teaspoon of vanilla extract.
5. Pour into a bowl. Slice 1 banana and arrange on top.
6. Add a handful of fresh strawberries or blueberries.
7. Drizzle with honey and sprinkle with cinnamon, chia seeds, and chopped almonds.',
'Easy', 3, 5, 1, ARRAY['Grains','Fruits','Dairy']),

('Salmon Teriyaki', '🐟', 'Pan-seared salmon glazed with a sweet and savory homemade teriyaki sauce — elegant enough for date night.',
'1. Pat dry 2 salmon fillets (150g each) with paper towels. Season with salt and pepper.
2. Make teriyaki sauce: mix 3 tbsp soy sauce, 2 tbsp honey, 1 tbsp rice vinegar, 1 tsp minced ginger, and 1 tsp minced garlic.
3. Heat 1 tablespoon oil in a non-stick skillet over medium-high heat.
4. Place salmon skin-side down and cook for 4 minutes without moving.
5. Flip carefully and cook for 3 more minutes.
6. Pour the teriyaki sauce around the salmon. Let it simmer and thicken for 1-2 minutes.
7. Spoon the glaze over the fish repeatedly.
8. Serve on a bed of steamed rice with steamed vegetables.',
'Medium', 5, 12, 2, ARRAY['Meat']),

('Dal Tadka', '🍲', 'Hearty Indian lentil dal with a sizzling spiced tempering — protein-packed and deeply flavorful.',
'1. Wash 1 cup yellow lentils (moong dal) until water runs clear.
2. Boil lentils with 3 cups water, ½ tsp turmeric, and salt until soft and mushy (20 min).
3. Mash the lentils with a whisk for a creamy texture.
4. For the tadka: heat 2 tbsp ghee in a small pan.
5. Add 1 tsp cumin seeds, 2 dried red chilies, and let them splutter.
6. Add 1 diced onion, 2 minced garlic cloves, and sauté until golden.
7. Add 2 chopped tomatoes and cook until soft (5 min).
8. Pour the sizzling tadka over the cooked dal and stir.
9. Garnish with fresh cilantro and serve with steamed rice or roti.',
'Medium', 10, 25, 4, ARRAY['Grains','Spices']),

('Fish Tacos', '🌮', 'Crispy seasoned fish in warm tortillas with tangy slaw and creamy sauce — a fiesta on your plate.',
'1. Cut 300g white fish (tilapia or cod) into strips.
2. Season with cumin, chili powder, garlic powder, salt, and lime juice.
3. Coat lightly in flour and pan-fry in oil for 3 minutes per side until golden and crispy.
4. Make slaw: toss shredded cabbage with lime juice, cilantro, and a pinch of salt.
5. Make sauce: mix ½ cup sour cream with 1 tbsp lime juice and a pinch of chili powder.
6. Warm small tortillas in a dry skillet for 30 seconds each side.
7. Assemble: tortilla, slaw, fish, drizzle of sauce, and a squeeze of fresh lime.',
'Medium', 15, 10, 3, ARRAY['Meat','Vegetables']),

('Mushroom Risotto', '🍄', 'Creamy Italian risotto with earthy mushrooms and Parmesan — a luxurious comfort dish.',
'1. Heat 4 cups chicken stock and keep warm on a low simmer.
2. Sauté 250g sliced mushrooms in 1 tbsp butter until golden. Set aside.
3. In the same pan, sauté 1 diced onion in 1 tbsp butter until soft.
4. Add 1½ cups arborio rice and stir for 2 minutes until toasted.
5. Add ½ cup white wine and stir until absorbed.
6. Add warm stock one ladle at a time, stirring continuously, waiting for each addition to absorb before adding more.
7. After about 18 minutes, rice should be creamy and al dente.
8. Fold in the mushrooms, 50g grated Parmesan, and 1 tbsp butter.
9. Season with salt, pepper, and serve immediately topped with extra Parmesan.',
'Hard', 10, 30, 3, ARRAY['Vegetables','Grains','Dairy']),

('Yogurt Parfait', '🥛', 'Layered Greek yogurt with granola, fresh berries, and honey — a beautiful and healthy breakfast or dessert.',
'1. Spoon ½ cup Greek yogurt into the bottom of a glass or jar.
2. Add a layer of granola (about 3 tablespoons).
3. Add a layer of mixed fresh berries (strawberries, blueberries, raspberries).
4. Repeat the layers: yogurt, granola, berries.
5. Drizzle the top with 1 tablespoon of honey.
6. Sprinkle with chia seeds or sliced almonds.
7. Serve immediately (or refrigerate overnight for overnight parfait).',
'Easy', 5, 0, 1, ARRAY['Dairy','Fruits']),

('Garlic Bread', '🧄', 'Crispy, buttery garlic bread with herbs — the perfect side for pasta, soups, or just snacking.',
'1. Preheat oven to 375°F (190°C).
2. Mix 4 tbsp softened butter with 3 minced garlic cloves, 1 tbsp chopped parsley, and a pinch of salt.
3. Slice a French baguette in half lengthwise.
4. Spread the garlic butter generously on each half.
5. Sprinkle with grated Parmesan cheese (optional).
6. Wrap loosely in foil and bake for 10 minutes.
7. Open the foil and broil for 2-3 minutes until golden and crispy.
8. Slice into pieces and serve warm.',
'Easy', 5, 13, 4, ARRAY['Grains','Dairy']),

('Chicken Soup', '🍜', 'Hearty homemade chicken soup with tender vegetables — the ultimate comfort food and cold remedy.',
'1. In a large pot, heat 1 tbsp oil. Add 1 diced onion, 2 diced carrots, and 2 diced celery stalks. Cook for 5 minutes.
2. Add 2 minced garlic cloves and cook for 30 seconds.
3. Add 300g diced chicken breast and sear for 3 minutes.
4. Pour in 6 cups chicken stock. Add 1 bay leaf, ½ tsp thyme, salt, and pepper.
5. Bring to a boil, then reduce to a simmer. Cook for 15 minutes.
6. Add 1 cup egg noodles and cook for 8 minutes until tender.
7. Remove bay leaf. Stir in a squeeze of lemon juice and fresh parsley.
8. Serve steaming hot with crusty bread.',
'Easy', 10, 25, 4, ARRAY['Meat','Vegetables']),

('Paneer Tikka', '🧀', 'Smoky, charred Indian paneer tikka marinated in spiced yogurt — a vegetarian showstopper.',
'1. Cut 250g paneer into 1-inch cubes.
2. Cut 1 bell pepper, 1 onion into chunks for skewering.
3. Make marinade: mix 1 cup yogurt, 1 tsp cumin, 1 tsp garam masala, 1 tsp chili powder, turmeric, salt, 1 tbsp oil, and lemon juice.
4. Coat paneer and vegetables in the marinade. Refrigerate for 30 minutes.
5. Thread onto skewers alternating paneer and vegetables.
6. Grill on high heat or bake at 450°F for 12-15 minutes, turning once.
7. Baste with butter while cooking for extra flavor.
8. Serve on a sizzling plate with mint chutney and onion rings.',
'Medium', 15, 15, 3, ARRAY['Dairy','Vegetables','Spices']),

('Fried Rice', '🍳', 'Quick and flavorful egg fried rice with vegetables — better than takeout, ready in 15 minutes.',
'1. Use 3 cups of day-old cooked rice (cold rice works best — it does not clump).
2. Scramble 2 eggs in 1 tbsp oil, break into small pieces, and set aside.
3. Heat 2 tbsp oil in a wok over high heat. Add diced carrots, peas, and corn. Stir-fry 2 minutes.
4. Add 2 minced garlic cloves and stir for 15 seconds.
5. Add the cold rice and toss vigorously, breaking up any clumps.
6. Push rice to one side, add 2 tbsp soy sauce and 1 tsp sesame oil to the empty side, then toss everything.
7. Add back the scrambled eggs and toss to combine.
8. Garnish with sliced green onions and serve immediately.',
'Easy', 5, 10, 3, ARRAY['Grains','Vegetables']),

('Chocolate Milkshake', '🍫', 'Thick, indulgent chocolate milkshake made with real chocolate and ice cream — a treat for any time.',
'1. Add 2 scoops of vanilla or chocolate ice cream to a blender.
2. Pour in 200ml cold whole milk.
3. Add 2 tablespoons of cocoa powder and 1 tablespoon of chocolate syrup.
4. Blend on medium speed for 30 seconds until thick and smooth.
5. Pour into a tall chilled glass.
6. Top with whipped cream and chocolate shavings.
7. Serve immediately with a straw.',
'Easy', 5, 0, 1, ARRAY['Dairy','Beverages']),

('Beef Stew', '🥩', 'Slow-cooked beef stew with root vegetables — rich, hearty, and perfect for cold evenings.',
'1. Cut 500g beef chuck into 2-inch cubes. Season with salt, pepper, and toss in 2 tbsp flour.
2. Heat 2 tbsp oil in a Dutch oven over high heat. Sear beef in batches until browned on all sides. Set aside.
3. Sauté 1 diced onion, 2 diced carrots, and 2 diced potatoes for 3 minutes.
4. Add 2 minced garlic cloves, 2 tbsp tomato paste, and stir for 1 minute.
5. Pour in 2 cups beef stock and 1 cup red wine (or extra stock). Add 1 bay leaf and thyme.
6. Return beef to the pot. Bring to a boil, then cover and reduce to a low simmer.
7. Cook for 1.5-2 hours until beef is fork-tender.
8. Season to taste and serve with crusty bread or mashed potatoes.',
'Hard', 20, 120, 4, ARRAY['Meat','Vegetables']);

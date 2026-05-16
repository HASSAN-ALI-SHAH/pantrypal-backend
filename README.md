# PantryPal Backend Infrastructure

This directory contains the robust Node.js + Express backend for the PantryPal application, providing full RESTful API coverage for managing pantry items, grocery lists, smart recipes, dynamic alerts, and user settings. It is backed by a PostgreSQL database and secured with JWT authentication.

## 🗂️ Project Structure & File Details

```
backend/
├── db.js                        # PostgreSQL connection pool configuration
├── server.js                    # Main Express application entry point (CORS, Middlewares, Route mounting)
├── .env                         # Environment variables (DB credentials, JWT secrets, Ports)
├── package.json                 # Project metadata and npm scripts (start, dev, db:migrate)
├── migrations/                  # Sequential SQL migration files
│   ├── 000_init_schema.sql      # Core table definitions (users, pantry_items)
│   ├── 001_full_schema.sql      # Grocery, settings, and recipe tables
│   ├── 002_user_auth.sql        # Authentication schema updates (OTP, password hashing)
│   ├── 003_consumption_logs.sql # Consumption tracking architecture
│   ├── 004_add_indexes.sql      # Performance optimizations (user_id and expiry_date indexes)
│   └── 005*_recipes.sql         # Rich recipe seeding (30 recipes with detailed steps & ingredients)
└── src/
    ├── middleware/
    │   └── authMiddleware.js    # JWT verification logic for protecting private routes
    ├── utils/
    │   └── mailer.js            # Nodemailer transport for sending OTP verification emails
    ├── routes/                  # Express Router definitions linking HTTP paths to controllers
    │   ├── alertRoutes.js       # /api/alerts
    │   ├── authRoutes.js        # /api/auth
    │   ├── groceryRoutes.js     # /api/grocery
    │   ├── pantryRoutes.js      # /api/pantry
    │   ├── recipeRoutes.js      # /api/recipes
    │   └── settingsRoutes.js    # /api/settings
    └── controllers/             # Business logic handlers for each domain
        ├── alertController.js   # Expiry detection and alert calculation
        ├── authController.js    # Registration, login, and OTP email verification
        ├── groceryController.js # Grocery list management and pantry-syncing
        ├── pantryController.js  # Pantry CRUD, consumption tracking, and status updates
        ├── recipeController.js  # Smart recipe matching based on near-expiry ingredients
        └── settingsController.js# User profile and preference management
```

## 🔒 Authentication System (Auth)

PantryPal uses **JWT (JSON Web Tokens)** combined with **OTP Email Verification** for secure access:
1. **Registration:** User creates an account. Backend generates a 6-digit OTP, stores it temporarily, and emails it via Nodemailer (`utils/mailer.js`).
2. **Verification:** User submits the OTP. If valid, the user is permanently saved to the `users` table with a hashed (`bcryptjs`) password.
3. **Login:** User authenticates with email/password. Backend issues a signed JWT (`jsonwebtoken`).
4. **Protection:** The `authMiddleware.js` intercepts private API requests, validates the JWT, and securely attaches the `user_id` to the request object, ensuring strict data isolation between different users.

## 🗄️ Database Architecture (PostgreSQL)

The system relies on a relational schema managed through sequential migrations.
**Key Tables:**
- `users`: Core identity (id, name, email, password_hash)
- `pantry_items`: Core inventory (user_id, item_name, category, quantity, expiry_date, status)
- `grocery_list`: Shopping items, some linked dynamically from depleted pantry items
- `consumption_logs`: Detailed tracking of partial quantities consumed over time
- `recipe_catalog` & `recipe_catalog_ingredients`: Global dictionary of 30 rich recipes used for smart suggestions
- `user_settings`: User-specific preferences (dark mode, notification toggles)

## 🌐 RESTful API Endpoints

All endpoints (except auth registration/login) require a valid JWT in the `Authorization: Bearer <token>` header.

### Authentication (`/api/auth`)
- `POST /register` - Initiate registration & send OTP
- `POST /verify-otp` - Validate OTP & create user record
- `POST /login` - Authenticate user & receive JWT
- `GET /me` - Get current user profile

### Pantry Management (`/api/pantry`)
- `GET /` - Fetch all active and consumed items for the user
- `POST /` - Add a new item to the pantry
- `PUT /:id` - Update item details (name, expiry, quantity)
- `DELETE /:id` - Permanently remove an item
- `POST /:id/consume` - Log partial or full consumption (updates `consumption_logs`)
- `POST /:id/status` - Mark item as 'consumed' or 'wasted'

### Grocery List (`/api/grocery`)
- `GET /` - Fetch user's shopping list
- `POST /` - Add new item to grocery list
- `PUT /:id` - Update grocery item (e.g., mark as checked)
- `DELETE /:id` - Remove from grocery list
- `POST /:id/move-to-pantry` - Transfer a purchased grocery item directly into the active pantry

### Smart Recipes (`/api/recipes`)
- `GET /` - Fetch smart recipe suggestions. The backend cross-references the user's near-expiry pantry items with the `recipe_catalog_ingredients` to suggest recipes that help reduce food waste.

### Alerts (`/api/alerts`)
- `GET /` - Generate dynamic warnings for items expiring today or within the next 3-7 days.

### User Settings (`/api/settings`)
- `GET /` - Fetch user preferences
- `PUT /` - Update user settings (notifications, theme)
- `PUT /profile` - Update user name/email profile data

## 🚀 Running the Backend

1. Install dependencies: `npm install`
2. Ensure PostgreSQL is running and credentials match the `.env` file.
3. Run database migrations: `npm run db:migrate`
4. Start development server: `npm run dev` (Runs on port 5000)

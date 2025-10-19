# Padi POS API

A complete backend API for the Padi Point of Sale system, built with Node.js, Express, and TypeScript. It handles authentication, product management, order processing, and sales reporting.

## Features

- **Authentication**: JWT-based (Access & Refresh Tokens) authentication with `httpOnly` cookies.
- **Product Management**: Full CRUD operations for products and categories.
- **Order Processing**: Create new orders and view order history.
- **Image Uploads**: Handles image uploads for products and user profiles using Multer and Cloudinary.
- **Reporting**: Generates sales reports, with PDF and Excel export capabilities.
- **User Settings**: Allows users to manage their profile and application preferences.
- **Validation**: Uses Zod for robust request data validation.

## Base URL

All endpoints listed below are relative to the production server URL:

```
https://pos-api.ffathur.my.id/api/v1
```

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v22 or later recommended)
- [PostgreSQL](https://www.postgresql.org/) database
- [Upstash Redis](https://upstash.com/) (optional, for caching/session management)
- [Cloudinary](https://cloudinary.com/) account (for image storage)

### Installation

1.  Clone the repository:

    ```sh
    git clone https://github.com/fathurrahman20/pos-api.git
    cd pos-api
    ```

2.  Install the dependencies:

    ```sh
    npm install
    ```

3.  Set up your environment variables by creating a `.env` file in the root directory. See `.env.example` (if available) or add the following:

    ```env
    # Server Configuration
    PORT=3000

    # Database (PostgreSQL / Neon)
    DATABASE_URL=

    # Application & Business Logic
    FRONTEND_URL=http://localhost:5173 # Base URL of the frontend (for CORS & email links)
    TAX_RATE=0.11 # Default tax rate for orders (e.g., 11%)

    # Authentication (JWT)
    ACCESS_TOKEN_SECRET=your_super_secret_access_key
    REFRESH_TOKEN_SECRET=your_super_secret_refresh_key

    # Cloudinary (Image Storage)
    CLOUDINARY_NAME=your_cloud_name
    CLOUDINARY_API_KEY=your_api_key
    CLOUDINARY_API_SECRET=your_api_secret

    # Nodemailer (for password reset)
    EMAIL_PORT=587
    EMAIL_USER=your-email@example.com
    EMAIL_PASS=your-email-password

    # Upstash Redis (Caching)
    UPSTASH_REDIS_REST_URL=your_upstash_url
    UPSTASH_REDIS_REST_TOKEN=your_upstash_token
    ```

4.  Run database migrations:

    ```sh
    npx sequelize-cli db:migrate
    ```

### Running the Application

- **Development Mode (with auto-reload):**

  ```sh
  npm run dev
  ```

- **Production Mode:**

  1.  Build the TypeScript project:
      ```sh
      npm run build
      ```
  2.  Start the compiled application:
      ```sh
      npm run start
      ```

## Tech Stack

### Core Stack

- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Runtime**: [Node.js](https://nodejs.org/en)
- **Framework**: [Express.js](https://expressjs.com/) (v5)

### Database & ORM

- **Database**: [PostgreSQL](https://www.postgresql.org/) (hosted on [Neon](https://neon.tech/))
- **ORM**: [Sequelize](https://sequelize.org/) (`sequelize`, `sequelize-typescript`)
- **Migrations**: `sequelize-cli`

### Authentication & Security

- **Tokens**: [JSON Web Token (JWT)](https://jwt.io/) (`jsonwebtoken`)
- **Password Hashing**: [Bcrypt](https://www.npmjs.com/package/bcrypt)
- **Cookie Handling**: `cookie-parser`
- **Security Headers**: [Helmet](https://helmetjs.github.io/)
- **CORS**: `cors`
- **Crypto**: Node.js `crypto` module (for reset tokens)

### Data Validation

- **Schema & Validation**: [Zod](https://zod.dev/)

### File & Image Handling

- **File Uploads**: [Multer](https://github.com/expressjs/multer)
- **Cloud Storage**: [Cloudinary](https://cloudinary.com/)

### Additional Features

- **Emailing**: [Nodemailer](https://nodemailer.com/) (for password resets)
- **In-Memory Store**: [Upstash Redis](https://upstash.com/) (for product and category caching)
- **Report Generation**: [PDFKit](http://pdfkit.org/) (for PDF) & [ExcelJS](https://github.com/exceljs/exceljs) (for `.xlsx`)
- **Date Handling**: `date-fns`

### Documentation & Utilities

- **API Viewer**: [@scalar/express-api-reference](https://github.com/scalar/scalar) (to serve OpenAPI docs)
- **Config**: `dotenv`, `yamljs`

## Authentication

This API uses cookie-based authentication.

1.  To log in, send a `POST` request to `/auth/login` with your `username` and `password`.
2.  On a successful login, the server will set two `httpOnly` cookies: `accessToken` and a `refreshToken`.
3.  The `accessToken` must be included in all subsequent requests to protected endpoints. Browsers will handle this automatically.
4.  The refresh token is used to obtain a new `accessToken` via the `/auth/refresh` endpoint.

## API Endpoints

### 🔐 Auth

- `POST /auth/register`: Register a new cashier.
- `POST /auth/login`: Login for admin and cashier (sets `accessToken` and refresh token cookies).
- `GET /auth/me`: Get the currently logged-in user's information.
- `GET /auth/refresh`: Refresh the `accessToken` using the refresh token.
- `DELETE /auth/logout`: Log out the user (clears authentication cookies).
- `POST /auth/forgot-password`: Request a password reset email.
- `POST /auth/reset-password/{token}`: Reset password using the token from the email.

---

### 📦 Categories

- `GET /categories`: Get a list of all product categories.
- `POST /categories`: Create a new category.
- `GET /categories/{id}`: Get details for a specific category by ID.
- `PATCH /categories/{id}`: Update a category by ID.
- `DELETE /categories/{id}`: Delete a category by ID.

---

### 🍽️ Products

- `GET /products`: Get all products. Supports query parameters for pagination (`page`, `limit`), category filtering (`categoryId`), and search (`q`).
- `POST /products`: Create a new product. Uses `multipart/form-data` for image uploads.
- `GET /products/{id}`: Get details for a specific product by ID.
- `PATCH /products/{id}`: Update a product by ID. Uses `multipart/form-data` if updating the image.
- `DELETE /products/{id}`: Delete a product by ID.

---

### 🧾 Orders

- `GET /orders`: Get all order history. Supports pagination (`page`, `limit`).
- `POST /orders`: Create a new order.
- `GET /orders/{id}`: Get details for a specific order by ID.

---

### 📊 Reports

- `GET /sales-report`: Get a sales report for the logged-in cashier. Supports filtering by date range (`startDate`, `endDate`), order type (`orderType`), category (`categoryId`), and pagination (`page`, `limit`).

---

### ⚙️ User Settings

- `GET /settings`: Get the profile and settings for the currently logged-in user.
- `PATCH /settings`: Update the user's profile and settings. Uses `multipart/form-data`.

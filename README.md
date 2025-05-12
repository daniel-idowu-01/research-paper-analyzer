# Research Paper Analyzer - README

## Table of Contents

1.  [Description](#description)
2.  [Features](#features)
3.  [Tech Stack](#tech-stack)
4.  [Installation](#installation)
    *   [Prerequisites](#prerequisites)
    *   [Steps](#steps)
5.  [Configuration](#configuration)
    *   [Environment Variables](#environment-variables)
    *   [shadcn-ui](#shadcn-ui-configuration)
    *   [Next.js](#nextjs-configuration)
    *   [Tailwind CSS](#tailwind-css-configuration)
6.  [API Endpoints](#api-endpoints)
    *   [Authentication](#authentication)
    *   [User Management](#user-management)
    *   [Paper Management](#paper-management)
    *   [PDF Processing](#pdf-processing)
    *   [User Profile](#user-profile)
    *   [User Settings](#user-settings)
7.  [Middleware](#middleware)
8.  [Contributing](#contributing)
9.  [License](#license)

## Description

The Research Paper Analyzer is a Next.js application designed for analyzing research papers. It allows users to upload PDF documents, extract text and metadata, and gain AI-powered insights using Google Generative AI and Hugging Face Inference.

## Features

*   **Paper Upload and Processing:** Upload research papers in PDF format.
*   **Text Extraction and Analysis:** Extract text content from PDF documents for further analysis.
*   **AI-powered Insights:** Utilize Google Generative AI and Hugging Face Inference for:
    *   Metadata extraction
    *   Paper summarization
    *   Key findings identification
    *   Novelty assessment
*   **User Authentication and Authorization:** Secure user accounts with JWT-based authentication.
*   **Profile Management:** User profile creation, viewing, and updating.
*   **Settings Management:** Customizable user preferences and notification settings.
*   **Responsive UI:**  User-friendly interface with Radix UI and Tailwind CSS.
*   **Theming:** Support for light/dark themes.

## Tech Stack

*   **Framework:** Next.js (v15.2.4)
*   **UI:** React (v19.0.0), Radix UI, Tailwind CSS, lucide-react
*   **AI:** `@google/generative-ai` (v0.24.0), `@huggingface/inference` (v3.9.2)
*   **PDF Handling:** `pdf-parse` (v1.1.1), `pdf2json` (v3.1.5), `pdfjs-dist` (v5.2.133), `react-pdf` (v9.2.1)
*   **Backend:** Mongoose, JSON Web Tokens
*   **Utilities:** Axios, bcryptjs, class-variance-authority, clsx, formidable, jose, jsonwebtoken, natural, next-themes, sonner, tailwind-merge, ts-node, tw-animate-css, uuid, winston, zustand, multer

## Installation

### Prerequisites

*   Node.js (>=18.0.0)
*   npm or yarn or pnpm or bun
*   MongoDB (running locally or accessible via a URI)
*   Hugging Face API token
*   Google Gemini API key
*   Cloudinary account (for PDF storage)

### Steps

1.  **Clone the repository:**

    ```bash
    git clone [repository_url]
    cd [repository_name]
    ```

2.  **Install dependencies:**

    ```bash
    npm install # or yarn install or pnpm install or bun install
    ```

## Configuration

### Environment Variables

Create a `.env.local` file in the root directory and add the following environment variables:

```
MONGODB_URI=mongodb://localhost:27017/[database_name]
JWT_SECRET=[your_jwt_secret]
HUGGINGFACE_TOKEN=[your_huggingface_api_token]
GEMINI_API_KEY=[your_gemini_api_key]
CLOUDINARY_CLOUD_NAME=[your_cloudinary_cloud_name]
CLOUDINARY_API_KEY=[your_cloudinary_api_key]
CLOUDINARY_API_SECRET=[your_cloudinary_api_secret]
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

Replace the bracketed placeholders with your actual values.

### shadcn-ui Configuration

This project is configured to use shadcn-ui with the "new-york" style, Server Components (RSC), and TypeScript (TSX). It utilizes Tailwind CSS with CSS variables and Lucide icons.

**Configuration Details:**

*   **`$schema`**:  Specifies the schema used for validation and tooling support, pointing to the shadcn-ui schema.
*   **`style`**: `new-york` - Sets the overall aesthetic style of the UI components to the "new-york" theme.
*   **`rsc`**: `true` - Enables the use of React Server Components.
*   **`tsx`**: `true` - Indicates that TypeScript (TSX) is used for component development.
*   **`tailwind`**: Configuration specific to Tailwind CSS:
    *   **`config`**: `""` -  Indicates the project uses the default Tailwind CSS configuration (or a custom configuration defined elsewhere).
    *   **`css`**: `"src/app/globals.css"` - Specifies the location of the global CSS file containing Tailwind directives.
    *   **`baseColor`**: `"neutral"` - Sets the base color for components to the "neutral" palette.
    *   **`cssVariables`**: `true` - Enables the use of CSS variables for Tailwind CSS theming.
    *   **`prefix`**: `""` -  Indicates that no prefix is used for Tailwind CSS utility classes.
*   **`aliases`**: Defines import aliases for project directories:
    *   `components`:  `"@/components"` -  Maps imports for components to the `src/components` directory.
    *   `utils`:  `"@/lib/utils"` - Maps imports for utility functions to the `src/lib/utils` directory.
    *   `ui`:  `"@/components/ui"` -  Maps imports for shadcn-ui components to the `src/components/ui` directory.
	*   `lib`:  `"@/lib"` - Maps imports for general library functions to the `src/lib` directory.
	*   `hooks`:  `"@/hooks"` - Maps imports for custom react hooks to the `src/hooks` directory.
*   **`iconLibrary`**: `"lucide"` -  Specifies that Lucide icons are used for UI elements.

### Next.js Configuration (`next.config.js`)

This file defines the configuration for a Next.js application.

**Configuration Options**
*   **`experimental.serverComponentsExternalPackages`**: Allows specified packages to be treated as external packages within Server Components.  This configuration includes  `["pdf-parse", "pdf2json"]`. This is often necessary when these packages rely on Node.js modules not usually available in the browser.

*   **`webpack`**: Modifies the webpack configuration.  Specifically:
    *   **`config.resolve.fallback = { fs: false, path: false }`**:  Disables the webpack fallbacks for the `fs` and `path` Node.js modules. This is necessary because these modules are typically not available in a browser environment and the included packages might use them.  Setting them to `false` prevents webpack from attempting to polyfill them, likely because those packages aren't actually using them in the deployed environment.

### Tailwind CSS Configuration

This file configures PostCSS to use the `@tailwindcss/postcss` plugin for processing Tailwind CSS directives.

**File:** `postcss.config.js`

**Purpose:**  Sets up Tailwind CSS integration with your project's PostCSS build process.

**Content:**

```javascript
const config = {
  plugins: ["@tailwindcss/postcss"],
};

export default config;
```

**Explanation:**

*   **`config` object:**  A JavaScript object containing PostCSS configuration options.
*   **`plugins` array:**  An array specifying the PostCSS plugins to use.
*   **`"@tailwindcss/postcss"`:**  The official Tailwind CSS plugin for PostCSS. This plugin handles Tailwind's directives (e.g., `@tailwind base`, `@tailwind components`, `@tailwind utilities`) and generates the final CSS output.
*   **`export default config;`:**  Exports the `config` object, making it available for PostCSS to use during the build process.

**Usage:**

1.  Place this file in the root of your project (typically named `postcss.config.js` or `postcss.config.cjs`).
2.  Ensure you have `@tailwindcss/postcss`, `postcss`, and `autoprefixer` (if needed) installed as dev dependencies.
3.  Configure your build process (e.g., Webpack, Parcel, Vite) to use PostCSS.
4.  Import Tailwind's directives in your main CSS file (e.g., `styles.css`).

**Example (styles.css):**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

## API Endpoints

All API endpoints are located under the `/api` directory.

### Authentication

*   **`POST /api/login`**: User login.
    *   **Request Body:** `email`, `password`, `rememberMe`
    *   **Functionality:** Authenticates credentials and issues a JWT.
    *   **Dependencies:** `bcryptjs`, `jsonwebtoken`, `next/server`, `@/models/User`, `@/lib/mongo`

*   **`GET /api/logout`**: User logout.
    *   **Functionality:** Clears the "token" cookie.

*   **`GET /api/auth/user`**: Retrieves user information.
    *   **Functionality:** Authenticates user and returns user details and notifications.

*   **`POST /api/register`**: User signup.
    *   **Request Body:** `name`, `email`, `password`
    *   **Functionality:** Creates a new user in the database.
    *   **Dependencies:** `bcryptjs`, `@/models/User`, `@/lib/logger`, `@/lib/mongo`, `next/server`

### User Management

*   **`PUT /api/change-password`**: Updates user password.
    *   **Request Body:** `currentPassword`, `newPassword`, `confirmNewPassword`
    *   **Functionality:** Allows authenticated users to change their password.
    *   **Dependencies:** `bcryptjs`, `jsonwebtoken`, `@/models/User`, `@/lib/logger`, `next/headers`, `@/lib/mongo`

### Paper Management

*   **`GET /api/papers/[id]`**: Retrieves paper details by ID.
    *   **Functionality:** Fetches paper details from the database.
    *   **Dependencies:** `@/lib/logger`, `@/models/Paper`, `@/lib/mongo`, `next/server`

*   **`GET /api/papers`**: Retrieves all papers uploaded by the authenticated user.
    *   **Functionality:** Retrieves papers from the database where `uploaderId` matches the user's ID.
    *   **Authentication:** Requires a valid JWT token.
    *   **Dependencies:** `jsonwebtoken`, `@/lib/logger`, `@/models/Paper`, `next/headers`, `@/lib/mongo`

*   **`DELETE /api/papers/[id]`**: Deletes a paper by ID.
    *   **Functionality:** Deletes a paper after verifying user ownership.
    *   **Authentication:** Requires a valid JWT token.
    *   **Dependencies:** `jsonwebtoken`, `@/lib/logger`, `@/models/Paper`, `next/headers`, `@/lib/mongo`

### PDF Processing

*   **`POST /api/pdf`**: Processes uploaded PDF files.
    *   **Functionality:** Extracts data from uploaded PDF files, uploads them to Cloudinary, and creates a paper record in the database.
    *   **Authentication:** Authenticates user based on JWT token from cookies.
    *   **Dependencies:** `axios`, `jsonwebtoken`, `next/server`, `next/headers`, `@/lib/logger`, `@/lib/mongo`, `@/usecases/paper`, `@/utils/pdfProcessor`

### User Profile

*   **`GET /api/profile`**: Retrieves user profile data.
    *   **Functionality:** Fetches user profile data based on the JWT in the cookie.
    *   **Authentication:** Requires JWT authentication.
    *   **Dependencies:** `jsonwebtoken`, `@/models/User`, `@/lib/logger`, `@/models/Paper`, `next/headers`, `@/lib/mongo`, `next/server`

*   **`PUT /api/profile`**: Updates user profile data.
    *   **Functionality:** Updates user profile data in the database.
    *   **Authentication:** Requires JWT authentication.
    *   **Request Body:** `name`, `bio`, `institution`, `position`, `website`, `researchInterests`
    *   **Dependencies:** `jsonwebtoken`, `@/models/User`, `@/lib/logger`, `@/models/Paper`, `next/headers`, `@/lib/mongo`, `next/server`

### User Settings

*   **`GET /api/settings`**: Retrieves user settings.
    *   **Functionality:** Retrieves user settings from the database.
    *   **Authentication:** Requires JWT authentication.
    *   **Dependencies:** `jsonwebtoken`, `@/models/User`, `@/lib/logger`, `next/headers`, `@/lib/mongo`, `next/server`

*   **`PUT /api/settings`**: Updates user settings.
    *   **Request Body:** `settingsType`, `data`
    *   **Functionality:** Updates user settings based on the provided type and data.
    *   **Authentication:** Requires JWT authentication.
    *   **Dependencies:** `jsonwebtoken`, `@/models/User`, `@/lib/logger`, `next/headers`, `@/lib/mongo`, `next/server`

## Middleware

*   Protects specific routes by verifying JWT tokens.
    *   Applies to routes defined in `config.matcher`.
    *   Redirects to `/auth/login` if the token is missing or invalid.
    *   Sets an `x-user` request header containing user information for backend routes.
    *   **Dependencies:** `next/headers`, `next/server`, `@/lib/auth`

## Contributing

Contributions are welcome! Please follow these steps:

1.  Fork the repository.
2.  Create a new branch for your feature or bug fix.
3.  Make your changes.
4.  Write tests to cover your changes.
5.  Ensure all tests pass.
6.  Submit a pull request.

## License

This project is licensed under the [MIT License](LICENSE).
```

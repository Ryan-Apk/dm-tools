# dm-tools

A set of tools for running D&D games. This project provides utilities to assist Dungeon Masters in managing campaigns, tracking game mechanics, and enhancing the overall D&D experience.

### This tool is still in alpha/broken/unworking state, use at your own discretion. 

## Tech Stack

- **Frontend Framework**: React 18.3.1
- **Build Tool**: Vite 8.0.12
- **Routing**: React Router DOM 7.17.0
- **Styling**: Tailwind CSS 4.3.0
- **Code Quality**: ESLint
- **Backend**: Express 5.0.0
- **Database**: MongoDB with Mongoose 9.7.1
- **Authentication**: JWT with bcryptjs
- **Security**: Rate limiting, XSS sanitization

## Features

- **Roadmap**: Planned features include dice rolling, dice history recording, and d10000 table functionality
- **Bug Tracking**: Known issues are tracked and viewable in the app
- **User Authentication**: JWT-based authentication with secure password hashing
- **Database Integration**: MongoDB backend for persistent data storage

## Getting Started

### Prerequisites

- Node.js ^20.19.0 || ^22.13.0 || >=24
- MongoDB instance running
- pnpm 11.6.0 (recommended) or npm

### Environment Variables

Both the client and server require environment configuration. Create `.env` files in the respective directories:

#### Server Environment Variables (`server/.env`)

```
# Server Configuration
PORT=3000
NODE_ENV=development

# MongoDB Configuration
MONGO_HOST=localhost
MONGO_PORT=27017
MONGO_DATABASE=dm_tools
MONGO_USERNAME=admin
MONGO_PASSWORD=change_me

# JWT Configuration
JWT_KEY=your_super_secret_jwt_key_change_this_in_production
JWT_KEY_EXPIRE=1h
```

**Required Variables:**
- `JWT_KEY` - **REQUIRED** - Secret key for JWT token signing. Must be set or the server will not start
- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Set to "production" for production deployments
- `MONGO_HOST` - MongoDB host (default: localhost)
- `MONGO_PORT` - MongoDB port (default: 27017)
- `MONGO_DATABASE` - MongoDB database name (default: testDB)
- `MONGO_USERNAME` - MongoDB username (default: admin)
- `MONGO_PASSWORD` - MongoDB password (default: change_me)
- `JWT_KEY_EXPIRE` - JWT token expiration time (default: 1h)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Ryan-Apk/dm-tools.git
cd dm-tools
```

2. Set up environment variables:
```bash
# Create .env file in server directory
cd server
# Copy the example or manually create .env with required variables
# Edit .env with your MongoDB credentials and JWT key
cd ..
```

3. Install dependencies:

**Using pnpm (recommended):**
```bash
pnpm install
cd server && pnpm install && cd ..
cd client && pnpm install && cd ..
```

**Using npm:**
```bash
npm install
cd server && npm install && cd ..
cd client && npm install && cd ..
```

### Development

To start both the development server and client with hot module replacement:

**From the root directory:**

```bash
# Start both client and server (if configured with concurrently)
npm run dev
```

Or start them individually:

```bash
# Terminal 1 - Start the backend server
cd server
npm run dev-server
```

```bash
# Terminal 2 - Start the frontend client
cd client
npm run dev-client
```

The client application will be available at `http://localhost:5173` (or another port if 5173 is in use).
The server API will be available at `http://localhost:3000`.

### Building for Production

To create optimized production builds:

```bash
# Build client
cd client
npm run build-client

# Server does not require a build step
# Ensure NODE_ENV is set to "production" and all environment variables are configured
```

The compiled client files will be in the `client/dist` directory.

### Preview Production Build

To preview the client production build locally:

```bash
cd client
npm run preview-client
```

### Linting

To check code quality with ESLint:

```bash
# Lint client
cd client
npm run lint-client

# Lint server (if configured)
cd ../server
npm run lint
```

## Project Structure

```
dm-tools/
├── client/
│   ├── src/
│   │   ├── components/          # Reusable React components
│   │   │   └── Button.jsx       # Custom button component
│   │   ├── pages/               # Page components
│   │   │   ├── App.jsx          # Main app router
│   │   │   ├── BugList.jsx      # Bug list and roadmap page
│   │   │   └── NotFound.jsx     # 404 page
│   │   ├── assets/              # Static assets
│   │   └── main.jsx             # Application entry point
│   ├── public/                  # Public static files
│   ├── index.html               # HTML template
│   ├── vite.config.js           # Vite configuration
│   └── package.json             # Client dependencies
├── server/
│   ├── routes/
│   │   ├── Authenticate.js      # JWT authentication endpoints
│   │   ├── RandomTableRoller.js # Database/dice rolling routes
│   │   └── WhiteboardLink.js    # Whiteboard functionality
│   ├── models/                  # MongoDB schemas
│   ├── middlwares/              # Express middleware
│   │   └── CheckDbStatus.js     # Database connection checker
│   ├── tools/                   # Utility functions
│   ├── app.js                   # Express app setup
│   ├── .env                     # Environment variables (not in git)
│   └── package.json             # Server dependencies
└── package.json                 # Root package.json
```

## Routes

### Client Routes
- `/` - Home page (currently showing test content)
- `/bugs` - View roadmap and known bugs
- `*` - 404 Not Found page

### Server API Routes
- `POST /auth/login` - User login (returns JWT token)
- `POST /auth/signup` - User registration
- `GET /auth` - List available auth endpoints
- `/database/*` - Protected routes for database operations (requires valid JWT)
- `/database/whiteboard` - Whiteboard functionality (requires valid JWT)

**Authentication**: All routes except `/auth/login` and `/auth/signup` require a valid JWT token in the `Authorization` header as `Bearer <token>`

## Scripts

| Command | Location | Description |
|---------|----------|-------------|
| `npm run dev-client` | client | Start client development server with HMR |
| `npm run build-client` | client | Build client for production |
| `npm run preview-client` | client | Preview client production build locally |
| `npm run lint-client` | client | Run ESLint checks on client |
| `npm run dev-server` | server | Start server with file watching for development |
| `npm run start-server` | server | Start server for production |

## Future Enhancements

- Dice rolling functionality
- Dice history recording
- D10000 table integration
- Additional user features and game tools

## Known Issues

- Issue with Firefox mouse cursors where clicking the button breaks them

## Security Notes

- Always change the `JWT_KEY` in production to a strong, random value
- Never commit `.env` files with real credentials to version control
- The server includes rate limiting to prevent abuse (120 requests per minute globally, 5 login attempts per 15 minutes)
- XSS sanitization is enabled in production mode
- Passwords are hashed using bcryptjs with salt rounds of 12

## License

This project is private.

# Hospital Backend

## Setup

1. Copy `.env.example` to `.env` and fill in your MongoDB URI, JWT secret, and SMTP credentials.
2. Run `npm install` to install dependencies.
3. Start the server with `npm run dev` (for development with nodemon) or `npm start`.

## API Endpoints

- `POST /api/auth/signup` — Register a new user. `{ name, email, password }`
- `POST /api/auth/login` — Login. `{ email, password }`

On login, a notification email will be sent (content customizable later).

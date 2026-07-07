import express from 'express';

import randomRoller from './routes/RandomTableRoller.js';
import whiteboardRoute from './routes/WhiteboardLink.js';
import authentication, { requireAuth } from './routes/Authenticate.js';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import { log, logWarn } from './tools/consoleHandler.js';

import CheckDbStatus from './middlwares/CheckDbStatus.js';
import { xss } from 'express-xss-sanitizer';
import cors from 'cors';
import cookieParser from 'cookie-parser';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// setup ratelimiting
const globalLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  limit: 120,
  standardHeaders: true, // sends RateLimit-* headers
  legacyHeaders: false, // disables X-RateLimit-* headers
  message: {
    status: 'error',
    error: 'Too many requests, try again later.',
  },
});

// development-only CORS
if (process.env.NODE_ENV !== 'production') {
  logWarn('Warning: development CORS enabled. Set NODE_ENV=production before deployment.');
  app.use(cors({
    // Replace with your frontend URL if you encounter credential matching errors
    origin: true,

    // Explicitly allow all incoming header varieties
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],

    // Necessary to pass HTTP-only cookies across different local ports (e.g. 5173 to 3000)
    credentials: true,
  }));
}

// database availability check
app.use(CheckDbStatus);

// parse request bodies
app.use(express.json({ limit: '1kb' }));
app.use(express.urlencoded({ extended: true, limit: '1kb' }));
app.use(cookieParser());

// sanitise input
app.use(xss());

// adding this for behind proxy and then enable the limiter:
app.set('trust proxy', 1);
app.use(globalLimiter);

app.use('/auth', authentication);

// everything below here requires an 18+ all access token to get into
app.use(requireAuth);
app.use('/database/dice', randomRoller);
app.use('/database/whiteboard', whiteboardRoute);

// TODO setup the backend with a middleware to authenticate requests
app.use((req, res) => {
  res.status(404).json({ status: 'error', error: 'Endpoint not found' });
});

// app.listen returns the HTTP server that a WebSocket server can share later.
const server = app.listen(port, () => {
  log(`Server started on port ${port}`);
});

export { app, server };

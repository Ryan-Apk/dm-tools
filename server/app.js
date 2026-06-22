import express from 'express';

import apiDb from './routes/index.js';
import authentication from './routes/authenticate.js';
import mongoose, {mongo} from "mongoose";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// connect to MongoDB
const mongoHost = process.env.MONGO_HOST || "localhost";
const mongoPort = process.env.MONGO_PORT || "27017";
const mongoDatabase = process.env.MONGO_DATABASE || "testDB";
const mongoUsername = process.env.MONGO_USERNAME || "admin";
const mongoPassword = process.env.MONGO_PASSWORD || "change_me";

const mongoUri = `mongodb://${mongoUsername}:${mongoPassword}@${mongoHost}:${mongoPort}/${mongoDatabase}?authSource=admin`;

try {
  await mongoose.connect(mongoUri);
  console.log("Connected to MongoDB");
} catch (err) {
  console.error("MongoDB connection failed:", err);
  process.exit(1);
}

// setup ratelimiting
const globalLimiter = rateLimit({
  windowMs:  60 * 1000, // 1 minute
  limit: 120,
  standardHeaders: true,   // sends RateLimit-* headers
  legacyHeaders: false,    // disables X-RateLimit-* headers
  message: {
    error: "Too many requests, try again later."
  }
});

app.use(express.json());
// adding this for behind proxy and then enable the limiter:
app.set("trust proxy", 1);
app.use(globalLimiter);
app.use('/auth', authentication);
app.use('/database', apiDb);

// TODO setup the backend with a middleware to authenticate requests
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// app.listen returns the HTTP server that a WebSocket server can share later.
const server = app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});

export { app, server };

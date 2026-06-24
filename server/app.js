import express from 'express';

import apiDb from './routes/database.js';
import authentication from './routes/authenticate.js';
import mongoose, {mongo} from "mongoose";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";
import {requireAuth} from "./routes/authenticate.js";
import CheckDbStatus from "./middlwares/CheckDbStatus.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

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

app.use(CheckDbStatus)
app.use(express.json());
// adding this for behind proxy and then enable the limiter:
app.set("trust proxy", 1);
app.use(globalLimiter);

// yo yo is da data banging right now? if not dont send it


app.use('/auth', authentication);

// everything below here requires an 18+ all access token to get into
app.use(requireAuth);
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

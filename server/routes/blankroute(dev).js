import express from 'express';
import dotenv from 'dotenv';
import rateLimit from "express-rate-limit";
import { log, logError } from "../tools/consoleHandler.js"
import {xss} from "express-xss-sanitizer";

const router = express.Router();

dotenv.config();

// optional rate limiter
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: "error",
        error: "Too many login attempts, try again later."
    }
});


// List available functions
router.get('/', (req, res) => {
    res.json({
        status: 'success',
        message: 'Available endpoints: /login, /signup'
    });
});

// first route
router.get('/route', limiter, xss(), (req, res) => {
    log("Req made to route");

    res.status(405).json({
        status: 'error',
        error: 'Use POST /auth/login instead',
    });
});


// TODO fix this so that it doesnt crash with malformed body
// todo update this so that it actually isnt a security risk as tokens do not currently expire :/
// if the required information is in, returns a token to the user
router.post("/login", async (req, res) => {
    return res.status(500).json({
        status: 'error',
        error: "An internal error has occured",
    });
})

export default router;


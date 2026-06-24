import express from 'express';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import rateLimit from "express-rate-limit";
import {log, logError, logWarn} from "../tools/consoleHandler.js"

const router = express.Router();

// TODO put this in docs for when the container is being made
dotenv.config();
const jwtKey = process.env.JWT_KEY;
const jwtKeyExpireTime = process.env.JWT_KEY_EXPIRE || "1h";

if (!process.env.JWT_KEY) {
    throw new Error("JWT_KEY is required");
}

// more strict rate limiting (5 every 15m)
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        error: "Too many login attempts, try again later."
    }
});

// List available functions
router.get('/', (req, res) => {
    res.json({ message: 'Available endpoints: /login, /signup' });
});

// returns an error code when sending a get to the post
router.get('/login', (req, res) => {
    log('Got GET /auth/login instead of POST: ' + req.body + " from " + req.ip);
    res.status(405).json({
        error: 'Use POST /auth/login instead',
    });
});

// returns an error code when sending a get to the post
router.get('/signup', (req, res) => {
    log('Got GET /auth/signup instead of POST: ' + req.body + " from " + req.ip);
    res.status(405).json({
        error: 'Use POST /auth/signup instead',
    });
});

// if the required information is in, returns a token to the user
router.post("/login", loginLimiter, async (req, res) => {
    try {
        const { email, password } = req.body;

        // validate sign up information and extract cleanly parsed fields
        const validation = validateAuthInput({ email, password });

        if (validation.error) {
            const { password, ...bodyWithoutPassword } = req.body;
            logError("Recieved a malformed signup request: " + JSON.stringify(bodyWithoutPassword) + " from " + req.ip);
            return res.status(400).json({
                success: false,
                message: validation.error,
            });
        }

        const cleanEmail = String(validation.data.email);
        const cleanPassword = String(validation.data.password);

        const existingUser = await User.findOne({ email: cleanEmail });

        if (!existingUser || !(await bcrypt.compare(cleanPassword, existingUser.password))) {
            const error = new Error("Invalid email or password");
            error.status = 401;
            const { password, ...bodyWithoutPassword } = req.body;
            console.warn("Failed login attempt: " + JSON.stringify(bodyWithoutPassword) + " from " + JSON.stringify(req.ip));
            return res.status(401).json({
                error: "Invalid email or password"
            });
        }

        const token = jwt.sign(
            {
                userId: existingUser.id,
                email: existingUser.email,
            },
            jwtKey,
            { expiresIn: jwtKeyExpireTime }
        );

        // TODO make this return a cookie token to properly store it
        log("User successfully logged in: " + existingUser.email);
        return res.status(200).json({
            success: true,
            data: {
                userId: existingUser.id,
                email: existingUser.email,
                token,
            },
        });
    } catch (err) {
        logError("/auth/login threw an error: \n" + err + "\n data: + \n" + req.body);
        return res.status(500).json({
            error: "An internal error has occured",
        });
    }
});

// returns a token if the signup request is a valid request
router.post("/signup", loginLimiter, async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // validate sign up information and extract cleanly parsed fields
        const validation = validateAuthInput({ username, email, password }, true);

        if (validation.error) {
            const { password, ...bodyWithoutPassword } = req.body;
            logError("Recieved a malformed signup request: " + JSON.stringify(bodyWithoutPassword) + " from " + req.ip);
            return res.status(400).json({
                success: false,
                message: validation.error,
            });
        }

        const cleanUsername = String(validation.data.username);
        const cleanEmail = String(validation.data.email);
        const cleanPassword = String(validation.data.password);

        const existingUser = await User.findOne({ email: cleanEmail });

        if (existingUser) {
            log("Someone tried to sign up with an existing account: " + cleanEmail + " from " + req.ip);
            return res.status(409).json({
                error: "Email already exists",
            });
        }

        const newUser = new User({
            username: cleanUsername,
            email: cleanEmail,
            password: await bcrypt.hash(cleanPassword, 12),
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        await newUser.save();

        const token = jwt.sign(
            {
                userId: newUser.id,
                email: newUser.email,
            },
            jwtKey,
            { expiresIn: jwtKeyExpireTime }
        );

        // TODO make this return a cookie token to properly store it
        log("New sign up: " + newUser.email + " " + newUser.username + " from " + req.ip);
        res.status(201).json({
            success: true,
            data: {
                userId: newUser.id,
                email: newUser.email,
                token,
            },
        });
    } catch (err) {
        const { password, ...bodyWithoutPassword } = req.body;
        logError("/auth/signup threw an error: \n" + err + "\n data: + \n" + JSON.stringify(bodyWithoutPassword));
        return res.status(500).json({
            error: "An internal error has occured",
        });
    }
});

// Sanitized Validation Handler: Ensures types are verified and outputs clean data targets
function validateAuthInput({ username, email, password }, requireUsername = false) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (requireUsername && (!username || typeof username !== "string" || username.trim().length < 3)) {
        return "Username must be at least 3 characters long";
    }

    if (!email || typeof email !== "string" || !emailRegex.test(email.trim())) {
        return "Invalid email address";
    }

    if (!password || typeof password !== "string" || password.length < 8) {
        return "Password must be at least 8 characters long";
    }

    return null;
}

export default router;
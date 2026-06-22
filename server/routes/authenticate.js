import express from 'express';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import rateLimit from "express-rate-limit";

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

router.get('/login', (req, res) => {
    console.log('Got GET /auth/login instead of POST: ' + req.body + " from " + req.ip);
    res.status(405).json({
        error: 'Use POST /auth/login instead',
    });
});

router.get('/signup', (req, res) => {
    console.log('Got GET /auth/signup instead of POST: ' + req.body + " from " + req.ip);
    res.status(405).json({
        error: 'Use POST /auth/signup instead',
    });
});

router.post("/login", loginLimiter, async (req, res) => {
    try {
        const { email, password } = req.body;

        // validate sign up information
        const validationError = validateAuthInput({ email, password });

        if (validationError) {
            console.error("Recieved a malformed signup request: " + JSON.stringify(req.body) + " from " + req.ip);
            return res.status(400).json({
                success: false,
                message: validationError,
            });
        }

        const existingUser = await User.findOne({ email });

        if (!existingUser || !(await bcrypt.compare(password, existingUser.password))) {
            const error = new Error("Invalid email or password");
            error.status = 401;
            console.warn("Failed login attempt: " + JSON.stringify(req.body) + " from " + JSON.stringify(req.ip));
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
        console.log("User successfully logged in: " + existingUser.email);
        return res.status(200).json({
            success: true,
            data: {
                userId: existingUser.id,
                email: existingUser.email,
                token,
            },
        });
    } catch (err) {
        console.error("/auth/login threw an error: \n" + err + "\n data: + \n" + req.body);
        return res.status(500).json({
            error: "An internal error has occured",
        });
    }
});

router.post("/signup", loginLimiter, async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // validate sign up information
        const validationError = validateAuthInput({ username, email, password }, true);

        if (validationError) {
            console.error("Recieved a malformed signup request: " + JSON.stringify(req.body) + " from " + req.ip);
            return res.status(400).json({
                success: false,
                message: validationError,
            });
        }

        const newUser = new User({
            username,
            email,
            password: await bcrypt.hash(password, 12),
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        // see if the user currently exists already
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            console.log("Someone tried to sign up with an existing account: " + newUser.email + " " + newUser.name + " from " + req.ip);
            return res.status(409).json({
                error: "Email already exists",
            });
        }

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
        console.log("New sign up: " + newUser.email + " " + newUser.name + " from " + req.ip);
        res.status(201).json({
            success: true,
            data: {
                userId: newUser.id,
                email: newUser.email,
                token,
            },
        });
    } catch (err) {
        console.error("/auth/signup threw an error: \n" + err + "\n data: + \n" + JSON.stringify(req.body));
        return res.status(500).json({
            error: "An internal error has occured",
        });
    }
});

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
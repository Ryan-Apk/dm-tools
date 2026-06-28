import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import rateLimit from "express-rate-limit";
import { log, logError } from "../tools/consoleHandler.js";
import { randomUUID } from 'node:crypto';

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
        status: "error",
        error: "Too many login attempts, try again later."
    }
});

function removePasswordFromBody(body) {
    const { password, ...bodyWithoutPassword } = body;
    return bodyWithoutPassword;
}

function createToken(user) {
    return jwt.sign(
        {
            userId: user.id,
            email: user.email,
            tokenVersion: user.tokenVersion,
        },
        jwtKey,
        { expiresIn: jwtKeyExpireTime }
    );
}

function sendAuthCookie(res, token, maxAge) {
    res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge,
    });
}

function sendMalformedAuthRequest(res, req, validation) {
    const bodyWithoutPassword = removePasswordFromBody(req.body);

    logError("Recieved a malformed signup request: " + JSON.stringify(bodyWithoutPassword) + " from " + req.ip);

    return res.status(400).json({
        status: 'error',
        success: false,
        message: validation.error,
    });
}

/// TODO this whole file needs to be reworked to use the refresh token concept instead of the long lived token

// List available functions
router.get('/', (req, res) => {
    res.json({
        status: 'success',
        message: 'Available endpoints: /login, /signup'
    });
});

// returns an error code when sending a get to the post
router.get('/login', (req, res) => {
    log('Got GET /auth/login instead of POST: ' + req.body + " from " + req.ip);

    res.status(405).json({
        status: 'error',
        error: 'Use POST /auth/login instead',
    });
});

// returns an error code when sending a get to the post
router.get('/signup', (req, res) => {
    log('Got GET /auth/signup instead of POST: ' + req.body + " from " + req.ip);

    res.status(405).json({
        status: 'error',
        error: 'Use POST /auth/signup instead',
    });
});

// TODO fix this so that it doesnt crash with malformed body
// todo update this so that it actually isnt a security risk as tokens do not currently expire :/
// if the required information is in, returns a token to the user
router.post("/login", loginLimiter, async (req, res) => {
    try {
        const { email, password } = req.body;

        // validate sign up information and extract cleanly parsed fields
        const validation = validateAuthInput({ email, password });

        if (validation.error) {
            return sendMalformedAuthRequest(res, req, validation);
        }

        const cleanEmail = String(validation.data.email);
        const cleanPassword = String(validation.data.password);

        const existingUser = await User.findOne({ email: cleanEmail });
        const hasValidPassword = existingUser && await bcrypt.compare(cleanPassword, existingUser.password);

        if (!hasValidPassword) {
            const error = new Error("Invalid email or password");
            error.status = 401;

            const bodyWithoutPassword = removePasswordFromBody(req.body);

            console.warn("Failed login attempt: " + JSON.stringify(bodyWithoutPassword) + " from " + JSON.stringify(req.ip));

            return res.status(401).json({
                status: 'error',
                error: "Invalid email or password"
            });
        }

        // Update the lastLogin field
        existingUser.lastLogin = new Date();
        existingUser.tokenVersion = randomUUID();
        existingUser.save().catch((err) => {
            logError("Background save failed for user login state:", err);
        });

        const token = createToken(existingUser);

        // send cookie and response
        log("User successfully logged in: " + existingUser.email);

        sendAuthCookie(res, token, 60 * 60 * 1000);

        return res.status(200).json({
            status: 'success',
            success: true,
            data: {
                userId: existingUser.id,
                email: existingUser.email,
            },
        });
    } catch (err) {
        logError("/auth/login threw an error: \n" + err + "\n data: + \n" + req.body);

        return res.status(500).json({
            status: 'error',
            error: "An internal error has occured",
        });
    }
});

// returns a token if the signup request is a valid request
// TODO fix this so that it doesnt crash with malformed body
router.post("/signup", loginLimiter, async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // validate sign up information and extract cleanly parsed fields
        const validation = validateAuthInput({ username, email, password }, true);

        if (validation.error) {
            return sendMalformedAuthRequest(res, req, validation);
        }

        const cleanUsername = String(validation.data.username);
        const cleanEmail = String(validation.data.email);
        const cleanPassword = String(validation.data.password);

        const existingUser = await User.findOne({ email: cleanEmail });

        if (existingUser) {
            log("Someone tried to sign up with an existing account: " + cleanEmail + " from " + req.ip);

            return res.status(409).json({
                status: 'error',
                error: "Email already exists",
            });
        }

        const tokenVersion = randomUUID();

        const newUser = new User({
            username: cleanUsername,
            email: cleanEmail,
            password: await bcrypt.hash(cleanPassword, 12),
            createdAt: new Date(),
            updatedAt: new Date(),
            lastLogin: new Date(),
            tokenVersion: tokenVersion,
        });

        await newUser.save();

        const token = createToken(newUser);

        // TODO make this return a cookie token to properly store it
        log("New sign up: " + newUser.email + " " + newUser.username + " from " + req.ip);

        // 6hr persist time as most sessions last that long
        sendAuthCookie(res, token, 6 * 60 * 60 * 1000);

        return res.status(201).json({
            status: 'success',
            success: true,
            data: {
                userId: newUser.id,
                email: newUser.email
            },
        });
    } catch (err) {
        const bodyWithoutPassword = removePasswordFromBody(req.body);

        logError("/auth/signup threw an error: \n" + err + "\n data: + \n" + JSON.stringify(bodyWithoutPassword));

        return res.status(500).json({
            status: 'error',
            error: "An internal error has occured",
        });
    }
});

// Sanitized Validation Handler: Ensures types are verified and outputs clean data targets
// TODO probably should move this to a more general sanitise location
function validateAuthInput({ username, email, password }, requireUsername = false) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (requireUsername && (!username || typeof username !== "string" || username.trim().length < 3)) {
        return {
            error: "Username must be at least 3 characters long",
            data: null
        };
    }

    if (!email || typeof email !== "string" || !emailRegex.test(email.trim())) {
        return {
            error: "Invalid email address",
            data: null
        };
    }

    if (!password || typeof password !== "string" || password.length < 8) {
        return {
            error: "Password must be at least 8 characters long",
            data: null
        };
    }

    return {
        error: null,
        data: {
            username: username ? username.trim() : "",
            email: email.trim(),
            password: password
        }
    };
}

// middleware for authenticating people
// TODO should probably move this to a different spot but im encapsulating everything here instead
export async function requireAuth(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            status: 'error',
            error: "Missing token"
        });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_KEY);

        // Look up the user in the database (explicitly selecting tokenVersion if hidden)
        const user = await User.findById(decoded.userId).select('+tokenVersion');

        // Check if the user exists and if their token version is still valid
        if (!user || user.tokenVersion !== decoded.tokenVersion) {
            return res.status(401).json({
                status: 'error',
                error: "Token has been revoked or user not found"
            });
        }

        // 4. Attach the full, fresh user document to the request for your routes to use
        req.user = user;
        next();
    } catch {
        return res.status(401).json({
            status: 'error',
            error: "Invalid or expired token"
        });
    }
}


export default router;


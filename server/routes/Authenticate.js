import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import rateLimit from "express-rate-limit";
import {log, logError} from "../tools/consoleHandler.js";
import {randomUUID} from 'node:crypto';

const router = express.Router();

// TODO put this in docs for when the container is being made
dotenv.config();

const jwtKey = process.env.JWT_KEY;
const jwtKeyExpireTime = process.env.JWT_KEY_EXPIRE || "15m";
const jwtRefreshKey = process.env.JWT_REFRESH_KEY;
const jwtRefreshKeyExpireTime = process.env.JWT_REFRESH_KEY_EXPIRE || "7d";

if (!process.env.JWT_KEY) {
    throw new Error("JWT_KEY is required");
}

if (!process.env.JWT_REFRESH_KEY) {
    throw new Error("JWT_REFRESH_KEY is required");
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

function removePasswordFromBody(body = { }) {
    const { password, ...bodyWithoutPassword } = body;
    return bodyWithoutPassword;
}

function createAccessToken(user) {
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

function createRefreshToken(user) {
    return jwt.sign(
        {
            userId: user.id,
            tokenVersion: user.tokenVersion,
        },
        jwtRefreshKey,
        { expiresIn: jwtRefreshKeyExpireTime }
    );
}

// Converts jsonwebtoken-style expiry strings ("15m", "7d") into a cookie maxAge in ms
function parseExpiryToMs(expiry) {
    const match = /^(\d+)([smhd])$/.exec(expiry);

    if (!match) {
        throw new Error(`Invalid expiry format: ${expiry}`);
    }

    const unitMs = {
        s: 1000, m: 60 * 1000, h: 60 * 60 * 1000, d: 24 * 60 * 60 * 1000,
    };

    return Number(match[1]) * unitMs[match[2]];
}

function cookieAttrs(path) {
    const isProd = process.env.NODE_ENV === 'production';
    const crossSite = !isProd;
    return {
        httpOnly: true,
        sameSite: crossSite ? 'none' : 'lax',
        secure: crossSite ? true : isProd,   // none ⇒ must be Secure
        path,
    };
}

function setAuthCookies(res, accessToken, refreshToken) {
    res.cookie('access_token', accessToken, {
        ...cookieAttrs('/'),
        maxAge: parseExpiryToMs(jwtKeyExpireTime),
    });
    res.cookie('refresh_token', refreshToken, {
        ...cookieAttrs('/auth'),
        maxAge: parseExpiryToMs(jwtRefreshKeyExpireTime),
    });
}

function clearAuthCookies(res) {
    res.clearCookie('access_token', cookieAttrs('/'));
    res.clearCookie('refresh_token', cookieAttrs('/auth'));
}

function sendMalformedAuthRequest(res, req, validation) {
    const bodyWithoutPassword = removePasswordFromBody(req.body);

    logError("Recieved a malformed request: " + JSON.stringify(bodyWithoutPassword) + " from " + req.ip);

    return res.status(400).json({
        status: 'error',
        success: false,
        message: validation.error,
    });
}

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
// if the required information is in, returns a token to the user
router.post("/login", loginLimiter, async (req, res) => {
    try {
        const email = req.body?.email ?? "";
        const password = req.body?.password ?? "";

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

        const accessToken = createAccessToken(existingUser);
        const refreshToken = createRefreshToken(existingUser);

        // send cookies and response
        log("User successfully logged in: " + existingUser.email);

        setAuthCookies(res, accessToken, refreshToken);

        return res.status(200).json({
            status: 'success',
            success: true,
            data: {
                userId: existingUser.id,
                email: existingUser.email,
            },
        });
    } catch (err) {
        // Use the safe function here instead of accessing req.body directly
        const safeBody = removePasswordFromBody(req.body);
        logError("/auth/login threw an error: \n" + err + "\n data: \n" + JSON.stringify(safeBody));

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
            tokenVersion,
        });

        await newUser.save();

        const accessToken = createAccessToken(newUser);
        const refreshToken = createRefreshToken(newUser);

        log("New sign up: " + newUser.email + " " + newUser.username + " from " + req.ip);

        setAuthCookies(res, accessToken, refreshToken);

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

// verifies the refresh token cookie and issues a fresh access token
router.post('/refresh', async (req, res) => {
    const refreshToken = req.cookies?.refresh_token;

    if (!refreshToken) {
        return res.status(401).json({
            status: 'error',
            error: "Missing refresh token",
        });
    }

    try {
        const decoded = jwt.verify(refreshToken, jwtRefreshKey);
        const user = await User.findById(decoded.userId).select('+tokenVersion');

        if (!user || user.tokenVersion !== decoded.tokenVersion) {
            clearAuthCookies(res);

            return res.status(401).json({
                status: 'error',
                error: "Refresh token has been revoked or user not found",
            });
        }

        const accessToken = createAccessToken(user);

        res.cookie('access_token', accessToken, {
            ...cookieAttrs('/'),
            maxAge: parseExpiryToMs(jwtKeyExpireTime),
        });

        return res.status(200).json({
            status: 'success',
            success: true,
        });
    } catch {
        clearAuthCookies(res);

        return res.status(401).json({
            status: 'error',
            error: "Invalid or expired refresh token",
        });
    }
});

// revokes all outstanding tokens for the user (if any) and clears auth cookies
router.post('/logout', async (req, res) => {
    const refreshToken = req.cookies?.refresh_token;

    if (refreshToken) {
        try {
            const decoded = jwt.verify(refreshToken, jwtRefreshKey);
            await User.findByIdAndUpdate(decoded.userId, { tokenVersion: randomUUID() });
        } catch {
            // nothing to revoke if the refresh token was already invalid/expired
        }
    }

    clearAuthCookies(res);

    return res.status(200).json({
        status: 'success',
        success: true,
    });
});

// returns the currently authenticated user
router.get('/me', requireAuth, async (req, res) => {

    // lookup some additional data
    const user = await User.findOne({ email: req.user.email }).select('campaignAssigned currentCampaign');
    const campaignsAssigned = user ? user.campaignAssigned : [];
    const currentCampaign = user ? user.currentCampaign : null;

    if ((process.env.NODE_ENV === 'dev')) {
        const data = {
            userId: req.user.id,
              email: req.user.email,
              username: req.user.username,
              campaigns: campaignsAssigned,
              currentCampaign,
        }
        log(JSON.stringify(data))
    }

    return (res.status(200).json({
        status: 'success',
        success: true,
        data: {
            userId: req.user.id,
            email: req.user.email,
            username: req.user.username,
            campaigns: campaignsAssigned,
            currentCampaign,
        },
    }))
});

// sets which of the user's assigned campaigns is currently active; the frontend
// uses this to filter campaign-scoped data everywhere else
router.patch('/me/campaign', requireAuth, async (req, res) => {
    const { campaignId } = req.body ?? {};

    try {
        const user = await User.findById(req.user.id).select('campaignAssigned currentCampaign');

        if (!user) {
            return res.status(404).json({
                status: 'error',
                error: 'User not found',
            });
        }

        if (campaignId === null || campaignId === undefined) {
            user.currentCampaign = null;
        } else {
            const isAssigned = user.campaignAssigned.some((id) => id.toString() === String(campaignId));

            if (!isAssigned) {
                return res.status(400).json({
                    status: 'error',
                    error: 'You are not assigned to that campaign',
                });
            }

            user.currentCampaign = campaignId;
        }

        await user.save();

        log(`User ${req.user.email} set current campaign to ${user.currentCampaign}`);

        return res.status(200).json({
            status: 'success',
            success: true,
            data: {
                currentCampaign: user.currentCampaign,
            },
        });
    } catch (err) {
        logError('/auth/me/campaign threw an error: \n' + err);

        return res.status(400).json({
            status: 'error',
            error: 'Invalid campaign id',
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
            password
        }
    };
}

// middleware for authenticating people
// TODO should probably move this to a different spot but im encapsulating everything here instead
export async function requireAuth(req, res, next) {
    const token = req.cookies?.access_token;

    if (!token) {
        return res.status(401).json({
            status: 'error',
            error: "Missing token"
        });
    }

    try {
        const decoded = jwt.verify(token, jwtKey);

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


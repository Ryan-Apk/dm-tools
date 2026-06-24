import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { log, logError } from '../tools/consoleHandler.js';

dotenv.config();

const mongoHost = process.env.MONGO_HOST || 'localhost';
const mongoPort = process.env.MONGO_PORT || 27017;
const mongoDatabase = process.env.MONGO_DATABASE || 'testDB';
const mongoUsername = process.env.MONGO_USERNAME || 'admin';
const mongoPassword = process.env.MONGO_PASSWORD || 'change_me';

const mongoUri = `mongodb://${mongoUsername}:${mongoPassword}@${mongoHost}:${mongoPort}/${mongoDatabase}?authSource=admin`;

// Track if a manual reconnection attempt is already active
let isReconnecting = false;

/// NOTE:
/// One thing to note about this is that if the db fails, it will only try reconnecting every time someone
/// sends a request, this could be reworked so that it loops until it connects again but honestly I dont think
/// this is worth it for this scale

// Centralised connection function
async function connectToMongo() {
    if (isReconnecting) return;
    isReconnecting = true;

    log('Attempting to connect to MongoDB...');
    try {
        await mongoose.connect(mongoUri, {
            serverSelectionTimeoutMS: 2000, // Give it 2 seconds to look for the server
            connectTimeoutMS: 5000,
            bufferCommands: false
        });
        log('MongoDB connected successfully.');
    } catch (err) {
        logError('MongoDB connection attempt failed:', err.message);
    } finally {
        isReconnecting = false; // Reset flag so future requests can try again if still down
    }
}

// Global listeners for general connection monitoring
mongoose.connection.on('error', (err) => logError('MongoDB internal error:', err));
mongoose.connection.on('disconnected', () => logError('MongoDB disconnected!'));

// Initial startup connection
connectToMongo();

export default async function CheckDbStatus(req, res, next) {
if (process.env.NODE_ENV === 'dev') {
    log("Checking DB connection status...");
}

    const state = mongoose.connection.readyState;

    // If connected (1), proceed instantly
    if (state === 1) {
        return next();
    }

    // If state is 0 (disconnected), trigger reconnection in the background
    if (state === 0) {
        log('Database is offline. Triggering background reconnection...');

        // This fires the function in the background and moves to the next line immediately.
        connectToMongo();
    }

    // Inform the user immediately instead of making them hang
    logError(`Blocking request. MongoDB state is: ${state}`);
    return res.status(500).json({
        error: 'Database not connected. A reconnection attempt has been initiated, please try again shortly.'
    });
}

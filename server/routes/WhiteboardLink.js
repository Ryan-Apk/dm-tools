// this file contains a path for getting and setting whiteboard links that are stored in the db

import express from 'express';
import { log, logError } from '../tools/consoleHandler.js';
import validator from 'validator';
import { xss } from 'express-xss-sanitizer';
import { fetchRuntimeVarFromDB, saveRuntimeVarToDB } from '../tools/runtimeVars.js';

const router = express.Router();

// List available functions
router.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: 'Available endpoints: /login, /signup',
  });
});

// gets the link to a whiteboard
// TODO this should be generalised to allow for more links
router.get('/get', xss(), async (req, res) => {
  try {
    const value = await fetchRuntimeVarFromDB('playerWhiteboard');

    if (value) {
      return res.status(200).json({
        status: 'success',
        value,
      });
    }
  } catch (error) {
    // TODO should probably be handled more properly for prod
    return res.status(500).json({
      status: 'error',
      error: error.message,
    });
  }

  return res.status(404).json({
    status: 'error',
    error: 'Player Whiteboard not found.',
  });
});

// sets the link to the whiteboard, this should be xss proof from the global xss
// TODO i think this should probably be handled with wss
router.post('/set', async (req, res) => {
  // todo this should probably log the username of the user not just the ip
  log(`Request sent to whiteboard /set with data: ${JSON.stringify(req.body)} by ${req.ip}`);
  const link = req.body.link ? req.body.link.trim() : '';
  if (!link) {
    return res.status(400).json({ status: 'error', error: 'Body must include a link field!' });
  }

  const isValidUrl = validator.isURL(link, {
    protocols: ['http', 'https'],
    require_protocol: true,
  });

  if (!isValidUrl) {
    return res.status(400).json({
      status: 'error',
      error: 'Invalid link. Only fully qualified HTTP/HTTPS URLs are allowed.',
    });
  }

  try {
    await saveRuntimeVarToDB('playerWhiteboard', link);
    return res.status(200).json({ status: 'success' });
  } catch (error) {
    logError('Database error:', error.message);
    return res.status(500).json({ status: 'error', message: 'Internal server error.' });
  }
});

export default router;

import express from 'express';
import {log, logError, logWarn} from '../tools/consoleHandler.js';
import EffectsTable from '../models/EffectsTable.js';
import { xss } from 'express-xss-sanitizer';

const router = express.Router();

// make sure this is always an odd amount
// TODO replace this with a option selected by the user
const RANGE = 1;

// List available functions
router.get('/', (req, res) => {
  res.json({ status: 'success', message: 'Available endpoints: /table/:table/:id' });
});

router.get('/getall', async (req, res) => res.status(400).json({ status: 'error', message: 'Make sure you are in a campaign' }));

/* Returns the number of tables, and their names through the api */
router.get('/getall/:campaignId', async (req, res) => {

  if (!req.params){
    return res.status(401).json({
      status: 'error',
      message: 'Malformed request',
    });
  }

    // ask mongodb for all the table names
    const results = await EffectsTable.find({}).select(['name', 'description', 'numEntries', 'campaignIds']);  // format the table names and information

    const campaignIdParam = req.params.campaignId;
    const targetCampaignIds = campaignIdParam ? JSON.parse(req.params.campaignId) : [];

    // TODO add a check to see if there are no campaigns and return that
  if (!targetCampaignIds) {
    return res.status(400).json({
      status: 'error',
      message: 'Ensure you are in a campaign',
    })
  }

    const tables = [];

  for (const table of results) {
    const hasMatchingId = targetCampaignIds.some(id =>
      table.campaignIds.includes(id)
    );

    if (hasMatchingId) {
      const plainTable = table.toObject();

      tables.push(plainTable);
    }
  }

  // return it
    res.status(200).json({
      status: 'success',
      data: tables,
    })
  }
);

// looks up the requested table and the id (as well as surrounding 10 values)
router.get('/table/:table/:id', xss(), async (req, res) => {
  const tableName = req.params.table;
  const queryId = req.params.id;

  if (!Number.isInteger(Number(queryId)) || queryId.trim() === '') {
    logError(`User hit endpoint incorrectly: ${tableName} with id ${queryId}`);
    return res.status(400).json({ status: 'error', error: 'Usage: /table/[name]/[id] where [id] is a whole number.' });
  }

  try {
    const table = await EffectsTable.findOne({ name: tableName }).select('numEntries');

    // ensure the table exists
    if (!table) {
      logError(`User requested table that does not exist: ${tableName}`);
      return res.status(404).json({ status: 'error', error: 'Requested table not found.' });
    }

    // get the range
    const requestedId = Number(queryId) % table.numEntries;
    const start = Math.max(requestedId - RANGE, 0);
    const count = RANGE * 2 + 1;

    // get the table
    const updatedTable = await EffectsTable.findOneAndUpdate(
      { name: tableName },
      { $inc: { numRolls: 1 }, $set: { lastRolledAt: new Date() } },
      { returnDocument: 'after', projection: { entries: { $slice: [start, count] } } },
    );

    // todo perhaps remove?
    log(`Result rolled: ${queryId} on table ${tableName}`);

    return res.status(200).json({ status: 'success', data: updatedTable.entries });
  } catch (error) {
    logError(`Database for request threw a DB error: \n${error}`);
    return res.status(500).json({ status: 'error', error: 'An internal server error occurred.' });
  }
});

export default router;

import express from 'express';
import {log} from "../tools/consoleHandler.js";

const router = express.Router();

// List available functions
router.get('/', (req, res) => {
  res.json({ message: 'Available endpoints: ' });
});

// looks up the requested table and the id (as well as surrounding 10 values)
router.get('/table/:table/:id', (req, res) => {


  // check if the requested table exists

  // then get the range based on the id (wrapped around to the front)
  // return that result with a 200

  return res.status(200).json({ message: req.params });

});

export default router;

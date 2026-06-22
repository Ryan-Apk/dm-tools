import express from 'express';

const router = express.Router();

// List available functions
router.get('/', (req, res) => {
  res.json({ message: 'Available endpoints: ' });
});

router.get('/test/', (req, res) => {
  res.json({ message: 'Test router' });
});

export default router;

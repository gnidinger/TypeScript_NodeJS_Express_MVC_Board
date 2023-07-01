import express from 'express';
import { createFeed, getAllFeeds } from '../controllers/feedController';

const router = express.Router();

router.post('/feeds', createFeed);
router.get('/feeds', getAllFeeds);

export default router;

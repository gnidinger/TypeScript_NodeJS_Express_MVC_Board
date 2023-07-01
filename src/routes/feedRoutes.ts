import express from 'express';
import { createFeed, getAllFeeds } from '../controllers/feedController';

const router = express.Router();

router.post('/', createFeed);
router.get('/', getAllFeeds);

export default router;

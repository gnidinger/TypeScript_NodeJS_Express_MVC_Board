import express from 'express';
import { createFeed, getFeedByFeedSeq, getAllFeeds, updateFeed, deleteFeed } from '../controllers/feedController';

const router = express.Router();

router.post('/', createFeed);
router.get('/:feedSeq', getFeedByFeedSeq);
router.get('/', getAllFeeds);
router.patch('/:feedSeq', updateFeed);
router.delete('/:feedSeq', deleteFeed);

export default router;

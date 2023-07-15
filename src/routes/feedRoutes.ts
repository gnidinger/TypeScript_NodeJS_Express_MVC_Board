import express from 'express';
import { createFeed, getFeedByFeedSeq, getAllFeeds, updateFeed, deleteFeed } from '../controllers/feedController';
import clickLikeContent from '../controllers/likeController';
import { authMiddleware } from '../middleware/authentication';
import commentRouter from './commentRoutes';

const router = express.Router();

router.post('/', authMiddleware, createFeed);
router.get('/:feedSeq', getFeedByFeedSeq);
router.get('/', getAllFeeds);
router.patch('/:feedSeq/edit', authMiddleware, updateFeed);
router.delete('/:feedSeq/delete', authMiddleware, deleteFeed);

router.use('/:feedSeq/comments', commentRouter);

router.patch('/:likeObjectSeq/like', authMiddleware, clickLikeContent);

export default router;

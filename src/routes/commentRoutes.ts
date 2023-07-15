import express from 'express';
import { createComment, getCommentsByFeedSeq, updateComment, deleteComment } from '../controllers/commentController';
import clickLikeContent from '../controllers/likeController';
import { authMiddleware } from '../middleware/authentication';

const router = express.Router({ mergeParams: true });

router.post('/', authMiddleware, createComment);
router.get('/', getCommentsByFeedSeq);
router.patch('/:commentSeq/edit', authMiddleware, updateComment);
router.delete('/:commentSeq/delete', authMiddleware, deleteComment);

router.patch('/:likeObjectSeq/like', authMiddleware, clickLikeContent);

export default router;

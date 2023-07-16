import express from 'express';
import { createComment, getCommentsByFeedSeq, updateComment, deleteComment } from '../controllers/commentController';
import clickLikeContent from '../controllers/likeController';
import { authMiddleware } from '../middleware/authentication';
import { paginationMiddleware } from '../middleware/pagenation';

const router = express.Router({ mergeParams: true });

router.post('/post', authMiddleware, createComment);
router.get('/', paginationMiddleware, getCommentsByFeedSeq);
router.patch('/:commentSeq/edit', authMiddleware, updateComment);
router.delete('/:commentSeq/delete', authMiddleware, deleteComment);

router.patch('/:likeObjectSeq/like', authMiddleware, clickLikeContent);

export default router;

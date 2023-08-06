import express from 'express';
import { searchUser, searchFeed } from '../controllers/searchController';
import { paginationMiddleware } from '../middleware/pagenation';

const router = express.Router();

router.get('/users', paginationMiddleware, searchUser);
router.get('/feeds', paginationMiddleware, searchFeed);

export default router;

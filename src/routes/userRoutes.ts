import express from 'express';
import { registerUser, loginUser, getUserByUserSeq, updateUser, deleteUser } from '../controllers/userController';

const router = express.Router();

router.route('/').post(registerUser);
router.route('/login').post(loginUser);
router.route('/:userSeq').get(getUserByUserSeq);
router.route('/:userSeq').patch(updateUser);
router.route('/:userSeq').delete(deleteUser);

export default router;

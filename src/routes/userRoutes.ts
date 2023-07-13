import express from 'express';
import {
  registerUser,
  loginUser,
  getUserByUserSeq,
  updateUser,
  updateUserPassword,
  deleteUser,
} from '../controllers/userController';
import { authMiddleware } from '../middleware/authentication';
import passport from 'passport';
import '../config/passportConfig';

const router = express.Router();

router.route('/register').post(registerUser);
router.route('/login').post(loginUser);
router.route('/:userSeq').get(getUserByUserSeq);
router.route('/:userSeq/edit').patch(authMiddleware, updateUser);
router.route('/:userSeq/changePassword').patch(authMiddleware, updateUserPassword);
router.route('/:userSeq/delete').delete(authMiddleware, deleteUser);

router.get(
  '/auth/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false,
  })
);

router.get(
  '/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login', session: false }),
  (req, res) => {
    res.redirect('/');
  }
);

router.get(
  '/auth/kakao',
  passport.authenticate('kakao', {
    session: false,
  })
);

router.get(
  '/auth/kakao/callback',
  passport.authenticate('kakao', { failureRedirect: '/login', session: false }),
  (req, res) => {
    res.redirect('/');
  }
);

router.get(
  '/auth/naver',
  passport.authenticate('naver', {
    session: false,
  })
);

router.get(
  '/auth/naver/callback',
  passport.authenticate('naver', { failureRedirect: '/login', session: false }),
  (req, res) => {
    res.redirect('/');
  }
);

export default router;

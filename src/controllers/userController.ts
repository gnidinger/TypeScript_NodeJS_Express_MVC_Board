import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import User from '../models/User';
import generateToken from '../utils/generateToken';

const registerUser = asyncHandler(async (req: Request, res: Response) => {
  const { id, password, name } = req.body;

  const userExists = await User.findOne({ id });

  if (userExists) {
    res.status(400);
    throw new Error('이미 존재하는 ID 입니다.');
  }

  const newUser = new User({ id, password, name });
  const savedUser = await newUser.save();

  if (savedUser) {
    res.status(200).json({
      userSeq: savedUser.userSeq,
      id: savedUser.id,
      name: savedUser.name,
      token: generateToken(savedUser.userSeq, savedUser.name),
    });
  } else {
    res.status(400).send('잘못된 사용자 데이터 입니다.');
  }
});

const loginUser = asyncHandler(async (req: Request, res: Response) => {
  const { id, password } = req.body;

  const user = await User.findOne({ id });

  if (user && (await user.matchPassword(password))) {
    res.status(200).json({
      userSeq: user.userSeq,
      id: user.id,
      name: user.name,
      token: generateToken(user.userSeq, user.name),
    });
  } else {
    res.status(401);
    throw new Error('이메일 혹은 비밀번호를 잘못 입력하셨습니다.');
  }
});

export { registerUser, loginUser };

import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import User from '../models/User';
import generateToken from '../utils/generateToken';
import sendErrorResponse from '../utils/sendErrorResponse';

const registerUser = asyncHandler(async (req: Request, res: Response) => {
  const { id, password, name } = req.body;

  const userExists = await User.findOne({ id });

  if (userExists) {
    sendErrorResponse(res, 400, '이미 존재하는 ID 입니다.');
    return;
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
    sendErrorResponse(res, 400, '잘못된 사용자 데이터 입니다.');
    return;
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
    sendErrorResponse(res, 401, '이메일 혹은 비밀번호를 잘못 입력하셨습니다.');
    return;
  }
});

export { registerUser, loginUser };

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

const getUserByUserSeq = asyncHandler(async (req: Request, res: Response) => {
  const userSeq = req.params.userSeq;
  const user = await User.findOne({ userSeq: userSeq });

  if (!user) {
    sendErrorResponse(res, 404, `${userSeq} 시퀀스에 해당하는 사용자가 없습니다.`);
    return;
  }

  res.status(200).json(user);
});

const updateUser = asyncHandler(async (req: Request, res: Response) => {
  const authUserSeq = res.locals.user.userSeq;

  const userSeq = Number(req.params.userSeq);

  const user = await User.findOne({ userSeq: userSeq });

  if (!user) {
    sendErrorResponse(res, 404, `${userSeq} 시퀀스에 해당하는 사용자가 없습니다.`);
    return;
  }

  if (user.userSeq !== authUserSeq) {
    sendErrorResponse(res, 401, 'Unauthorized');
    return;
  }

  user.name = req.body.user;

  const updatedUser = await user.save();
  res.status(200).json(updatedUser);
});

const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  const authUserSeq = res.locals.user.userSeq;

  const userSeq = Number(req.params.userSeq);

  const user = await User.findOne({ userSeq: userSeq });

  if (!user) {
    sendErrorResponse(res, 404, `${userSeq} 시퀀스에 해당하는 사용자가 없습니다.`);
    return;
  }

  if (user.userSeq !== authUserSeq) {
    sendErrorResponse(res, 401, 'Unauthorized');
    return;
  }

  await User.deleteOne({ userSeq: authUserSeq });
  res.status(200).json({ message: '탈퇴 완료' });
});

export { registerUser, loginUser, getUserByUserSeq, updateUser, deleteUser };

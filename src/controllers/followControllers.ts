import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import User from '../models/User';
import sendErrorResponse from '../utils/sendErrorResponse';

const toggleFollow = asyncHandler(async (req: Request, res: Response) => {
  const authUserSeq = res.locals.user.userSeq;
  const targetUserSeq = Number(req.params.userSeq);

  const authUser = await User.findOne({ userSeq: authUserSeq });
  const targetUser = await User.findOne({ userSeq: targetUserSeq });

  if (!targetUser) {
    sendErrorResponse(res, 404, `${targetUserSeq} 시퀀스에 해당하는 사용자가 없습니다.`);
    return;
  }

  if (authUser!.following.includes(targetUserSeq)) {
    authUser!.following = authUser!.following.filter((follow: number) => follow !== targetUserSeq);
    targetUser!.followers = targetUser!.followers.filter((followers: number) => followers !== authUserSeq);

    await authUser!.save();
    await targetUser!.save();

    res.status(200).json({ message: '언팔로우 완료' });
  } else {
    authUser!.following.push(targetUserSeq);
    targetUser!.followers.push(authUserSeq);

    await authUser!.save();
    await targetUser!.save();

    res.status(200).json({ message: '팔로우 완료' });
  }
});

export { toggleFollow };

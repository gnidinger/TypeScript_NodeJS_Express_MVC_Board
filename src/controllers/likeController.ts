import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import User from '../models/User';
import Like from '../models/Like';
import Feed from '../models/Feed';
import Comment from '../models/Comment';
import sendErrorResponse from '../utils/sendErrorResponse';

const clickLikeContent = asyncHandler(async (req: Request, res: Response) => {
  const userSeq = res.locals.user.userSeq;
  const likeObjectSeq = req.params.likeObjectSeq;
  const likeType = req.body.likeType;

  const user = await User.findOne({ userSeq: userSeq });

  let content;

  if (likeType === 'Feed') {
    content = await Feed.findOne({ feedSeq: likeObjectSeq });
  } else if (likeType === 'Comment') {
    content = await Comment.findOne({ commentSeq: likeObjectSeq });
  }

  if (!content) {
    sendErrorResponse(res, 404, `${likeObjectSeq}를 가진 ${likeType}가 없습니다.`);
  }

  const existingLike = await Like.findOne({ user: user!._id, likeId: content!._id, likeType: likeType });

  if (existingLike) {
    await existingLike.deleteOne({ _id: existingLike._id });
    res.status(200).json({ message: '좋아요 취소가 완료되었습니다.' });
  } else {
    const newLike = new Like({ user: user!._id, likeId: content!._id, likeType: likeType });
    const savedLike = await newLike.save();
    res.status(201).json(savedLike);
  }
});

export default clickLikeContent;

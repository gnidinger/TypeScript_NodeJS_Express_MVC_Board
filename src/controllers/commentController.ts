import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import User from '../models/User';
import Feed from '../models/Feed';
import Comment from '../models/Comment';
import sendErrorResponse from '../utils/sendErrorResponse';

const createComment = asyncHandler(async (req: Request, res: Response) => {
  const userSeq = res.locals.user.userSeq;
  const feedSeq = Number(req.params.feedSeq);

  const user = await User.findOne({ userSeq: userSeq });
  const feed = await Feed.findOne({ feedSeq: feedSeq });

  if (!feed) {
    sendErrorResponse(res, 404, `${feedSeq} 시퀀스에 해당하는 피드가 없습니다.`);
    return;
  }

  const newComment = new Comment({ ...req.body, user: user!._id, feed: feed._id, userSeq: userSeq, feedSeq: feedSeq });
  const savedComment = await newComment.save();

  feed.comments.push(savedComment._id);
  await feed.save();

  res.status(201).json(savedComment);
});

const getCommentsByFeedSeq = asyncHandler(async (req: Request, res: Response) => {
  const feedSeq = Number(req.params.feedSeq);

  const comments = await Comment.find({ feedSeq: feedSeq });

  if (!comments) {
    res.status(204).json(comments);
    return;
  }

  res.status(200).json(comments);
});

const updateComment = asyncHandler(async (req: Request, res: Response) => {
  const userSeq = res.locals.user.userSeq;
  const commentSeq = Number(req.params.commentSeq);

  const comment = await Comment.findOne({ commentSeq: commentSeq });

  if (!comment) {
    sendErrorResponse(res, 404, `${commentSeq} 시퀀스에 해당하는 코멘트가 없습니다.`);
    return;
  }

  if (comment.userSeq !== userSeq) {
    sendErrorResponse(res, 401, 'Unauthorized');
    return;
  }

  comment.content = req.body.content;

  const updatedComment = await comment.save();
  res.status(200).json(updatedComment);
});

const deleteComment = asyncHandler(async (req: Request, res: Response) => {
  const userSeq = res.locals.user.userSeq;
  const commentSeq = Number(req.params.commentSeq);

  const comment = await Comment.findOne({ commentSeq: commentSeq });

  if (!comment) {
    sendErrorResponse(res, 404, `${commentSeq} 시퀀스에 해당하는 코멘트가 없습니다.`);
    return;
  }

  if (comment.userSeq !== userSeq) {
    sendErrorResponse(res, 401, 'Unauthorized');
    return;
  }

  const feed = await Feed.findById(comment.feed);
  if (feed) {
    const index = feed.comments.indexOf(comment._id);
    if (index > -1) {
      feed.comments.splice(index, 1);
      await feed.save();
    }
  }

  await Comment.deleteOne({ commentSeq: commentSeq });
  res.status(200).json({ message: '삭제 완료' });
});

export { createComment, getCommentsByFeedSeq, updateComment, deleteComment };

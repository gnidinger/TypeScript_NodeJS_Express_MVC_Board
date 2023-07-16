import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import User from '../models/User';
import Feed from '../models/Feed';
import Comment from '../models/Comment';
import { PaginatedRequest } from '../interface/PagenatedRequest';
import sendErrorResponse from '../utils/sendErrorResponse';

const createFeed = asyncHandler(async (req: Request, res: Response) => {
  const userSeq = res.locals.user.userSeq;

  const user = await User.findOne({ userSeq: userSeq });

  const newFeed = new Feed({ ...req.body, user: user!._id, userSeq: userSeq });

  const savedFeed = await newFeed.save();
  res.status(201).json(savedFeed);
});

const getFeedByFeedSeq = asyncHandler(async (req: Request, res: Response) => {
  const feedSeq = req.params.feedSeq;
  const feed = await Feed.findOne({ feedSeq: feedSeq }).populate('comments');

  if (!feed) {
    sendErrorResponse(res, 404, `${feedSeq} 시퀀스에 해당하는 피드가 없습니다.`);
    return;
  }

  const commentsCount = feed.comments.length;

  res.status(200).json({ ...feed.toJSON(), commentsCount });
});

const getAllFeeds = asyncHandler(async (req: PaginatedRequest, res: Response) => {
  const page = parseInt(req.query.page || '1', 10);
  const limit = parseInt(req.query.limit || '10', 10);
  const skip = (page - 1) * limit;

  const total = await Feed.countDocuments();
  const feeds = await Feed.find({}).sort({ createdAt: -1 }).skip(skip).populate('comments');
  const feedsWithCommentsCount = feeds.map((feed) => {
    const commentsCount = feed.comments.length;
    return { ...feed.toObject(), commentsCount };
  });

  const isLastPage = page * limit >= total;
  const currentPageDocumentCount = feeds.length;

  res.json({
    total,
    pages: Math.ceil(total / limit),
    isLastPage,
    currentPageDocumentCount,
    feedsWithCommentsCount,
  });
});

const updateFeed = asyncHandler(async (req: Request, res: Response) => {
  const userSeq = res.locals.user.userSeq;

  const feedSeq = Number(req.params.feedSeq);
  const feed = await Feed.findOne({ feedSeq: feedSeq });

  if (!feed) {
    sendErrorResponse(res, 404, `${feedSeq} 시퀀스에 해당하는 피드가 없습니다.`);
    return;
  }

  if (feed.userSeq !== userSeq) {
    sendErrorResponse(res, 401, 'Unauthorized');
    return;
  }

  feed.title = req.body.title;
  feed.content = req.body.content;

  const updatedFeed = await feed.save();
  res.status(200).json(updatedFeed);
});

const deleteFeed = asyncHandler(async (req: Request, res: Response) => {
  const userSeq = res.locals.user.userSeq;

  const feedSeq = Number(req.params.feedSeq);
  const feed = await Feed.findOne({ feedSeq: feedSeq });

  if (!feed) {
    sendErrorResponse(res, 404, `${feedSeq} 시퀀스에 해당하는 피드가 없습니다.`);
    return;
  }

  if (feed.userSeq !== userSeq) {
    sendErrorResponse(res, 401, 'Unauthorized');
    return;
  }

  await Comment.deleteMany({ feed: feed._id });
  await Feed.deleteOne({ feedSeq: feedSeq });
  res.status(200).json({ message: '삭제 완료' });
});

export { createFeed, getFeedByFeedSeq, getAllFeeds, updateFeed, deleteFeed };

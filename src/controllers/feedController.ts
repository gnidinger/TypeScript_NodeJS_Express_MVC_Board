import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import Feed from '../models/Feed';
import sendErrorResponse from '../utils/sendErrorResponse';

const createFeed = asyncHandler(async (req: Request, res: Response) => {
  const userSeq = res.locals.user.userSeq;

  const newFeed = new Feed({ ...req.body, userSeq: userSeq });

  const savedFeed = await newFeed.save();
  res.json(savedFeed);
});

const getFeedByFeedSeq = asyncHandler(async (req: Request, res: Response) => {
  const feedSeq = req.params.feedSeq;
  const feed = await Feed.findOne({ feedSeq: feedSeq });

  if (!feed) {
    sendErrorResponse(res, 404, `${feedSeq} 시퀀스에 해당하는 피드가 없습니다.`);
    return;
  }

  res.status(200).json(feed);
});

const getAllFeeds = asyncHandler(async (req: Request, res: Response) => {
  const feeds = await Feed.find({});
  res.json(feeds);
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
  feed.body = req.body.body;

  const updatedFeed = await feed.save();
  res.json(updatedFeed);
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

  await Feed.deleteOne({ feedSeq: feedSeq });
  res.status(200).json({ message: '삭제 완료' });
});

export { createFeed, getFeedByFeedSeq, getAllFeeds, updateFeed, deleteFeed };

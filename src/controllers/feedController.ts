import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import Feed from '../models/Feed';

const createFeed = asyncHandler(async (req: Request, res: Response) => {
  const newFeed = new Feed(req.body);
  const savedFeed = await newFeed.save();
  res.json(savedFeed);
});

const getFeedByFeedSeq = asyncHandler(async (req: Request, res: Response) => {
  const feedSeq = req.query.feedSeq;
  const feed = await Feed.findOne({ feedSeq: feedSeq });
  if (feed) {
    res.json(feed);
  } else {
    res.status(404).json({ error: `${feedSeq} 시퀀스에 해당하는 피드가 없습니다.` });
    return;
  }
});

const getAllFeeds = asyncHandler(async (req: Request, res: Response) => {
  const feeds = await Feed.find({});
  res.json(feeds);
});

const updateFeed = asyncHandler(async (req: Request, res: Response) => {
  const feedSeq = Number(req.params.feedSeq);
  const feed = await Feed.findOne({ feedSeq: feedSeq });

  if (feed) {
    feed.title = req.body.title;
    feed.body = req.body.body;

    const updatedFeed = await feed.save();
    res.json(updatedFeed);
  } else {
    res.status(404).json({ error: `${feedSeq} 시퀀스에 해당하는 피드가 없습니다.` });
    return;
  }
});

const deleteFeed = asyncHandler(async (req: Request, res: Response) => {
  const feedSeq = Number(req.params.feedSeq);
  const feed = await Feed.findOne({ feedSeq: feedSeq });

  if (feed) {
    await Feed.deleteOne({ feedSeq: feedSeq });
    res.status(200).json({ message: '삭제 완료' });
  } else {
    res.status(404).json({ error: `${feedSeq} 시퀀스에 해당하는 피드가 없습니다.` });
    return;
  }
});

export { createFeed, getFeedByFeedSeq, getAllFeeds, updateFeed, deleteFeed };

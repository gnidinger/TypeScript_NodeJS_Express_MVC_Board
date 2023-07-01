import { Request, Response } from 'express';
import Feed from '../models/Feed';

const createFeed = async (req: Request, res: Response) => {
  const newFeed = new Feed(req.body);
  const savedFeed = await newFeed.save();
  res.json(savedFeed);
};

const getAllFeeds = async (req: Request, res: Response) => {
  const feeds = await Feed.find({});
  res.json(feeds);
};

export { createFeed, getAllFeeds };

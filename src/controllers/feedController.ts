import { Request, Response } from 'express';
import feed from '../models/Feed';

const createFeed = async (req: Request, res: Response) => {
  const newFeed = new feed(req.body);
  const savedFeed = await newFeed.save();
  res.json(savedFeed);
};

const getAllFeeds = async (req: Request, res: Response) => {
  const feeds = await feed.find({});
  res.json(feeds);
};

export { createFeed, getAllFeeds };

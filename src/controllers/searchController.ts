import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import User from '../models/User';
import Feed from '../models/Feed';
import sendErrorResponse from '../utils/sendErrorResponse';
import { PaginatedRequest } from '../interface/PagenatedRequest';

interface SearchRequest extends PaginatedRequest {
  query: {
    page?: string;
    limit?: string;
    query?: string; // 검색 쿼리를 위한 추가 필드
  };
}

const searchUser = asyncHandler(async (req: SearchRequest, res: Response) => {
  const page = parseInt(req.query.page || '1', 10);
  const limit = parseInt(req.query.limit || '10', 10);
  const skip = (page - 1) * limit;
  const query = (req.query.query as string) || '';

  const searchCondition = {
    $or: [{ id: new RegExp(query, 'i') }, { name: new RegExp(query, 'i') }],
  };

  const total = await User.countDocuments(searchCondition);
  const users = await User.find(searchCondition).select('id name following followers').skip(skip).limit(limit);

  const usersWithCounts = users.map((user) => ({
    id: user.id,
    name: user.name,
    followingCount: user.following.length,
    followerCount: user.followers.length,
  }));

  const isLastPage = page * limit >= total;
  const currentPageDocumentCount = users.length;

  res.json({
    total,
    pages: Math.ceil(total / limit),
    currentPage: page,
    isLastPage,
    currentPageDocumentCount,
    usersWithCounts,
  });
});

const searchFeed = asyncHandler(async (req: SearchRequest, res: Response) => {
  const page = parseInt(req.query.page || '1', 10);
  const limit = parseInt(req.query.limit || '10', 10);
  const skip = (page - 1) * limit;
  const query = req.query.query || '';

  const usersWithName = await User.find({ name: new RegExp(query, 'i') });
  const userSeqs = usersWithName.map((user) => user.userSeq);

  const searchCondition = {
    $or: [{ title: new RegExp(query, 'i') }, { content: new RegExp(query, 'i') }, { userSeq: { $in: userSeqs } }],
  };

  const total = await Feed.countDocuments(searchCondition);
  const feeds = await Feed.find(searchCondition)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('user', 'name');

  const isLastPage = page * limit >= total;

  res.json({
    total,
    pages: Math.ceil(total / limit),
    currentPage: page,
    isLastPage,
    feeds,
  });
});

export { searchUser, searchFeed };

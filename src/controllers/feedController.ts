import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import User from '../models/User';
import Feed from '../models/Feed';
import Comment from '../models/Comment';
import sendErrorResponse from '../utils/sendErrorResponse';
import { PaginatedRequest } from '../interface/PagenatedRequest';
import { resizeAndUploadToS3, deleteFromS3 } from '../utils/imageUtils';

const createFeed = asyncHandler(async (req: Request, res: Response) => {
  const userSeq = res.locals.user.userSeq;
  const user = await User.findOne({ userSeq: userSeq });

  if (req.file) {
    try {
      const { resizedImageUrl, thumbnailImageUrl } = await resizeAndUploadToS3(req.file);

      const newFeed = new Feed({
        ...req.body,
        user: user!._id,
        userSeq: userSeq,
        imageUrl: resizedImageUrl,
        thumbnailUrl: thumbnailImageUrl,
      });
      const savedFeed = await newFeed.save();

      res.status(201).json(savedFeed);
    } catch (error) {
      sendErrorResponse(res, 500, '이미지 업로드가 실패했습니다.');
      return;
    }
  } else {
    const newFeed = new Feed({ ...req.body, user: user!._id, userSeq: userSeq });
    const savedFeed = await newFeed.save();

    res.status(201).json(savedFeed);
  }
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
  const feeds = await Feed.find({}).sort({ createdAt: -1 }).skip(skip).limit(limit).populate('comments');
  const feedsWithCommentsCount = feeds.map((feed) => {
    const commentsCount = feed.comments.length;
    return { ...feed.toObject(), commentsCount };
  });

  const isLastPage = page * limit >= total;
  const currentPageDocumentCount = feeds.length;

  res.json({
    total,
    pages: Math.ceil(total / limit),
    curruentPage: page,
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

  if (req.file) {
    try {
      const { resizedImageUrl, thumbnailImageUrl } = await resizeAndUploadToS3(req.file);

      if (feed.imageUrl) {
        await deleteFromS3(feed.imageUrl);
      }
      if (feed.thumbnailUrl) {
        await deleteFromS3(feed.thumbnailUrl);
      }

      feed.imageUrl = resizedImageUrl;
      feed.thumbnailUrl = thumbnailImageUrl;
    } catch (error) {
      sendErrorResponse(res, 500, '이미지 업로드가 실패했습니다.');
      return;
    }
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

  if (feed.imageUrl) {
    try {
      await deleteFromS3(feed.imageUrl);
    } catch (error) {
      sendErrorResponse(res, 500, '이미지 삭제에 실패했습니다.');
      return;
    }
  }

  if (feed.thumbnailUrl) {
    try {
      await deleteFromS3(feed.thumbnailUrl);
    } catch (error) {
      sendErrorResponse(res, 500, '썸네일 삭제에 실패했습니다.');
      return;
    }
  }

  await Comment.deleteMany({ feed: feed._id });
  await Feed.deleteOne({ feedSeq: feedSeq });
  res.status(200).json({ message: '삭제 완료' });
});

export { createFeed, getFeedByFeedSeq, getAllFeeds, updateFeed, deleteFeed };

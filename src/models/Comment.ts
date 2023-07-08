import mongoose, { Schema, Document } from 'mongoose';
import { autoIncrement } from '../middleware/autoIncrement';

interface IComment extends Document {
  user: Schema.Types.ObjectId;
  feed: Schema.Types.ObjectId;
  userSeq: number;
  feedSeq: number;
  commentSeq: number;
  content: string;
}

const commentSchema: Schema<IComment> = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    feed: {
      type: Schema.Types.ObjectId,
      ref: 'Feed',
    },
    userSeq: { type: Number, required: true },
    feedSeq: { type: Number, required: true },
    commentSeq: { type: Number, unique: true, required: true, default: 1 },
    content: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

commentSchema.pre('save', autoIncrement('commentSeq'));

const Comment = mongoose.model<IComment>('Comment', commentSchema);

export default Comment;

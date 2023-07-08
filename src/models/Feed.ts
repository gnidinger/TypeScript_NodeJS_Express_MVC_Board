import mongoose, { Schema, Document } from 'mongoose';
import { autoIncrement } from '../middleware/autoIncrement';

interface IFeed extends Document {
  user: Schema.Types.ObjectId;
  userSeq: number;
  feedSeq: number;
  title: string;
  content: string;
}

const feedSchema: Schema<IFeed> = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    userSeq: { type: Number, required: true },
    feedSeq: { type: Number, unique: true, required: true, default: 1 },
    title: { type: String, required: true },
    content: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

feedSchema.pre('save', autoIncrement('feedSeq'));

const Feed = mongoose.model<IFeed>('Feed', feedSchema);

export default Feed;

import mongoose, { Schema, Document } from 'mongoose';
import { autoIncrement } from '../middleware/autoIncrement';

interface IFeed extends Document {
  feedSeq: number;
  userSeq: number;
  title: string;
  body: string;
}

const feedSchema: Schema<IFeed> = new Schema(
  {
    feedSeq: { type: Number, unique: true, required: true, default: 1 },
    userSeq: { type: Number },
    title: { type: String, required: true },
    body: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

feedSchema.pre('save', autoIncrement('feedSeq'));

const Feed = mongoose.model<IFeed>('Feed', feedSchema);

export default Feed;

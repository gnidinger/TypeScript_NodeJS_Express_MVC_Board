import mongoose, { Schema, Document } from 'mongoose';

interface ILike extends Document {
  user: Schema.Types.ObjectId;
  userSeq: number;
  likeId: Schema.Types.ObjectId;
  likeType: string;
}

const likeSchema: Schema<ILike> = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    userSeq: { type: Number, required: true },
    likeId: { type: Schema.Types.ObjectId, required: true },
    likeType: { type: String, enum: ['Feed', 'Comment'], required: true },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<ILike>('Like', likeSchema);

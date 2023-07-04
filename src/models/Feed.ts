import mongoose, { Schema, Document, Model } from 'mongoose';

interface IFeed extends Document {
  feedSeq: number;
  title: string;
  body: string;
}

const feedSchema: Schema<IFeed> = new Schema(
  {
    feedSeq: { type: Number, unique: true, required: true, default: 1 },
    title: { type: String, required: true },
    body: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

feedSchema.pre('save', async function (next) {
  if (this.isNew) {
    const FeedModel = this.constructor as Model<IFeed>;
    const lastFeed = await FeedModel.findOne({}, {}, { sort: { feedSeq: -1 } });
    if (lastFeed) {
      this.feedSeq = lastFeed.feedSeq + 1;
    }
  }
  next();
});

const Feed = mongoose.model('Feed', feedSchema);

export default Feed;

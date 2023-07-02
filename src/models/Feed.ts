import mongoose, { Schema, Document, Model } from 'mongoose';

interface IFeed extends Document {
  seq: number;
  title: string;
  body: string;
}

const feedSchema: Schema<IFeed> = new Schema({
  seq: { type: Number, unique: true, required: true, default: 1 },
  title: { type: String, required: true },
  body: { type: String, required: true },
});

feedSchema.pre('save', async function (next) {
  if (this.isNew) {
    const FeedModel = this.constructor as Model<IFeed>;
    const lastFeed = await FeedModel.findOne({}, {}, { sort: { seq: -1 } });
    if (lastFeed) {
      this.seq = lastFeed.seq + 1;
    }
  }
  next();
});

const Feed = mongoose.model('Feed', feedSchema);

export default Feed;

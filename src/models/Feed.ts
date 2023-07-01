import mongoose from 'mongoose';

const feedSchema = new mongoose.Schema({
  title: { type: String, required: true },
  body: { type: String, required: true },
});

const Feed = mongoose.model('Feed', feedSchema);

export default Feed;

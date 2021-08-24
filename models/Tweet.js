const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TweetSchema = new Schema({
    email: String,
    tweet_content: String,
    tweet_content_img: String,
    tweet_likes: Number,
    hash_tags: [String],
    parent_id: String,
    share_count: Number,
    email: String,
    time : { type : Date, default: Date.now }
})

const Tweet = mongoose.model('Tweet', TweetSchema);


module.exports = Tweet;
// User.findOneAndUpdate({tweet_id: "12345"}, { $inc: { likes: 1 }})
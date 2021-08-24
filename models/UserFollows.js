const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserFollowsSchema = new Schema({
    email: String,
    hash_tags: [String],
    user_follow_email_ids: [String]
})

const UserFollows = mongoose.model('UserFollow', UserFollowsSchema);


module.exports = UserFollows;
// User.findOneAndUpdate({tweet_id: "12345"}, { $inc: { likes: 1 }})
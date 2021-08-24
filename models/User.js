const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    username: String,
    email: String,
    password: String,
    photo: String
})

const User = mongoose.model('User', UserSchema);


module.exports = User;
// User.findOneAndUpdate({tweet_id: "12345"}, { $inc: { likes: 1 }})

//db.users.find({email: ""})
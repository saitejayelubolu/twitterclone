const mongoose = require("mongoose");
const Tweet = require("./Tweet");
const Schema = mongoose.Schema;

const MyActivitySchema = new Schema({
    action: String,
    tweet_id: String,
    email: String,
    time: { type : Date, default: Date.now }
    
})

const MyActivity = mongoose.model('MyActivity', MyActivitySchema);

module.exports = MyActivity;
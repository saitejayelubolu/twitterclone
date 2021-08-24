require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true, 
    useUnifiedTopology: true
}).then(() => {
    console.log("DB Connected");
}).catch((err) => console.log(err));

mongoose.connection.on('connected', () => {
    console.log('mongoose connected to db...');
})
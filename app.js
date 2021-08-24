//connection of mongo Database
require('./config/db');

const app = require('express')();
const dotenv = require('dotenv').config();
console.log(dotenv.parsed);

const UserRouter = require('./api/User');

//for accepting post from data
const bodyParser = require('express').json;
app.use(bodyParser());

app.use('/user', UserRouter)

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
    console.log('Server running on port' + PORT + '...');
})
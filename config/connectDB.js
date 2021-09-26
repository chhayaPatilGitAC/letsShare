const dotenv  = require('dotenv');
const mongoose = require('mongoose');
dotenv.config({path:__dirname + '/.env'})

const connectDB = () => {
    mongoose.connect(process.env.MONGOOSE_CONNECTION_URL, { useNewUrlParser: true, useUnifiedTopology:true });
    const connection = mongoose.connection;
    connection.once('open', () => {
        console.log('connected to database')
    }).on('error', function (err) {
        console.log(`Error while connecting to db : ${err}`);
    });
}

module.exports = connectDB;
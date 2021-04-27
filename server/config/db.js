const mongoose = require('mongoose');
const config = require('config');

const connectDB = async() => {
    try{
        await mongoose.connect(config.get('mongoURI'), {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex : true,
            useFindAndModify: false
        });
        console.log('[INFO] Database connection ...[OK]');
    }catch(err){
        console.error('[ERROR] Database connection failed ...[x]');
        console.log(err.message);
        process.exit(1);
    }
};

module.exports = connectDB;
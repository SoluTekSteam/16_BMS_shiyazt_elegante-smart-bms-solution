const mongoose = require('mongoose');

// Unix Timestamp in seconds
const ts = () =>  Math.floor(Date.now()/1000);

const schemaOptions = {
    timestamps : { createdAt: 'created_at' }
}
/* User Roles : 
    superuser : Super User
    admin : Administrator
    user : Customer
*/

const UserSchema = new mongoose.Schema({
    email : {
        type : String,
        required : true
    },
    password : {
        type : String,
        required : true
    },
    role : {
        type : String,
        default: 'user',
        enum: ['superuser', 'admin', 'user']
    },
    firstname : {
        type : String,
        required : true
    },
    midname : {
        type : String
    },
    lastname : {
        type : String,
        required : true
    },
    ts : {
        type : Number,
        default : ts()
    },
    active : {
        type : Boolean,
        required : true
    },
    log : [
        {
            msg : {
                type : String,
            },
            ts : {
                type : Number,
                default : ts()
            }
        }
    ]

}, schemaOptions);

module.exports = User = mongoose.model('user', UserSchema);
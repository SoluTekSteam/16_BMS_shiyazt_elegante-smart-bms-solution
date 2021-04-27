const mongoose = require('mongoose');

// Unix Timestamp in seconds
const ts = () =>  Math.floor(Date.now()/1000);

const schemaOptions = {
    timestamps : { createdAt: 'created_at' }
}


const FloorSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    buildingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'building',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    floorNo: {
        type: Number,
        required: true
    },
    description: {
        type: String
    },
    address: {
        type: String
    },
    image: {
        type: String
    },
    latitude: {
        type: String
    },
    longitude: {
        type: String
    },
    contact: {
        type: String
    },
    ts : {
        type: Number,
        default: ts()
    },
    logs: [
        {
            ts: {
                type: Number,
                default: ts()
            },
            msg: {
                type: String
            }
        }
    ]
}, schemaOptions);

module.exports = Floor = mongoose.model('floor', FloorSchema);
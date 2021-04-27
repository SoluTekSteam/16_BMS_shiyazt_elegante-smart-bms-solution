const mongoose = require('mongoose');

// Unix Timestamp in seconds
const ts = () =>  Math.floor(Date.now()/1000);

const schemaOptions = {
    timestamps : { createdAt: 'created_at' }
}


// UUID Generator
const generateUUID = (len) => {
    var arr = 'ABCDEFGHIJKLabcdefghijklmnopqrstuvwxyz0123456789MNOPQRST';
    var ans = '';
    for(var i= len; i > 0; i--){
        ans += arr[Math.floor(Math.random() * arr.length)];
    }
    return ans;
}

const DeviceSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    buildingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'building'
    },
    floorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'floor'
    },
    deviceName: {
        type: String,
        required: true
    },
    deviceLabel: {
        type: String
    },
    deviceType: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    isGateway: {
        type: Boolean,
        default: false
    },
    key: {
        type: String,
        default: generateUUID(20) 
    },
    token: {
        type: String,
        default: generateUUID(12) 
    },
    metadata: {
        type: Object,
        default: {}
    },
    telemetry: {
        type: Object,
        default: {}
    },
    relations: [
        {
            level: {
                type: String,
                default: "to",
                enum: ['from', 'to']
            },
            spaceId: {
                type: mongoose.Schema.Types.ObjectId
            }
        }
    ],
    xPos: {
        type: Number
    },
    yPos: {
        type: Number
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

module.exports = Device = mongoose.model('device', DeviceSchema);
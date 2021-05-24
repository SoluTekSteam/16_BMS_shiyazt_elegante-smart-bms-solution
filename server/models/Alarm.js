const mongoose = require('mongoose');

// Unix Timestamp in seconds
const ts = () =>  Math.floor(Date.now()/1000);


const AlarmSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    originator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'device',
        required: true
    },
    floorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'floor',
        required: true
    },
    buildingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'building',
        required: true
    },
    severity: {
        type: String,
        enum: [ 'critical', 'warning', 'major', 'minor', 'intermediate' ],
        required: true
    },
    status: {
        type: String,
        enum: [ 'active acknowledged', 'active unacknowledged', 'cleared acknowledged', 'cleared unacknowledged' ],
        default: 'active acknowledged',
        required: true
    },
    createdTime: {
        type: Number,
        required: true
    },
    clearedTime: {
        type: Number,
        required: true
    },
    active: {
        type: Boolean,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    msg: {
        type: String,
        required: true
    },
    logs: {
        type: Array,
        default: []
    },
    ts : {
        type: Number,
        default: ts()
    }
});


module.exports = Alarm = mongoose.model('alarms', AlarmSchema, 'alarms');
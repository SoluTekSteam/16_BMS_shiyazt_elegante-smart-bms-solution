const mongoose = require('mongoose');

// Unix Timestamp in seconds
const ts = () =>  Math.floor(Date.now()/1000);


const TelemetrySchema = new mongoose.Schema({
    deviceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'device',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    telemetry: {
        type: Object,
        default: {}
    },
    ts : {
        type: Number,
        default: ts()
    }
});


module.exports = Telemetry = mongoose.model('telemetry', TelemetrySchema, 'telemetry');
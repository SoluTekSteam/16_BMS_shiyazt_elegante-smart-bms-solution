const {validationResult} = require('express-validator');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


//Models
const Device = require('../models/Device');
const Building = require('../models/Building');
const Floor = require('../models/Floor');
const Telemetry = require('../models/Telemetry');
const Alarm = require('../models/Alarm');


exports.addDevice = async(req, res) => {
    console.log('POST /api/elegante/v1/device');
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({ errors : errors.array()});
    }
    try{
        let query = Building.findById(req.body.buildingId);
        if (!query){
            return res.status(400).json({ error: 'Invalid Request' })
        }
        query = Floor.findById(req.body.floorId);
        if (!query){
            return res.status(400).json({ error: 'Invalid Request' })
        }
        const { deviceName, buildingId, floorId, deviceLabel, deviceType, isGateway, xPos, yPos } = req.body;
        var newDevice = Device({
            userId: req.user.id,
            deviceName,
            buildingId,
            floorId,
            deviceLabel,
            deviceType,
            isGateway,
            metadata: {},
            telemetry: {},
            logs: [{
                ts: Math.floor(Date.now()/1000),
                msg: 'Device added'
            }],
            xPos,
            yPos
        });
        await newDevice.save();
        res.send('OK');
    }catch(error){
        console.log(error.message);
        res.status(500).send('Server Error !');
    }
}

exports.editDevice = async(req, res) => {
    try{
        console.log('PUT /api/elegante/v1/device/update/:deviceId');
        let device = await Device.findById(req.params.deviceId);
        if (!device){
            return res.status(400).json({ error: 'Invalid Request' })
        }
        const { deviceName, deviceLabel, deviceType, isGateway, xPos, yPos } = req.body;
        deviceName ? device.deviceName = deviceName : ''
        deviceLabel ? device.deviceLabel = deviceLabel : ''
        deviceType ? device.deviceType = deviceType : ''
        xPos ? device.xPos = xPos : ''
        yPos ? device.yPos = yPos : ''
        await device.save();
        res.send('OK');
    }catch(error){
        console.log(error.message);
        res.status(500).send('Server Error !');
    }
}


exports.getDevices = async(req, res) => {
    console.log('GET /api/elegante/v1/device/getDevices');
    try{
        var device = await Device.find({ userId: req.user.id }).select('deviceName deviceLabel deviceType description isGateway ts xPos yPos');
        res.json(device);
    }catch(error){
        console.log(error.message);
        res.status(500).send('Server Error !');
    }
}


exports.getDeviceTypes = async(req, res) => {
    console.log('GET /api/elegante/v1/device/getTypes');
    try{
        var device = await Device.find({ userId: req.user.id }).select('deviceType');
        res.json(device);
    }catch(error){
        console.log(error.message);
        res.status(500).send('Server Error !');
    }
}


exports.getDeviceDetails = async(req, res) => {
    console.log('GET /api/elegante/v1/device/getDetails/:deviceId');
    try{
        var device = await Device.findOne({ userId: req.user.id, _id: req.params.deviceId });
        res.json(device);
    }catch(error){
        console.log(error.message);
        res.status(500).send('Server Error !');
    }
}


exports.getDeviceLatestTelemtry = async(req, res) => {
    console.log('GET /api/elegante/v1/device/getLatestTelemetry/:deviceId');
    try{
        var device = await Device.findOne({ userId: req.user.id, _id: req.params.deviceId }).select('telemetry metadata');
        res.json(device);
    }catch(error){
        console.log(error.message);
        res.status(500).send('Server Error !');
    }
}


exports.getDeviceTelemtries = async(req, res) => {
    console.log('GET /api/elegante/v1/device/getTelemetry/:deviceId');
    try{
        var device = await Device.findOne({ userId: req.user.id, _id: req.params.deviceId }).select('telemetry');
        if(!device){
            return res.status(400).json({ error: 'Invalid Request' })
        }
        var query = await Telemetry.find({ deviceId: req.params.deviceId }).select('ts telemetry').sort({ ts: -1 }).limit(20);
        console.log(query)
        res.json(query);
    }catch(error){
        console.log(error.message);
        res.status(500).send('Server Error !');
    }
}


exports.getDeviceAlarms = async(req, res) => {
    console.log('GET /api/elegante/v1/device/getDeviceAlarms/:deviceId');
    try{
        let query = await Device.findById(req.params.deviceId);
        if (!query){
            return res.status(400).json({error: 'Bad Request'});
        }
        let alarms = await Alarm.aggregate([
            {
                $match: {
                    userId: mongoose.Types.ObjectId(req.user.id),
                    originator: mongoose.Types.ObjectId(req.params.deviceId)
                },
            },
            {
                $lookup: {
                    from: 'buildings',
                    localField: 'buildingId',
                    foreignField: '_id',
                    as: 'building_details'
                }
            },
            {
                $lookup: {
                    from: 'floors',
                    localField: 'floorId',
                    foreignField: '_id',
                    as: 'floor_details'
                }
            },
            {
                $lookup: {
                    from: 'devices',
                    localField: 'originator',
                    foreignField: '_id',
                    as: 'device_details'
                }
            },
            {
                $unwind: {
                    path: '$building_details'
                }
            },
            {
                $unwind: {
                    path: '$floor_details'
                }
            },
            {
                $unwind: {
                    path: '$device_details'
                }
            },
            {
                $addFields: {
                    buildingName: '$building_details.name',
                    floorName: '$floor_details.name',
                    originatorName: '$device_details.deviceName',
                    originatorLabel: '$device_details.deviceLabel'
                }
            },
            {
                $project: {
                    userId: 0,
                    buildingId: 0,
                    originator: 0,
                    floorId: 0,
                    building_details: 0,
                    floor_details: 0,
                    device_details: 0
                }
            },
            {
                $sort: {
                    ts: -1
                }
            }
        ])
        res.json(alarms)
    }catch(error){
        console.log(error.message);
        res.status(500).send('Server Error !');
    }
}


exports.clearDeviceAlarm = async(req, res) => {
    console.log('PUT /api/elegante/v1/device/clearAlarm/:alarmId');
    try{
        let alarm = await Alarm.findOne({ userId: mongoose.Types.ObjectId(req.user.id), _id: mongoose.Types.ObjectId(req.params.alarmId), active: true  })
        if (!alarm){
            return res.status(400).json({error: 'Bad Request'});
        }
        const { timestamp, msg } = req.body;
        alarm.status = 'cleared unacknowledged'
        alarm.active = false
        alarm.logs.push({
            ts: timestamp,
            msg: msg
        })
        alarm.logs.push({
            ts: Math.floor(Date.now() / 1000),
            msg: 'Alarm Cleared'
        })
        alarm.clearedTime = Math.floor(Date.now() / 1000)
        await alarm.save();
        res.send('OK')
    }catch(error){
        console.log(error.message);
        res.status(500).send('Server Error !');
    }
}
const {validationResult} = require('express-validator');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


//Models
const Device = require('../models/Device');
const Building = require('../models/Building');
const Floor = require('../models/Floor');


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
        const { deviceName, buildingId, floorId, deviceLabel, deviceType, isGateway } = req.body;
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
            }]
        });
        await newDevice.save();
        res.send('OK');
    }catch(error){
        console.log(error.message);
        res.status(500).send('Server Error !');
    }
}


exports.getDevices = async(req, res) => {
    console.log('GET /api/elegante/v1/device/getDevices');
    try{
        var device = await Device.find({ userId: req.user.id }).select('deviceName deviceLabel deviceType description isGateway ts');
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
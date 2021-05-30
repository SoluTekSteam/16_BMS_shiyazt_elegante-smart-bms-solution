const {validationResult} = require('express-validator');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


// Model
const Building = require('../models/Building');
const Floor = require('../models/Floor');
const Device = require('../models/Device');


exports.addFloor = async(req, res) => {
    console.log('POST /api/elegante/v1/floor/addFloor');
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({ errors : errors.array()});
    }
    try{
        const { buildingId, name, floorNo, description, address, image, latitude, longitude, contact } = req.body;
        let building = await Building.find({ userId: req.user.id, _id:  buildingId });
        if (!building){
            return res.status(400).json({errors: [{msg: 'Building does not exist'}]});
        }
        let query = await Floor.find({ buildingId: mongoose.Types.ObjectId(buildingId), floorNo: floorNo });
        if(query.length > 0){
            return res.status(400).json({ error: 'Floor already registered' })
        }
        query = new Floor({
            userId: mongoose.Types.ObjectId(req.user.id),
            buildingId: mongoose.Types.ObjectId(buildingId),
            name,
            floorNo,
            description,
            address,
            image,
            latitude,
            longitude,
            contact,
            ts: Math.floor(Date.now()/1000),
            logs: [{
                ts : Math.floor(Date.now()/1000),
                msg: 'Floor added successfully'
            }]

        });
        await query.save();
        await Building.findOneAndUpdate({ _id: mongoose.Types.ObjectId(buildingId) }, {
            $push : {logs:  {
                ts: Math.floor(Date.now()/1000),
                msg: `Floor ${query.floorNo} with name ${query.name} added`
            }}
        });        
        res.send('OK');
        
    }catch(error){
        console.log(error.message);
        res.status(500).send('Server Error !');
    }
}

exports.getBuildingFloors = async(req, res) => {
    console.log('GET /api/elegante/v1/floor/buildingFloors/:buildingId');
    try{
        // console.log(req.params);
        let query = await Floor.find({ userId: mongoose.Types.ObjectId(req.user.id), buildingId: mongoose.Types.ObjectId(req.params.buildingId) }).select('name floorNo description buildingId').sort({ floorNo: 1 })
        res.json(query);
    }catch(error){
        console.log(error.message);
        res.status(500).send('Server Error !');
    }
}


exports.getFloorDetails = async(req, res) => {
    console.log(`GET /api/elegante/v1/floor/${req.params.floorId}`);
    try{
        let query = await Floor.findById(req.params.floorId);
        // console.log(query);
        if (!query){
            return res.status(400).json({ error: 'Object doesnt exist' });
        }
        res.json(query);
    }catch(error){
        console.log(error.message);
        res.status(500).send('Server Error !');
    }
    
}


exports.getFloorDevices = async(req, res) => {
    console.log('GET /api/elegante/v1/floor/devices/:floorId');
    try{
        console.log(req.params)
        let query = await Floor.findById(req.params.floorId);
        // console.log(query);
        if (!query){
            return res.status(400).json({ error: 'Object doesnt exist' });
        }
        query = await Device.find({ userId: req.user.id, floorId: req.params.floorId }).select('deviceName deviceType deviceLabel xPos yPos')
        res.json(query);
    }catch(error){
        console.log(error.message);
        res.status(500).send('Server Error !');
    }
}


exports.getFloorAlarms = async(req, res) => {
    console.log('GET /api/elegante/v1/building/getFloorAlarms/:floorId');
    try{
        let query = await Floor.findById(req.params.floorId);
        if (!query){
            return res.status(400).json({error: 'Bad Request'});
        }
        let alarms = await Alarm.aggregate([
            {
                $match: {
                    userId: mongoose.Types.ObjectId(req.user.id),
                    floorId: mongoose.Types.ObjectId(req.params.floorId)
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
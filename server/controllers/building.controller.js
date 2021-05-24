const {validationResult} = require('express-validator');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


// Model
const Building = require('../models/Building')
const Alarm = require('../models/Alarm');


exports.addBuilding = async(req, res) => {
    console.log('POST /api/elegante/v1/building/addBuilding');
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({ errors : errors.array()});
    }
    try{
        const { name, description, address, image, latitude, longitude, contact } = req.body;
        var building = new Building({
            userId: req.user.id,
            name,
            description,
            address,
            image,
            latitude,
            longitude,
            contact,
            ts: Math.floor(Date.now()/1000),
            logs: [
                {
                    ts : Math.floor(Date.now()/1000),
                    msg: "Builing created"
                }
            ]
        });

        await building.save();
        res.json(building);
    }catch(error){
        console.log(error.message);
        res.status(500).send('Server Error !');
    }
}

exports.getBuildings = async(req, res) => {
    console.log('GET /api/elegante/v1/building/getBuildings');
    try{
        let query = await Building.find({ userId: req.user.id }).select(' name description ts contact latitude longitude').sort({ ts: 1 });
        res.json(query);
    }catch(error){
        console.log(error.message);
        res.status(500).send('Server Error !');
    }
}

exports.getBuildingDetails = async(req, res) => {
    console.log('GET /api/elegante/v1/building/getBuilding/:buildingId');
    try{
        let query = await Building.findById(req.params.buildingId);
        if (!query){
            return res.status(400).json({error: 'Bad Request'});
        }
        res.json(query);
    }catch(error){
        console.log(error.message);
        res.status(500).send('Server Error !');
    }
}



exports.getBuildingAlarms = async(req, res) => {
    console.log('GET /api/elegante/v1/building/getBuildingAlarms/:buildingId');
    try{
        let query = await Building.findById(req.params.buildingId);
        if (!query){
            return res.status(400).json({error: 'Bad Request'});
        }
        let alarms = await Alarm.aggregate([
            {
                $match: {
                    userId: mongoose.Types.ObjectId(req.user.id),
                    buildingId: mongoose.Types.ObjectId(req.params.buildingId)
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



exports.getUserAlarms = async(req, res) => {
    console.log('GET /api/elegante/v1/building/getUserAlarms');
    try{
        let alarms = await Alarm.aggregate([
            {
                $match: {
                    userId: mongoose.Types.ObjectId(req.user.id)
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
                    device_details: 0,
                    logs: 0
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
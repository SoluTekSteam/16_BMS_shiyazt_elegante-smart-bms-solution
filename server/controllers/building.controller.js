const {validationResult} = require('express-validator');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


// Model
const Building = require('../models/Building')


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
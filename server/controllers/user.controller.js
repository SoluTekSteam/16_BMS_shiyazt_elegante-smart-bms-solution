
const {validationResult} = require('express-validator');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('config');


//Models
const User = require('../models/User');


exports.signUpUser = async(req, res) => {
    console.log('POST /api/elegante/v1/user/signup');
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({ errors : errors.array()});
    }
    try{

        const { email, password, midname, firstname, lastname } = req.body;
        let buffer = await User.findOne({email : email});
        if (buffer){
            return res.status(400).json({error: 'User already registered'});
        }
        const role = 'admin';
        const ts = Math.floor(Date.now()/1000);
        const log = [{
            ts: ts,
            msg: `User ${email} created successfully with role as ${role}` 
        }]
        buffer = new User({ email, password, role, firstname, midname, lastname, ts, active: true, log });
        const salt = await bcrypt.genSalt(10);
        buffer.password = await bcrypt.hash(password, salt);
        await buffer.save();
        res.json(buffer);
    }catch(error){
        console.log(error.message);
        res.status(500).send('Server Error !');
    }
}


exports.loginUser = async(req, res) => {
    console.log('POST /api/elegante/v1/user/login');
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({ errors : errors.array()});
    }
    try{

        const { email, password } = req.body;
        let user = await User.findOne({email : email});
        if (!user){
            return res.status(400).json({errors: [{msg: 'Invalid Credentials'}]});
        }
        // let authenicate the user
        let isAuth = await bcrypt.compare(password, user.password);
        if (!isAuth){
            return res.status(401).json({errors: [{msg: 'Invalid credentials'}]});
        }
        if (!user.active){
            return res.status(400).json({errors: [{msg: 'Invalid credentials'}]});
        }
        const payload = {
            user : {
                id : user.id
            }
        };
        jwt.sign(payload, 
            config.get('jwtSecret'),
            { expiresIn : 36000 },
            (error, token) => {
                if(error) throw error;
                console.log('[INFO] user : ' + user.name + ' logged in');
                res.json({token});
            });
    }catch(error){
        console.log(error.message);
        res.status(500).send('Server Error !');
    }
}


exports.checkUser = async(req, res) => {
    console.log('GET /api/elegante/v1/user/check');
    try{
        let user = await User.findById(req.user.id).select('_id name email role active');
        if (!user.active){
            return res.status(401).send('Unauthorized Attempt');
        }
        res.json(user);
    }catch(error){
        console.log(err.message);
        res.status(500).send('Server Error !'); 
    }
}
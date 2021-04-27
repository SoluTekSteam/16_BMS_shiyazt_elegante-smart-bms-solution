const jwt = require('jsonwebtoken');
const config = require('config');

//Model
const User = require('../models/User');

const auth = (req, res, next) => {
    // console.log(req);

    const token = req.header('X-Authorization');
    if (!token){
        console.log('No token found in request');
        return res.status(401).json({msg : 'Authorization denied !'});
    }
    try{
        jwt.verify(token, config.get('jwtSecret'), (error, decoded) => {
            if (error){
                return res.status(401).json({msg : 'Authorization denied !'});
            }
            else {
                req.user = decoded.user;
                next();
            }
        });
    }catch(err){
        console.log(err.message);
        res.status(500).send({msg : 'Server Error'});
    }
}

module.exports = auth;
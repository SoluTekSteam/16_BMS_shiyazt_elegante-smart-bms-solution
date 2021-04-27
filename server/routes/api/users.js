const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');


//Controller
const UserController = require('../../controllers/user.controller');



//Middleware
const Auth = require('../../middleware/auth');


//GET

/*
    API : /api/elegante/v1/user/check;
    Method : GET
    Description : Check User
*/
router.get('/check', Auth, UserController.checkUser);

//POST

/*
    API : /api/elegante/v1/user/signup;
    Method : POST
    Description : Signup User
*/
router.post('/signup', [
    check('email', 'Email field required').isEmail(),
    check('password', 'Password field of minmum of length 6 is required').isLength({ min: 6 }),
    check('firstname', 'First Name required').notEmpty(),
    check('lastname', 'Last Name required').notEmpty(),

], UserController.signUpUser);


/*
    API : /api/elegante/v1/user/login
    Method : POST
    Description : Login User
*/
router.post('/login', [
    check('email', 'Email field required').isEmail(),
    check('password', 'Password field of minmum of length 6 is required').notEmpty()
], UserController.loginUser);

//PUT

//DELETE



module.exports = router;
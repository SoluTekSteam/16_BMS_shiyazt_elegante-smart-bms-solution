const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');


//Controller
const FloorController = require('../../controllers/floor.controller');



//Middleware
const Auth = require('../../middleware/auth');


//GET

/*
    API : /api/elegante/v1/floor;
    Method : GET
    Description : Get Floors List
*/
router.get('/buildingFloors/:buildingId', Auth, FloorController.getBuildingFloors);


/*
    API : /api/elegante/v1/floor/devices/:floorId;
    Method : GET
    Description : Get Floor Devices List
*/
router.get('/devices/:floorId', Auth, FloorController.getFloorDevices);

/*
    API : /api/elegante/v1/floor/:floorId;
    Method : GET
    Description : Get Floor Details
*/
router.get('/floorDetail/:floorId', Auth, FloorController.getFloorDetails);


/*
    API : /api/elegante/v1/building/getFloorAlarms/:floorId;
    Method : GET
    Description : Get Floor Alarms
*/
router.get('/getFloorAlarms/:floorId', Auth, FloorController.getFloorAlarms);


//POST

/*
    API : /api/elegante/v1/floor/addFloor;
    Method : POST
    Description : Add a Building
*/
router.post('/addFloor', [Auth, [
    check('buildingId', 'Building ID field required').notEmpty(),
    check('name', 'Floor Name field required').notEmpty(),
    check('floorNo', 'Floor Number field required').notEmpty(),
]], FloorController.addFloor);


//PUT

//DELETE



module.exports = router;
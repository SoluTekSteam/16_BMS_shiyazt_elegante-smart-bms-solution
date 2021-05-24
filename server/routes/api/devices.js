const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');


//Controller
const DeviceController = require('../../controllers/device.controller');



//Middleware
const Auth = require('../../middleware/auth');


//GET

/*
    API : /api/elegante/v1/device/getDevices;
    Method : GET
    Description : Get Devices List
*/
router.get('/getDevices', Auth, DeviceController.getDevices);

/*
    API : /api/elegante/v1/device/getTypes;
    Method : GET
    Description : Get Devices Types
*/
router.get('/getTypes', Auth, DeviceController.getDeviceTypes);

/*
    API : /api/elegante/v1/device/getDevices;
    Method : GET
    Description : Get Devices List
*/
router.get('/getDetails/:deviceId', Auth, DeviceController.getDeviceDetails);


/*
    API : /api/elegante/v1/device/getLatestTelemetry/:deviceId;
    Method : GET
    Description : Get Devices Latest Telemetry
*/
router.get('/getLatestTelemetry/:deviceId', Auth, DeviceController.getDeviceLatestTelemtry);


/*
    API : /api/elegante/v1/device/getTelemetry/:deviceId;
    Method : GET
    Description : Get Devices Telemetry
*/
router.get('/getTelemetry/:deviceId', Auth, DeviceController.getDeviceTelemtries);


/*
    API : /api/elegante/v1/device/getDeviceAlarms/:deviceId;
    Method : GET
    Description : Get Device Alarms
*/
router.get('/getDeviceAlarms/:deviceId', Auth, DeviceController.getDeviceAlarms);


//POST

/*
    API : /api/elegante/v1/device/addDevice;
    Method : POST
    Description : Add a device
*/
router.post('/addDevice', [Auth, [
    check('deviceName', 'Device Name field required').notEmpty(),
    check('buildingId', 'Building ID field required').notEmpty(),
    check('floorId', 'Floor ID field required').notEmpty(),
    check('deviceType', 'Device Type field of minmum of length 6 is required').notEmpty(),
    check('isGateway', 'Gateway Field required').notEmpty()
]], DeviceController.addDevice);


//PUT

/*
    API : /api/elegante/v1/device/clearAlarm/:alarmId;
    Method : PUT
    Description : Clear Device Alarms
*/
router.put('/clearAlarm/:alarmId', [Auth.apply, [
    check('ts', 'Timestamp field is required').notEmpty(),
    check('msg', 'Message field is required').notEmpty(),
]], DeviceController.clearDeviceAlarm);

//DELETE



module.exports = router;
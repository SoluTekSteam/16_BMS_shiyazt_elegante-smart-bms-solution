import { React, Fragment, useEffect, useState } from 'react';
import axios from '../hoc/axiosProvider';
import Cookies from 'js-cookie';
import { Link as RouterLink, useParams } from 'react-router-dom';
import moment from 'moment';
import ReactJson from 'react-json-view'

import { makeStyles } from '@material-ui/core/styles';
import {
    Grid,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableRow,
    TableHead,
    TablePagination,
    Snackbar,
    Link,
    IconButton,
    List,
    ListItem,
    ListItemAvatar,
    ListItemIcon,
    ListItemText,
    Button,
    Dialog,
    DialogTitle,
    DialogContent

} from '@material-ui/core';
import { Alert } from '@material-ui/lab';

import CloseIcon from '@material-ui/icons/Close';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import OpenInNewIcon from '@material-ui/icons/OpenInNew';

import TimelineIcon from '@material-ui/icons/Timeline';


const useStyles = makeStyles((theme) => ({
    root: {
        border: "1px solid red"
    },
    alarmTableOriginator: {
        fontWeight: 'bold',
        color: '#bf360c'
    },
    alarmTableType: {
        fontWeight: 'bold',
        color: '#ff8f00'
    }
}))


const DeviceDetail = () => {

    const classes = useStyles();

    const { buildingid, floorid, deviceid } = useParams();

    const [openDialog, setOpenDialog] = useState(false);
    const [openalarmDetailDialog, setOpenalarmDetailDialog] = useState(false);
    const [state, setState] = useState({
        device: {
            _id: null,
            name: null,
            type: null,
            label: null,
            description: null,
            xPos: null,
            yPos: null,
            apiKey: null,
            token: null
        },
        entities: [],
        selected_entity: {
            _id: null,
            name: null,
            address: null,
            descriptin: null,
            contact: null
        },
        selected_telemetry: {
            ts: 0,
            telemetry: {}
        },
        latest_telemetry: [],
        telemetries: [],
        metadata: {},
        alarms: [],
        alarmStats: {},
        selected_alarm: {}
    });

    //Notification states
    const [appAlert, setappAlert] = useState(false);
    const [alertType, setalertType] = useState('');
    const [alertMsg, setalertMsg] = useState('');

    const [refresh, setRefresh] = useState(false)

    useEffect(() => {
        const fetchDetails = async(deviceId) => {
            try{
                let res = await axios.get(`/api/elegante/v1/device/getDetails/${deviceId}`, {
                    headers : {
                        "X-Authorization" : Cookies.get('elegante')
                    },
                });
                // console.log(res.data);
                if (res.status == 200){
                    setState(prevState => {
                        const state = {...prevState};
                        state.device._id = res.data._id;
                        state.device.name = res.data.deviceName;
                        state.device.description = res.data.description;
                        state.device.type = res.data.deviceType;
                        state.device.label = res.data.deviceLabel;
                        state.device.xPos = res.data.xPos;
                        state.device.yPos = res.data.yPos;
                        state.device.apiKey = res.data.key;
                        state.device.token = res.data.token;
                        return state;
                    });
                    // console.log(state);
                }
            }catch(error){
                setalertType('error');
                setalertMsg('Error while fetching building');
                setappAlert(true);
            }
        }

        const fetchDeviceLatestTelemetry = async(deviceId) => {
            try{
                let res = await axios.get(`/api/elegante/v1/device/getLatestTelemetry/${deviceId}`, {
                    headers : {
                        "X-Authorization" : Cookies.get('elegante')
                    },
                });
                if(res.status == 200){
                    console.log(res.data);
                    if(res.data.telemetry){
                        setState(prevState => {
                            const state = {...prevState};
                            state.latest_telemetry.length = 0;
                            Object.keys(res.data.telemetry).forEach(item => {
                                state.latest_telemetry.push({
                                    "ts":  res.data.telemetry[item][0],
                                    "key": item,
                                    "value": res.data.telemetry[item][1]
                                });
                            });
                            return state;
                        });
                    }

                    if(res.data.metadata){
                        setState(prevState => {
                            const state = {...prevState};
                            state.metadata = Object.assign({}, res.data.metadata);
                            return state;
                        });
                    }
                }
                

                // console.log(state)

            }catch(error){
                setalertType('error');
                setalertMsg('Error while fetching device latest telemetry');
                setappAlert(true);
            }
        }
    

        console.log(buildingid);
        console.log(floorid);
        console.log(deviceid);
        fetchDetails(deviceid);
        fetchDeviceLatestTelemetry(deviceid);
        // getFloors(buildingid);
    }, []);

    useEffect(() => {
        const fetchDeviceTelemetry = async(deviceId) => {
            try{
                let res = await axios.get(`/api/elegante/v1/device/getTelemetry/${deviceId}`, {
                    headers : {
                        "X-Authorization" : Cookies.get('elegante')
                    },
                });
                if(res.status == 200){
                    console.log(res.data);
                    if(res.data.length > 0){
                        setState(prevState => {
                            const state = {...prevState};
                            state.telemetries.length = 0;
                            res.data.forEach(item => {
                                state.telemetries.push({
                                    ts: item.ts,
                                    telemetry: Object.assign({}, item.telemetry)
                                });
                            });
                            return state;
                        });
                    }
                }
                // console.log(state)
            }catch(error){
                setalertType('error');
                setalertMsg('Error while fetching device latest telemetry');
                setappAlert(true);
            }
        }

        fetchDeviceTelemetry(deviceid);
    }, [refresh]);


    useEffect(() => {

        const fetchAlarms = async(deviceId) => {
            try{
                let res = await axios.get(`/api/elegante/v1/device/getDeviceAlarms/${deviceId}`, {
                    headers : {
                        "X-Authorization" : Cookies.get('elegante')
                    },
                });
                // console.log(res.data);
                if (res.status == 200){
                    setState(prevState => {
                        const state = {...prevState};
                        state.alarms.length = 0
                        res.data.forEach(item => {
                            state.alarms.push(item)
                        })
                        return state;
                    });
                    // console.log(state);
                    calcAlarmStats()
                }
            }catch(error){
                setalertType('error');
                setalertMsg('Error while fetching building');
                setappAlert(true);
            }
        }

        const calcAlarmStats = () => {
            console.log(state.alarms)
            setState(prevState => {
                const state = {...prevState};
                var critical_active = state.alarms.filter(item => item.severity.toString() == "critical" && item.active == true)
                var critical_cleared = state.alarms.filter(item => item.severity.toString() == "critical" && item.active == false)
                var warning_active = state.alarms.filter(item => item.severity.toString() == "warning" && item.active == true)
                var warning_cleared = state.alarms.filter(item => item.severity.toString() == "warning" && item.active == false)

                var stats = {
                    criticalAlarms: [critical_active.length, critical_cleared.length],
                    warningAlarms: [warning_active.length, warning_cleared.length]
                }
                Object.assign(state.alarmStats, stats)
                return state;
            });

            setTimeout(() => {
                console.log('Refreshing ...')
                handlerRestartComponent()
            }, 20000)
        }

        fetchAlarms(deviceid)
        
        
    }, [refresh]);

    const handlerRestartComponent = () => setRefresh(!refresh)

    const handlerOpenDialog = (item) => {
        console.log(item);
        setState(prevState => {
            const state = {...prevState};
            state.selected_telemetry.ts = item.ts;
            state.selected_telemetry.telemetry = Object.assign({}, item.telemetry);
            // state.selected_entity.telemetry = item.telemetry;
            return state;
        });
        setOpenDialog(true);
    }

    const handlerClearAlarm = (alarmId) => {
        console.log(alarmId)
        const clearAlarm = async() => {
            try{
                let res = await axios.get(`/api/elegante/v1/device/clearAlarm/${alarmId}`, {
                    headers : {
                        "X-Authorization" : Cookies.get('elegante')
                    },
                });
                console.log(res.data);
            }catch(error){
                setalertType('error');
                setalertMsg('Error while clearing alarm');
                setappAlert(true);
            }
        }

        clearAlarm()
    }

    const openRawDataDialog = (
        <Dialog open={openDialog} 
        onClose={() => {setOpenDialog(false)}}
        maxWidth='md'>
                <DialogTitle>
                    View Raw Data
                </DialogTitle>
                <DialogContent>
                    <ReactJson 
                    name={'telemetry'}
                    displayDataTypes={false}
                    src={state.selected_telemetry} />
                    <ReactJson 
                        name={'device'}
                        displayDataTypes={false}
                        src={{
                            name: state.device.name,
                            type: state.device.type,
                            label: state.device.label,
                            description: state.device.description,
                            apiKey: state.device.apiKey,
                            token: state.device.token
                        }} />
                </DialogContent>
        </Dialog>
    );


    const handlerOpenAlarmDetailDialog = (item) => {
        setState(prevState => {
            const state = {...prevState};
            state.selected_alarm = Object.assign({}, item);
            return state;
        });
        setOpenalarmDetailDialog(true);
    }

    const openAlarmDetailsDialog = (
        <Dialog open={openalarmDetailDialog} 
        onClose={() => {setOpenalarmDetailDialog(false)}}
        maxWidth='md'>
                <DialogTitle>
                    Alarm Details
                </DialogTitle>
                <DialogContent>
                    <ReactJson 
                    name={'alarm-details'}
                    displayDataTypes={false}
                    src={{
                        building_name: state.selected_alarm.buildingName,
                        floor_name: state.selected_alarm.floorName,
                        device_code: state.selected_alarm.originatorName,
                        device_name: state.selected_alarm.originatorLabel,
                        active: state.selected_alarm.active,
                        severity: state.selected_alarm.severity,
                        status: state.selected_alarm.status,
                        alarm_type: state.selected_alarm.type,
                        created_time: state.selected_alarm.createdTime,
                        message: state.selected_alarm.msg,

                    }} />
                    <ReactJson 
                        name={'device'}
                        displayDataTypes={false}
                        src={{
                            name: state.device.name,
                            type: state.device.type,
                            label: state.device.label,
                            description: state.device.description,
                            apiKey: state.device.apiKey,
                            token: state.device.token
                        }} />

                    <ReactJson 
                        name={'alarm-logs'}
                        displayDataTypes={false}
                        src={state.selected_alarm.logs} />
                </DialogContent>
        </Dialog>
    );

    return(
        <Fragment>
            <Grid container spacing={3}>
                <Grid item xs={12} style={{ border: '3px solid #9e9e9e', margin: 5, borderRadius: '10px' }}>
                    <Typography variant='h4' style={{ textAlign: 'center', fontWeight: 'bold' }}>{`Device : ${state.device.name}`}</Typography>
                </Grid>

                <Grid item xs={12} sm={12} md={4} lg={3} xl={4} >
                    <Paper elevation={3} style={{ padding : '5px', width: '100%', height: '95%', lineHeight: '2', border: '1px solid #eeeeee' }}>
                        <Typography variant='h6' style={{ fontWeight: 'bold', textAlign: 'center', fontSize: '28px', margin: '10px auto 20px auto' }}>{state.device.name}</Typography>
                        <Typography variant='body1' style={{ fontSize: '20px' }}>Device Label : {state.device.label}</Typography>
                        <Typography variant='body1' style={{ fontSize: '20px' }}>Device Type : {state.device.type}</Typography>
                        <Typography variant='body1' style={{ fontSize: '20px' }}>Description : {state.device.description}</Typography>
                        <Typography variant='body1' style={{ fontSize: '20px' }}>API Key : {state.device.apiKey}</Typography>
                        <Typography variant='body1' style={{ fontSize: '20px' }}>Token : {state.device.token}</Typography>
                        {
                            state.metadata.last_updated ? (
                                <Typography variant='body1' style={{ fontSize: '20px', color: 'red' }}>Last Reported at : {moment(state.metadata.last_updated * 1000).format('DD/MM/YY HH:mm:ss')}</Typography>
                            ) : ''
                        }
                    </Paper>
                </Grid>

                <Grid item xs={12} sm={12} md={2} lg={4} xl={3}>
                    <Paper elevation={3} style={{ padding: '5px', border: '1px solid #eeeeee' }}>
                        <Typography variant='h6' style={{ marginLeft: '10px' }}>Latest Telemetry</Typography>
                        <TableContainer style={{ height: '400px', overflow: 'auto' }}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Timestamp</TableCell>
                                        <TableCell>Key</TableCell>
                                        <TableCell>Value</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {
                                        state.latest_telemetry && state.latest_telemetry.length > 0 ? (
                                            state.latest_telemetry.map((item, index) => (
                                                <TableRow key={index}>
                                                    <TableCell>{moment(item.ts * 1000).format('DD/MM/YY HH:mm:ss')}</TableCell>
                                                    <TableCell>{item.key}</TableCell>
                                                    <TableCell>{item.value}</TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={3}
                                                style={{ fontWeight: 'bold', textAlign: 'center' }}>No Telemetry Found</TableCell>
                                            </TableRow>
                                        )
                                    }
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                </Grid>

                <Grid item xs={12} sm={12} md={6} lg={5} xl={5}>
                    <Paper elevation={3} style={{  border: '1px solid #eeeeee' }}>
                        <Typography variant='h6' style={{ marginLeft: '10px' }}>Telemetry Logs</Typography>
                        <TableContainer style={{ height: '400px', maxHeight: '400px', overflow: true }}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Timestamp</TableCell>
                                        <TableCell>Message</TableCell>
                                        <TableCell>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {
                                        state.telemetries && state.telemetries.length > 0 ? (
                                            state.telemetries.map((item, index) => (
                                                <TableRow key={index}>
                                                    <TableCell>{moment(item.ts * 1000).format('DD/MM/YY HH:mm:ss')}</TableCell>
                                                    <TableCell>Received MQTT Message</TableCell>
                                                    <TableCell>
                                                        <Button variant="outlined" color="primary"
                                                        onClick={() => {handlerOpenDialog(item)}}>Raw Data</Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={3} style={{ 'textAlign': 'center', fontWeight: 'bold' }}>No Entries Found</TableCell>
                                            </TableRow>
                                        )
                                    }
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                </Grid>

                <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                <Paper elevation={3} style={{ padding: '5px' }}>
                        <Typography variant='h6' style={{ marginLeft: '10px' }}>Device Alarm</Typography>
                        <TableContainer style={{ minHeight: '300px', maxHeight: '400px', overflow: 'auto' }}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Timestamp</TableCell>
                                        <TableCell>Active</TableCell>
                                        <TableCell>Originator</TableCell>
                                        <TableCell>Building</TableCell>
                                        <TableCell>Floor</TableCell>
                                        <TableCell>Type</TableCell>
                                        <TableCell>Severity</TableCell>
                                        <TableCell>Status</TableCell>
                                        <TableCell>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {
                                        state.alarms && state.alarms.length > 0 ? (
                                            state.alarms.map((item, index) => (
                                                <TableRow key={index}>
                                                    <TableCell>{moment(item.ts * 1000).format('DD/MM/YY HH:mm:ss')}</TableCell>
                                                    {
                                                        item.active.toString() == "true" ? (
                                                            <TableCell>
                                                                <div style={{ height: '20px', width: '20px', borderRadius: '50%', backgroundColor: '#F00', boxShadow: "#000 0 -1px 6px 1px"}}>
                                                                </div>
                                                            </TableCell>
                                                        ) : (
                                                            <TableCell>
                                                                <div style={{ height: '20px', width: '20px', borderRadius: '50%', backgroundColor: '#81c784', boxShadow: "#000 0 -1px 6px 1px"}}>
                                                                </div>
                                                            </TableCell>
                                                        )
                                                    }
                                                    <TableCell className={classes.alarmTableOriginator}>{item.originatorName}</TableCell>
                                                    <TableCell>{item.buildingName}</TableCell>
                                                    <TableCell>{item.floorName}</TableCell>
                                                    <TableCell className={classes.alarmTableType}>{item.type}</TableCell>
                                                    <TableCell style={
                                                        item.severity.toString() == "critical" ? {
                                                            color: '#e65100',
                                                            fontWeight: 'bold',
                                                            textTransform: 'uppercase'
                                                        } : {
                                                            color: '#ffd600',
                                                            fontWeight: 'bold',
                                                            textTransform: 'uppercase'
                                                        }

                                                    }>{item.severity}</TableCell>
                                                    <TableCell>{item.status}</TableCell>
                                                    <TableCell>
                                                        <IconButton
                                                        onClick={() => {handlerOpenAlarmDetailDialog(item)}}>
                                                            <OpenInNewIcon />
                                                        </IconButton>
                                                        <IconButton 
                                                        disabled={!item.active}
                                                        onClick={() => {handlerClearAlarm(item._id)}}>
                                                            <CloseIcon />
                                                        </IconButton>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={8} style={{ textAlign: 'center', fontWeight: 'bold' }}>No Alarms Available</TableCell>
                                            </TableRow>
                                        )
                                    }
                                    
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                </Grid>
            </Grid>

            <Snackbar 
            open={appAlert} 
            onClose={() => {setappAlert(false)}} 
            anchorOrigin={{
            vertical: 'top', horizontal: 'center'
            }}>
                <Alert onClose={() => {setappAlert(false)}} severity={alertType}>
                    {alertMsg}
                </Alert>
            </Snackbar> 

            {openRawDataDialog}

            {openAlarmDetailsDialog}


        </Fragment>
    );
}

export default DeviceDetail;
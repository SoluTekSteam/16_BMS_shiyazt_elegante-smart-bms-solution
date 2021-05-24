import { React, Fragment, useEffect, useState } from 'react';
import axios from '../hoc/axiosProvider';
import Cookies from 'js-cookie';
import { Link as RouterLink, useParams } from 'react-router-dom';

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
    IconButton

} from '@material-ui/core';
import { Alert } from '@material-ui/lab';


import {
    MapContainer,
    ImageOverlay,
    Marker,
    Popup,
    Tooltip
} from 'react-leaflet'
import L from 'leaflet';
import "leaflet/dist/leaflet.css";
import moment from 'moment';
import { makeStyles } from '@material-ui/core/styles';


import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import OpenInNewIcon from '@material-ui/icons/OpenInNew';
import Marker1 from '../../assets/map-markers/1.svg';
import CloseIcon from '@material-ui/icons/Close';


var busyIcon = new L.Icon({
    iconUrl: Marker1,
    iconAnchor: [20, 40],
    popupAnchor: [0, -35],
    iconSize: [60, 60],
    shadowSize: [29, 40],
    shadowAnchor: [7, 40],
});

// const bounds = [[0, 0], [1900, 2546]]
const bounds = [[0, 0], [800, 1000]]
// const style = { height: '80vh', width: '75vw' }
const style = { height: '100%', width: '100%' }



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

const FloorDetail = () => {
    const classes = useStyles();

    const { buildingid, floorid } = useParams();

    const [state, setState] = useState({
        floor: {
            _id: null,
            name: null,
            no: null,
            description: null,
            image: null
        },
        entities: [],
        selected_entity: {
            _id: null,
            name: null,
            address: null,
            descriptin: null,
            contact: null
        },
        alarms: [],
        alarmStats: {}
    });

    //Notification states
    const [appAlert, setappAlert] = useState(false);
    const [alertType, setalertType] = useState('');
    const [alertMsg, setalertMsg] = useState('');

    useEffect(() => {
        const fetchDetails = async(floorId) => {
            try{
                let res = await axios.get(`/api/elegante/v1/floor/floorDetail/${floorId}`, {
                    headers : {
                        "X-Authorization" : Cookies.get('elegante')
                    },
                });
                // console.log(res.data);
                if (res.status == 200){
                    setState(prevState => {
                        const state = {...prevState};
                        state.floor._id = res.data._id;
                        state.floor.name = res.data.name;
                        state.floor.description = res.data.description;
                        state.floor.no = res.data.floorNo;
                        state.floor.image = res.data.image;
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

        const getDevices = async(floorId) => {
            try{
                let res = await axios.get(`/api/elegante/v1/floor/devices/${floorId}`, {
                    headers : {
                        "X-Authorization" : Cookies.get('elegante')
                    },
                });
                // console.log(res.data);
                if (res.status == 200){
                    setState(prevState => {
                        const state = {...prevState};
                        state.entities.length = 0;
                        res.data.forEach(item => {
                            state.entities.push({
                                _id: item._id,
                                name: item.deviceName,
                                type: item.deviceType,
                                description: item.description,
                                xPos: item.xPos,
                                yPos: item.yPos
                            });
                        });
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

        // console.log(buildingid);
        // console.log(floorid);
        fetchDetails(floorid);
        getDevices(floorid);
    }, []);


    useEffect(() => {
        const fetchAlarms = async(buildingId) => {
            try{
                let res = await axios.get(`/api/elegante/v1/floor/getFloorAlarms/${buildingId}`, {
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
        }

        fetchAlarms(floorid)

    }, []);



    return(
        <Fragment>
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <Typography variant='h4' style={{ textAlign: 'center', fontWeight: 'bold' }}>{`${state.floor.name} Overview`}</Typography>
                </Grid>
                <Grid item xs={12} sm={12} md={6} lg={5} xl={5}>

                    <Paper elevation={3}>
                        <div style={{ height: '450px' }}>
                            <MapContainer  center={[0,0]} minZoom={-4} bounds={bounds}  doubleClickZoom={false} crs={L.CRS.Simple} style={style}>
                                <ImageOverlay
                                    bounds={bounds}
                                    url="https://youreadygrandma.com/wp-content/uploads/2020/03/Floor-Plan-Vising-living-room-master-bedroom-back-porch.jpg"
                                />
                                {
                                    state.entities.length > 0 ? (
                                        state.entities.map((item, index) => (
                                            <Marker key={index} position={[item.xPos, item.yPos]} icon={busyIcon}>
                                                 <Tooltip 
                                                permanent
                                                direction='top'
                                                offset={[5, -30]}
                                                opacity={1} style={{ border: '1px solid #ffc107' }}>
                                                    <Typography variant='body2' 
                                                    align='justify' 
                                                    style={{fontWeight : 'bold', color : '#f57f17' }}>{item.name}</Typography>
                                                </Tooltip>
                                                <Popup>
                                                    <Typography variant='h6'>{item.name}</Typography>
                                                </Popup>
                                            </Marker>
                                        ))
                                        
                                    ) : (
                                        <Marker position={[500.25, 300.35]} icon={busyIcon}>
                                            <Popup>
                                                A pretty CSS3 popup. <br /> Easily customizable.
                                            </Popup>
                                        </Marker>
                                    )
                                }
                                
                            </MapContainer>
                        </div>
                    </Paper>
                </Grid>
                <Grid item xs={12} sm={12} md={4} lg={3} xl={3} >
                    <Paper elevation={3} style={{ padding : '10px', width: '100%', height: '95%', lineHeight: '2' }}>
                        <Typography variant='h6' style={{ fontWeight: 'bold', textAlign: 'center', fontSize: '28px', margin: '10px auto 20px auto' }}>{state.floor.name}</Typography>
                        <div style={{ marginTop: '10px auto 20px auto', padding: '10px', fontWeight : 500}}>
                            <Typography variant='body1' style={{ fontSize: '20px' }}>Floor No : {state.floor.no}</Typography>
                            <Typography variant='body1' style={{ fontSize: '20px' }}>Description : {state.floor.description}</Typography>
                            <Typography variant='body1' style={{ fontSize: '20px' }}>Devices : {`${state.entities.length} No's`}</Typography>
                        </div>
                        {
                            state.alarmStats && Object.keys(state.alarmStats).length > 0 ? (
                                <div style={{ marginTop: '20px auto 10px auto', padding: '5px', border: '2px solid #9e9e9e', borderRadius: '10px' }}>
                                    <Typography variant='body1' style={{ fontSize: '20px', fontWeight: 'bold', color: '#ff5722' }}>Critical Alarms</Typography>
                                    <Typography variant='body1' style={{ fontSize: '16px' }}>{`Active: ${state.alarmStats.criticalAlarms[0]} No's`}</Typography>
                                    <Typography variant='body1' style={{ fontSize: '16px' }}>{`Cleared: ${state.alarmStats.criticalAlarms[1]} No's`}</Typography>
                                    <Typography variant='body1' style={{ fontSize: '20px', fontWeight: 'bold', color: '#ff8f00' }}>Warning Alarms</Typography>
                                    <Typography variant='body1' style={{ fontSize: '16px' }}>{`Active: ${state.alarmStats.warningAlarms[0]} No's`}</Typography>
                                    <Typography variant='body1' style={{ fontSize: '16px' }}>{`Cleared: ${state.alarmStats.warningAlarms[1]} No's`}</Typography>
                                </div>
                            ) : '' 
                        }
                    </Paper>
                </Grid>
                <Grid item xs={12} sm={12} md={2} lg={4} xl={4}>
                    <Paper elevation={3} style={{ padding: '5px' }}>
                        <Typography variant='h6' style={{ marginLeft: '10px' }}>Devices List</Typography>
                        <TableContainer style={{ height: '360px' }}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>No</TableCell>
                                        <TableCell>Name</TableCell>
                                        <TableCell>Type</TableCell>
                                        <TableCell>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {
                                        state.entities && state.entities.length > 0 ? (
                                            state.entities.map((item, index) => (
                                                <TableRow key={index}>
                                                    <TableCell>{index+1}</TableCell>
                                                    <TableCell>{item.name}</TableCell>
                                                    <TableCell>{item.type}</TableCell>
                                                    <TableCell>
                                                        <IconButton
                                                        component={RouterLink}
                                                        to={`/building/${buildingid}/floor/${floorid}/device/${item._id}`} >
                                                            <PlayArrowIcon />
                                                        </IconButton>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={4}>1</TableCell>
                                            </TableRow>
                                        )
                                    }
                                </TableBody>
                            </Table>
                        </TableContainer>
                        <TablePagination
                        rowsPerPageOptions={[10, 25, 100]}
                        component="div"
                        count={state.entities.length}
                        rowsPerPage={10}
                        page={0}
                        // onChangePage={}
                        // onChangeRowsPerPage={handleChangeRowsPerPage}
                        />
                    </Paper>
                </Grid>
                <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                <Paper elevation={3} style={{ padding: '5px' }}>
                        <Typography variant='h6' style={{ marginLeft: '10px' }}>Floor Alarm</Typography>
                        <TableContainer style={{ minHeight: '300px', maxHeight: '400px', overflow: 'auto' }}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Timestamp</TableCell>
                                        <TableCell>Active</TableCell>
                                        <TableCell>Originator</TableCell>
                                        <TableCell>Building</TableCell>
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
                                                        <IconButton>
                                                            <OpenInNewIcon />
                                                        </IconButton>
                                                        <IconButton style={{ color: 'red' }}>
                                                            <CloseIcon />
                                                        </IconButton>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={8} style={{ textAlign: 'center', fontWeight: 'bold' }}>No Active Alarms</TableCell>
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


        </Fragment>
    );
}

export default FloorDetail;
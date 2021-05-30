import { React, Fragment, useEffect, useState } from 'react';
import axios from '../hoc/axiosProvider';
import Cookies from 'js-cookie';
import { Link as Linker } from 'react-router-dom';
import moment from 'moment';
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
    Fab,
    Tooltip as tooltip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    TextField,
    Button

} from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import AddIcon from '@material-ui/icons/Add';


// Leaflet
import { 
    MapContainer, 
    TileLayer, 
    Marker, 
    Popup,
    Tooltip
} from 'react-leaflet';
import "leaflet/dist/leaflet.css";

import L from 'leaflet';


import Marker1 from '../../assets/map-markers/1.svg';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import OpenInNewIcon from '@material-ui/icons/OpenInNew';
import CloseIcon from '@material-ui/icons/Close';


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


var busyIcon = new L.Icon({
    iconUrl: Marker1,
    iconAnchor: [20, 40],
    popupAnchor: [0, -35],
    iconSize: [80, 80],
    shadowSize: [29, 40],
    shadowAnchor: [7, 40],
});


const Home = () => {

    const classes = useStyles();

    const [state, setState] = useState({
        entities: [],
        selected_entity: {
            id: null,
            name: null,
            address: null,
            descriptin: null,
            contact: null
        },
        alarms: [],
        alarmStats: {},
        newBuilding: {
            name: "",
            description: "",
            address: "",
            contact: "",
            latitude: 0,
            longitude: 0
        }
    });

    const [addMode, setAddMode] = useState(false);

    const [restartComp, setRestartComp] = useState(false)

    //Notification states
    const [appAlert, setappAlert] = useState(false);
    const [alertType, setalertType] = useState('');
    const [alertMsg, setalertMsg] = useState('');

    useEffect(() => {
        const fetchDetails = async() => {
            try{
                let res = await axios.get('/api/elegante/v1/building/getBuildings', {
                    headers : {
                        "X-Authorization" : Cookies.get('elegante')
                    },
                });
                if (res.status == 200){
                    setState(prevState => {
                        const state = {...prevState};
                        state.entities.length = 0;
                        res.data.forEach(item => {
                            state.entities.push({
                                _id: item._id,
                                ts: item.ts,
                                name: item.name,
                                description: item.description,
                                address: item.address,
                                latitude: item.latitude,
                                longitude: item.longitude,
                                contact: item.contact
                            });
                        });
                        return state;
                    });
                    console.log(state);
                }
            }catch(error){
                setalertType('error');
                setalertMsg('Error while fetching buildings');
                setappAlert(true);
            }
        }

        fetchDetails();
    }, [restartComp]);


    useEffect(() => {
        const fetchAlarms = async() => {
            try{
                let res = await axios.get(`/api/elegante/v1/building/getUserAlarms`, {
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
        }

        fetchAlarms()
        
    }, [restartComp]);

    
    const handlerRefreshComponent = () => setRestartComp(!restartComp)

    const handlerNewBuildOnChange = (type, value) => {
        switch(type){
            case 'name':
                setState(prevState => {
                    const state = {...prevState}
                    state.newBuilding.name = value
                    return state
                })
                break
            case 'address':
                setState(prevState => {
                    const state = {...prevState}
                    state.newBuilding.address = value
                    return state
                })
                break
            case 'description':
                setState(prevState => {
                    const state = {...prevState}
                    state.newBuilding.description = value
                    return state
                })
                break
            case 'contact':
                setState(prevState => {
                    const state = {...prevState}
                    state.newBuilding.contact = value
                    return state
                })
                break
            case 'latitude':
                setState(prevState => {
                    const state = {...prevState}
                    state.newBuilding.latitude = value
                    return state
                })
                break
            case 'longitude':
                setState(prevState => {
                    const state = {...prevState}
                    state.newBuilding.longitude = value
                    return state
                })
                break
        }
    }

    const handlerAddBuildingSubmit = () => {
        const sendRequest = async(data) => {
            try{
                let res = await axios.post(`/api/elegante/v1/building/addBuilding`, data, {
                    headers : {
                        "X-Authorization" : Cookies.get('elegante')
                    },
                });
                // console.log(res.data);
                if (res.status == 200){
                    setalertType('success')
                    setalertMsg('Building Added Successfully')
                    setappAlert(true)
                    setAddMode(false)
                    handlerRefreshComponent()
                }
            }catch(error){
                setalertType('error');
                setalertMsg('Error while adding building');
                setappAlert(true);
            }
        }
        if(state.newBuilding.name && state.newBuilding.address && state.newBuilding.description){
            sendRequest({
                name: state.newBuilding.name,
                description: state.newBuilding.description,
                address: state.newBuilding.address,
                contact: state.newBuilding.contact,
                latitude: state.newBuilding.latitude,
                longitude: state.newBuilding.longitude
            })
        }else{
            setalertType('error');
            setalertMsg('Please enter the required fields');
            setappAlert(true);
        }
    }

    const addBuildingDialog = (
        <Fragment>
            <Dialog open={addMode} onClose={() => {setAddMode(false)}}>
                <DialogTitle>Add Building</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Please add following details to add a new building.
                    </DialogContentText>
                    <TextField
                        required
                        autoFocus
                        margin="dense"
                        id="name"
                        label="Building Name"
                        type="string"
                        fullWidth
                        value={state.newBuilding.name}
                        onChange={(event) => {handlerNewBuildOnChange('name', event.target.value)}}
                    />
                    <TextField
                        required
                        autoFocus
                        margin="dense"
                        id="address"
                        label="Address"
                        type="string"
                        fullWidth
                        multiline
                        value={state.newBuilding.address}
                        onChange={(event) => {handlerNewBuildOnChange('address', event.target.value)}}
                    />
                    <TextField
                        required
                        autoFocus
                        margin="dense"
                        id="phonenumber"
                        label="Phone Number"
                        type="string"
                        fullWidth
                        value={state.newBuilding.contact}
                        onChange={(event) => {handlerNewBuildOnChange('contact', event.target.value)}}
                    />
                    <TextField
                        required
                        autoFocus
                        margin="dense"
                        id="description"
                        label="Description"
                        type="string"
                        fullWidth
                        value={state.newBuilding.description}
                        onChange={(event) => {handlerNewBuildOnChange('description', event.target.value)}}
                    />
                    <TextField
                        required
                        autoFocus
                        margin="dense"
                        id="latitude"
                        label="Latitude"
                        type="number"
                        value={state.newBuilding.latitude}
                        onChange={(event) => {handlerNewBuildOnChange('latitude', event.target.value)}}
                    />
                    <TextField
                        required
                        autoFocus
                        margin="dense"
                        id="longitude"
                        label="Longitude"
                        type="number"
                        value={state.newBuilding.longitude}
                        onChange={(event) => {handlerNewBuildOnChange('longitude', event.target.value)}}
                    />
                </DialogContent>
                <DialogActions>
                    <Button color="primary" onClick={handlerAddBuildingSubmit}>SAVE</Button>
                    <Button color="secondary" onClick={() => {setAddMode(false)}}>CANCEL</Button>
                </DialogActions>
            </Dialog>
        </Fragment>
    )

    

    const handlerAddBuilding = () => {
        setState(prevState => {
            const state = {...prevState};
            state.newBuilding.name = ""
            state.newBuilding.address = ""
            state.newBuilding.description = ""
            state.newBuilding.latitude = 0
            state.newBuilding.longitude = 0
            return state;
        })
        setAddMode(true)
    }

    return(
        <Fragment>
            <Grid container spacing={3} style={{  backgroundColor: '#fafafa' }}>
                <Grid item xs={12} style={{ border: '3px solid #9e9e9e', margin: 5, borderRadius: '10px' }}>
                    <Typography variant='h4' style={{ textAlign: 'center', fontWeight: 'bold' }}>Buildings Overview</Typography>
                </Grid>
                <Grid item xs={12} sm={12} md={10} lg={8} xl={7}>

                    <Paper elevation={3} style={{ height: '450px' }}>
                        <MapContainer center={[0,0]} zoom={2} scrollWheelZoom={true}>
                            <TileLayer
                                attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            {
                                state.entities && state.entities.length > 0 ? (
                                    state.entities.map((item, index) => (
                                        <Marker key={index} position={[item.latitude, item.longitude]} icon={busyIcon}>
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
                                                <Typography variant='body2' align='center' style={{ fontWeight : 500 }} >{item.name}</Typography>
                                                <Typography variant='body2' align='justify' >{`Address : ${item.address}`}</Typography>
                                                <Typography variant='body2' align='justify' >{`Description : ${item.description}`}</Typography>
                                                <Link href={`/building/${item._id}`}>More Details</Link>
                                            </Popup>
                                        </Marker>
                                    ))
                                ) : ''
                            }
                            
                        </MapContainer>
                    </Paper>
                </Grid>
                <Grid item xs={12} sm={12} md={2} lg={4} xl={5}>
                    <Paper elevation={3} style={{ padding: '5px', border: '1px solid #eeeeee' }}>
                        <Typography variant='h6' style={{ marginLeft: '10px' }}>Buildings List</Typography>
                        <TableContainer style={{ height: '400px', overflow: 'auto' }}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Number</TableCell>
                                        <TableCell>Name</TableCell>
                                        <TableCell>Emergency Contact</TableCell>
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
                                                    <TableCell>{item.contact}</TableCell>
                                                    <TableCell>
                                                    <IconButton>
                                                            <OpenInNewIcon />
                                                        </IconButton>
                                                        <IconButton
                                                        component={Linker}
                                                        to={`/building/${item._id}`} >
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
                    </Paper>
                </Grid>
                <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                <Paper elevation={3} style={{ padding: '5px', border: '1px solid #eeeeee' }}>
                        <Typography variant='h6' style={{ marginLeft: '10px' }}>Buildings Alarm</Typography>
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

            <tooltip title={'Add Building'} placement={'top'}>
                <Fab color="secondary" aria-label="add" 
                style={{ position: 'fixed', bottom: '20px', right: '5px' }}
                onClick={handlerAddBuilding}>
                    <AddIcon />
                </Fab>
            </tooltip>

            {addBuildingDialog}



        </Fragment>
    );
}

export default Home;
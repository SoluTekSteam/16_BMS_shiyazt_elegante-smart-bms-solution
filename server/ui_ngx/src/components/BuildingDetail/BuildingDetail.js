import { React, Fragment, useEffect, useState } from 'react';
import axios from '../hoc/axiosProvider';
import Cookies from 'js-cookie';
import { Link as RouterLink, useParams } from 'react-router-dom';
import moment from 'moment';

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
    Button,
    TextField,
    Dialog,
    DialogContent,
    DialogTitle,
    DialogContentText,
    DialogActions

} from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import { makeStyles } from '@material-ui/core/styles';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import OpenInNewIcon from '@material-ui/icons/OpenInNew';
import CloseIcon from '@material-ui/icons/Close';
import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/Delete';

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


const BuildingDetail = () => {

    const classes = useStyles();

    const { buildingid } = useParams();

    const [addMode, setAddMode] = useState(false)
    const [restartComp, setRestartComp] = useState(false)

    const [state, setState] = useState({
        building: {
            _id: null,
            name: null,
            address: null,
            descriptin: null,
            contact: null,
            image: null
        },
        entities: [],
        newFloor: {
            buildingId: null,
            name: "",
            floorNo: 0,
            description: ""
        },
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
        const fetchDetails = async(buildingId) => {
            try{
                let res = await axios.get(`/api/elegante/v1/building/getBuilding/${buildingId}`, {
                    headers : {
                        "X-Authorization" : Cookies.get('elegante')
                    },
                });
                // console.log(res.data);
                if (res.status == 200){
                    setState(prevState => {
                        const state = {...prevState};
                        state.building._id = res.data._id;
                        state.building.name = res.data.name;
                        state.building.description = res.data.description;
                        state.building.address = res.data.address;
                        state.building.contact = res.data.contact;
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

        const getFloors = async(buildingId) => {
            try{
                let res = await axios.get(`/api/elegante/v1/floor/buildingFloors/${buildingId}`, {
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
                                name: item.name,
                                description: item.description,
                                floorNo: item.floorNo,
                                buildingId: item.buildingId
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

        console.log(buildingid);
        fetchDetails(buildingid);
        getFloors(buildingid);
    }, [restartComp]);

    useEffect(() => {
        const fetchAlarms = async(buildingId) => {
            try{
                let res = await axios.get(`/api/elegante/v1/building/getBuildingAlarms/${buildingId}`, {
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

        fetchAlarms(buildingid)
        
    }, [restartComp]);

    const handlerRefreshComponent = () => setRestartComp(!restartComp)


    const handlerAddFloor = () => {
        setState(prevState => {
            const state = {...prevState};
            state.newFloor.name = ""
            state.newFloor.floorNo = 0
            state.newFloor.description = ""
            return state;
        })
        setAddMode(true)
    }


    const handlerAddFloorSubmit = () => {
        const sendRequest = async(data) => {
            try{
                let res = await axios.post(`/api/elegante/v1/floor/addFloor`, data, {
                    headers : {
                        "X-Authorization" : Cookies.get('elegante')
                    },
                });
                // console.log(res.data);
                if (res.status == 200){
                    setalertType('success')
                    setalertMsg('Floor Added Successfully')
                    setappAlert(true)
                    setAddMode(false)
                    handlerRefreshComponent()
                }
            }catch(error){
                setalertType('error');
                setalertMsg('Error while adding Floor');
                setappAlert(true);
            }
        }
        if(state.newFloor.name && state.newFloor.floorNo && state.newFloor.description){
            sendRequest({
                buildingId: buildingid,
                name: state.newFloor.name,
                floorNo: state.newFloor.floorNo,
                description: state.newFloor.description,
            })
        }else{
            setalertType('error');
            setalertMsg('Please enter the required fields');
            setappAlert(true);
        }
    }

    const handlerNewFloorOnChange = (type, value) => {
        switch(type){
            case 'name':
                setState(prevState => {
                    const state = {...prevState}
                    state.newFloor.name = value
                    return state
                })
                break
            case 'floorNo':
                setState(prevState => {
                    const state = {...prevState}
                    state.newFloor.floorNo = value
                    return state
                })
                break
            case 'description':
                setState(prevState => {
                    const state = {...prevState}
                    state.newFloor.description = value
                    return state
                })
                break
        }
    }


    const addFloorDialog = (
        <Fragment>
            <Dialog open={addMode} onClose={() => {setAddMode(false)}}>
                <DialogTitle>Add Floor</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Please add following details to add a new Floor.
                    </DialogContentText>
                    <TextField
                        required
                        autoFocus
                        margin="dense"
                        id="name"
                        label="Floor Name"
                        type="string"
                        fullWidth
                        value={state.newFloor.name}
                        onChange={(event) => {handlerNewFloorOnChange('name', event.target.value)}}
                    />
                    <TextField
                        required
                        autoFocus
                        margin="dense"
                        id="floornumber"
                        label="Floor Number"
                        type="number"
                        fullWidth
                        value={state.newFloor.floorNo}
                        onChange={(event) => {handlerNewFloorOnChange('floorNo', event.target.value)}}
                    />
                    <TextField
                        required
                        autoFocus
                        margin="dense"
                        id="description"
                        label="Description"
                        type="string"
                        fullWidth
                        multiline
                        value={state.newFloor.description}
                        onChange={(event) => {handlerNewFloorOnChange('description', event.target.value)}}
                    />
                </DialogContent>
                <DialogActions>
                    <Button color="primary" onClick={handlerAddFloorSubmit}>SAVE</Button>
                    <Button color="secondary" onClick={() => {setAddMode(false)}}>CANCEL</Button>
                </DialogActions>
            </Dialog>
        </Fragment>
    )


    return(
        <Fragment>
            <Grid container spacing={3}>
                <Grid item xs={12} style={{ border: '3px solid #9e9e9e', margin: 5, borderRadius: '10px' }}>
                    <Typography variant='h4' style={{ textAlign: 'center', fontWeight: 'bold' }}>{`${state.building.name} Overview`}</Typography>
                </Grid>
                <Grid item xs={12} sm={12} md={6} lg={5} xl={5}>

                    <Paper elevation={3} style={{ border: '1px solid #eeeeee' }}>
                        <div style={{ width: '100%', height: '100%' }}>
                            <img width="100%" height="100%" src={'https://www.ubm-development.com/magazin/wp-content/uploads/2020/03/kl-main-building-d-Kopie.jpg'} />
                        </div>
                    </Paper>
                </Grid>
                <Grid item xs={12} sm={12} md={4} lg={3} xl={4} >
                    <Paper elevation={3} style={{ padding : '5px', width: '100%', height: '95%', lineHeight: '2', border: '1px solid #eeeeee' }}>
                        <Typography variant='h6' style={{ fontWeight: 'bold', textAlign: 'center', fontSize: '28px', margin: '10px auto 20px auto' }}>{state.building.name}</Typography>
                        <Typography variant='body1' style={{ fontSize: '20px' }}>Description : {state.building.description}</Typography>
                        <Typography variant='body1' style={{ fontSize: '20px' }}>Address : {state.building.address}</Typography>
                        <Typography variant='body1' style={{ fontSize: '20px' }}>Emergency Contact : {state.building.contact}</Typography>
                        <Typography variant='body1' style={{ fontSize: '20px' }}>Floors : {state.entities.length} No's</Typography>
                        <Typography variant='body1' style={{ fontSize: '20px' }}>Devices : 1 No's</Typography>
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
                <Grid item xs={12} sm={12} md={2} lg={4} xl={3}>
                    <Paper elevation={3} style={{ padding: '5px', border: '1px solid #eeeeee' }}>
                        <Typography variant='h6' style={{ marginLeft: '10px' }}>Floors List</Typography>
                        <TableContainer style={{ height: '380px', overflow: 'auto' }}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>No</TableCell>
                                        <TableCell>Name</TableCell>
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
                                                    <TableCell>
                                                        <IconButton
                                                        component={RouterLink}
                                                        to={`/building/${buildingid}/floor/${item._id}`} >
                                                            <PlayArrowIcon />
                                                        </IconButton>
                                                        <IconButton>
                                                            <DeleteIcon />
                                                        </IconButton>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={4} style={{ 'textAlign': 'center', fontWeight: 'bold' }}>No Floors Available</TableCell>
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
                        <Typography variant='h6' style={{ marginLeft: '10px' }}>Building Alarm</Typography>
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
                                                <TableCell colSpan={9} style={{ textAlign: 'center', fontWeight: 'bold' }}>No Alarms Available</TableCell>
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
                onClick={handlerAddFloor}>
                    <AddIcon />
                </Fab>
            </tooltip>

            {addFloorDialog}


        </Fragment>
    );
}

export default BuildingDetail;
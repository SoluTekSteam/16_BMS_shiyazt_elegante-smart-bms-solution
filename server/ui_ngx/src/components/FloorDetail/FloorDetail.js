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



import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import OpenInNewIcon from '@material-ui/icons/OpenInNew';
import Marker1 from '../../assets/map-markers/1.svg';


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


const FloorDetail = () => {

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
        }
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
                    <Paper elevation={3} style={{ padding : '5px', width: '100%', height: '95%', lineHeight: '2' }}>
                        <Typography variant='h6' style={{ fontWeight: 'bold', textAlign: 'center', fontSize: '28px', margin: '10px auto 20px auto' }}>{state.floor.name}</Typography>
                        <Typography variant='body1' style={{ fontSize: '20px' }}>Floor No : {state.floor.no}</Typography>
                        <Typography variant='body1' style={{ fontSize: '20px' }}>Description : {state.floor.description}</Typography>
                        <Typography variant='body1' style={{ fontSize: '20px' }}>Devices : {`${state.entities.length} No's`}</Typography>
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
                        <TableContainer style={{ minHeight: '300px' }}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Timestamp</TableCell>
                                        <TableCell>Originator</TableCell>
                                        <TableCell>Building</TableCell>
                                        <TableCell>Floor</TableCell>
                                        <TableCell>Device</TableCell>
                                        <TableCell>Severity</TableCell>
                                        <TableCell>Status</TableCell>
                                        <TableCell>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    <TableRow>
                                        <TableCell colSpan={8} style={{ textAlign: 'center', fontWeight: 'bold' }}>No Active Alarms</TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </TableContainer>
                        <TablePagination
                        rowsPerPageOptions={[10, 25, 100]}
                        component="div"
                        count={10}
                        rowsPerPage={10}
                        page={1}
                        // onChangePage={}
                        // onChangeRowsPerPage={handleChangeRowsPerPage}
                        />
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
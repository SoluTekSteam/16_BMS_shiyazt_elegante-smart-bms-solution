import { React, Fragment, useEffect, useState } from 'react';
import axios from '../hoc/axiosProvider';
import Cookies from 'js-cookie';
import { Link as Linker } from 'react-router-dom';

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


var busyIcon = new L.Icon({
    iconUrl: Marker1,
    iconAnchor: [20, 40],
    popupAnchor: [0, -35],
    iconSize: [80, 80],
    shadowSize: [29, 40],
    shadowAnchor: [7, 40],
});


const Home = () => {

    const [state, setState] = useState({
        entities: [],
        selected_entity: {
            id: null,
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
    }, []);

    return(
        <Fragment>
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <Typography variant='h4' style={{ textAlign: 'center', fontWeight: 'bold' }}>Buildings Overview</Typography>
                </Grid>
                <Grid item xs={12} sm={12} md={10} lg={8} xl={7}>

                    <Paper elevation={3} style={{ height: '450px' }}>
                        <MapContainer center={[10.0094, 76.3441]} zoom={13} scrollWheelZoom={true}>
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
                    <Paper elevation={3} style={{ padding: '5px' }}>
                        <Typography variant='h6' style={{ marginLeft: '10px' }}>Buildings List</Typography>
                        <TableContainer style={{ height: '360px' }}>
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
                        <Typography variant='h6' style={{ marginLeft: '10px' }}>Buildings Alarm</Typography>
                        <TableContainer style={{ minHeight: '300px' }}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Timestamp</TableCell>
                                        <TableCell>Originator</TableCell>
                                        <TableCell>Building</TableCell>
                                        <TableCell>Floor</TableCell>
                                        <TableCell>Device</TableCell>
                                        <TableCell>Sevrity</TableCell>
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

export default Home;
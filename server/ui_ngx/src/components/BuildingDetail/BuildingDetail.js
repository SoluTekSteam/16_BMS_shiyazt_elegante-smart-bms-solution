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

import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import OpenInNewIcon from '@material-ui/icons/OpenInNew';




const BuildingDetail = () => {

    const { buildingid } = useParams();

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
                console.log(res.data);
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
    }, []);

    return(
        <Fragment>
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <Typography variant='h4' style={{ textAlign: 'center', fontWeight: 'bold' }}>{`${state.building.name} Overview`}</Typography>
                </Grid>
                <Grid item xs={12} sm={12} md={6} lg={5} xl={5}>

                    <Paper elevation={3}>
                        <div style={{ width: '100%', height: '100%' }}>
                            <img width="100%" height="100%" src={'https://www.ubm-development.com/magazin/wp-content/uploads/2020/03/kl-main-building-d-Kopie.jpg'} />
                        </div>
                    </Paper>
                </Grid>
                <Grid item xs={12} sm={12} md={4} lg={3} xl={4} >
                    <Paper elevation={3} style={{ padding : '5px', width: '100%', height: '95%', lineHeight: '2' }}>
                        <Typography variant='h6' style={{ fontWeight: 'bold', textAlign: 'center', fontSize: '28px', margin: '10px auto 20px auto' }}>{state.building.name}</Typography>
                        <Typography variant='body1' style={{ fontSize: '20px' }}>Description : {state.building.description}</Typography>
                        <Typography variant='body1' style={{ fontSize: '20px' }}>Address : {state.building.address}</Typography>
                        <Typography variant='body1' style={{ fontSize: '20px' }}>Emergency Contact : {state.building.contact}</Typography>
                        <Typography variant='body1' style={{ fontSize: '20px' }}>Floors : {state.entities.length} No's</Typography>
                        <Typography variant='body1' style={{ fontSize: '20px' }}>Devices : 1 No's</Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} sm={12} md={2} lg={4} xl={3}>
                    <Paper elevation={3} style={{ padding: '5px' }}>
                        <Typography variant='h6' style={{ marginLeft: '10px' }}>Floors List</Typography>
                        <TableContainer style={{ height: '360px' }}>
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
                        <Typography variant='h6' style={{ marginLeft: '10px' }}>Building Alarm</Typography>
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

export default BuildingDetail;
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
    IconButton,
    List,
    ListItem,
    ListItemAvatar,
    ListItemIcon,
    ListItemText,
    Button

} from '@material-ui/core';
import { Alert } from '@material-ui/lab';

import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import OpenInNewIcon from '@material-ui/icons/OpenInNew';

import TimelineIcon from '@material-ui/icons/Timeline';



const DeviceDetail = () => {

    const { buildingid, floorid, deviceid } = useParams();

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
        }
    });

    //Notification states
    const [appAlert, setappAlert] = useState(false);
    const [alertType, setalertType] = useState('');
    const [alertMsg, setalertMsg] = useState('');

    useEffect(() => {
        const fetchDetails = async(deviceId) => {
            try{
                let res = await axios.get(`/api/elegante/v1/device/getDetails/${deviceId}`, {
                    headers : {
                        "X-Authorization" : Cookies.get('elegante')
                    },
                });
                console.log(res.data);
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

        

        console.log(buildingid);
        console.log(floorid);
        console.log(deviceid);
        fetchDetails(deviceid);
        // getFloors(buildingid);
    }, []);

    return(
        <Fragment>
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <Typography variant='h4' style={{ textAlign: 'center', fontWeight: 'bold' }}>{`Device : ${state.device.name}`}</Typography>
                </Grid>
                <Grid item xs={12} sm={12} md={4} lg={3} xl={4} >
                    <Paper elevation={3} style={{ padding : '5px', width: '100%', height: '95%', lineHeight: '2' }}>
                        <Typography variant='h6' style={{ fontWeight: 'bold', textAlign: 'center', fontSize: '28px', margin: '10px auto 20px auto' }}>{state.device.name}</Typography>
                        <Typography variant='body1' style={{ fontSize: '20px' }}>Device Label : {state.device.label}</Typography>
                        <Typography variant='body1' style={{ fontSize: '20px' }}>Device Type : {state.device.type}</Typography>
                        <Typography variant='body1' style={{ fontSize: '20px' }}>Description : {state.device.description}</Typography>
                        <Typography variant='body1' style={{ fontSize: '20px' }}>API Key : {state.device.apiKey}</Typography>
                        <Typography variant='body1' style={{ fontSize: '20px' }}>Token : {state.device.token}</Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} sm={12} md={2} lg={4} xl={3}>
                    <Paper elevation={3} style={{ padding: '5px' }}>
                        <Typography variant='h6' style={{ marginLeft: '10px' }}>Latest Telemetry</Typography>
                        <TableContainer style={{ height: '360px' }}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Timestamp</TableCell>
                                        <TableCell>Key</TableCell>
                                        <TableCell>Value</TableCell>
                                        <TableCell>Unit</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    <TableRow>
                                        <TableCell>27/04/2021 13:46:21</TableCell>
                                        <TableCell>Temperature</TableCell>
                                        <TableCell>24.5</TableCell>
                                        <TableCell>C</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>27/04/2021 13:46:21</TableCell>
                                        <TableCell>Humidity</TableCell>
                                        <TableCell>52.4</TableCell>
                                        <TableCell>%</TableCell>
                                    </TableRow>
                                    
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

                <Grid item xs={12} sm={12} md={6} lg={5} xl={5}>
                    <Paper elevation={3}>
                        <Typography variant='h6' style={{ marginLeft: '10px' }}>Telemetry Logs</Typography>
                        <TableContainer style={{ height: '360px', maxHeight: '400px', overflow: true }}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Timestamp</TableCell>
                                        <TableCell>Message</TableCell>
                                        <TableCell>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    <TableRow>
                                        <TableCell>27/04/2021 15:05:25</TableCell>
                                        <TableCell>Received MQTT Message</TableCell>
                                        <TableCell>
                                            <Button variant="outlined" color="primary">Raw Data</Button>
                                        </TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>27/04/2021 15:05:05</TableCell>
                                        <TableCell>Received MQTT Message</TableCell>
                                        <TableCell>
                                            <Button variant="outlined" color="primary">Raw Data</Button>
                                        </TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>27/04/2021 15:04:45</TableCell>
                                        <TableCell>Received MQTT Message</TableCell>
                                        <TableCell>
                                            <Button variant="outlined" color="primary">Raw Data</Button>
                                        </TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>27/04/2021 15:04:25</TableCell>
                                        <TableCell>Received MQTT Message</TableCell>
                                        <TableCell>
                                            <Button variant="outlined" color="primary">Raw Data</Button>
                                        </TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>27/04/2021 15:04:05</TableCell>
                                        <TableCell>Received MQTT Message</TableCell>
                                        <TableCell>
                                            <Button variant="outlined" color="primary">Raw Data</Button>
                                        </TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>Timestamp</TableCell>
                                        <TableCell>Received MQTT Message</TableCell>
                                        <TableCell>
                                            <Button variant="outlined" color="primary">Raw Data</Button>
                                        </TableCell>
                                    </TableRow>
                                    
                                </TableBody>
                            </Table>
                        </TableContainer>
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

export default DeviceDetail;
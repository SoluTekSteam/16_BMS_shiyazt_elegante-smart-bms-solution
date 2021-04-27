import { React, Fragment, useState } from 'react';
import Cookies from 'js-cookie';
import { makeStyles } from '@material-ui/core/styles';
import Alert from '@material-ui/lab/Alert';
import { Redirect } from 'react-router-dom';
import axios from '../hoc/axiosProvider';
import {
    TextField,
    Typography,
    Paper,
    Snackbar,
    Grid,
    Button,
    Avatar,
    FormControl
} from '@material-ui/core';

import BusinessIcon from '@material-ui/icons/Business';


const useStyles = makeStyles((theme) => ({
    root : {
        display : 'flex'
    },
    container : {
        position : 'fixed',
        top : '50%',
        left : '50%',
        transform: `translate(-50%, -50%)`,
        margin : 'auto',
        padding : '2px',
        // border : '1px solid red',
        height : 'auto',
        width : '400px',
        [theme.breakpoints.down('sm')] : {
            width : '300px'
        }
    }
}));


const LoginPage = () => {

    const classes = useStyles();
    const [state, setState] = useState({
        email : null,
        password : null,
        loggedIn : false,
        error : false
    });

    //Notification states
    const [appAlert, setappAlert] = useState(false);
    const [alertType, setalertType] = useState('');
    const [alertMsg, setalertMsg] = useState('');

    //Handlers

    const handlerChanger = (type, value) => {
        if(type === 'email'){
            setState(prevState => {
                const state = {...prevState};
                state.email = value;
                return state;
            });
        }else{
            setState(prevState => {
                const state = {...prevState};
                state.password = value;
                return state;
            });
        }
    }
    
    const handlerLogin = (event) => {
        console.log('User Login Button');
    
        const sendRequest = async(email, password) => {
            try{
                let res = await axios.post('/api/elegante/v1/user/login', {
                    'email' : email,
                    'password' : password
                });
                if(res.status === 200){
                    Cookies.set('elegante', res.data.token);
                    setState(prevState => {
                        const state = {...prevState};
                        state.loggedIn = true;
                        return state;
                    });
                }
            }catch(err){
                console.error(err);
                if(err.response){
                    setalertType('error');
                    setalertMsg(`Error : ${err.response.statusText}`);
                    setappAlert(true);
                }else{
                    setalertType('error');
                    setalertMsg(`Error : Network Error`);
                    setappAlert(true);
                }
                
            }
            
        }
    
        event.preventDefault();
        if(state.email !== '' && state.password !== ''){
            
            sendRequest(state.email, state.password);
        }else{
            setalertType('error');
            setalertMsg('Error : Invalid Credentials');
            setappAlert(true);
        }
    }
    
    const handlerCancelLogin = () => {
        console.log('Cancel Button');
        // setRefresh(!refresh);
        setState(prevState => {
            const state = {...prevState};
            state.email = '';
            state.password = '';
            state.loggedIn = false;
            return state;
        });
    }
    

    return(
        <Fragment>
            <Grid container spacing={2} className={classes.container}>
                <Grid item xs={12}>
                    <Paper elevation={3} style={{ width : '100%', padding: '20px', border: '2px solid #364f6b'}}>
                        <Typography variant='h4' style={{ textAlign : 'center', padding : '15px auto 15px auto' }}>Login</Typography>
                        <div>
                            {/* <Typography align='center' variant='h6'>Company Logo</Typography> */}
                            <Avatar  style={{ padding : '5px', width : '120px', height: '120px', margin : '15px auto 2px auto' , backgroundColor: '#071a52', color: '#f4fa9c'}} >
                                <BusinessIcon style={{ fontSize: '100px' }} />
                            </Avatar>
                        </div>
                        <Typography align='center' variant='h6'>Elegante</Typography>
                        <Typography align='center' variant='body2'>Smart Building Management Solution</Typography>

                        <Paper elevation={0} style={{ margin : '30px auto', padding : '5px' }}>
                            <FormControl style={{ margin : '0px auto 25px auto', width : '100%' }}>
                                <TextField 
                                type='email' 
                                label='Email' 
                                fullWidth 
                                style={{ marginBottom : '10px' }} 
                                onChange={(event) => {handlerChanger('email', event.target.value)}}
                                value={state.email ? state.email : ''} />
                                <TextField 
                                type='password' 
                                label='Password' 
                                fullWidth 
                                onChange={(event) => {handlerChanger('password', event.target.value)}}
                                value={state.password ? state.password : ''} />
                            </FormControl>
                            <Button variant='contained' color='secondary' style={{ marginTop: '10px', width : '100%'}} onClick={(event) => {handlerLogin(event)}}>Login</Button>
                            <Button variant='contained' color='primary' style={{ width : '100%', margin : '15px 0px 10px 0px'}} onClick={handlerCancelLogin}>Cancel</Button>
                        </Paper>
                    </Paper>
                </Grid>
            </Grid>

            {
                state.loggedIn ? (
                    <Redirect to='/' />
                ) : ''
            }

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

export default LoginPage;


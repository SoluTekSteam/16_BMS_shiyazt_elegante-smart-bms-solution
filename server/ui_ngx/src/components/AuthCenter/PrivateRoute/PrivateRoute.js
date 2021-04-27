import { React, useState, useEffect } from 'react';
import { Route, Redirect } from 'react-router-dom';
import axios from '../../hoc/axiosProvider';
import Cookies from 'js-cookie';


import CircularProgress from '@material-ui/core/CircularProgress';
import { makeStyles } from '@material-ui/core/styles';

import AppLayout from '../../AppLayout/AppLayout';

const useStyles = makeStyles((theme) => ({
    circleProgress:{
        position: 'fixed',
		zIndex: '1000',
		left: '45%',
		top: '35%'
    }
  }));

const PrivateRoute = ({component:Component, pg, ...rest}) => {
    const classes = useStyles();
    const [loading, setloading] = useState(true);
    const [Authenicated, setAuthenicated] = useState(false);
    const [redirect, setredirect] = useState(false);
    const [state, setState] = useState({
        name : '',
        email : '',
        role : '',
        active : false
    });
    
    useEffect(() => {
        const checkToken = async() => {
            try{
                let res = await axios.get('/api/elegante/v1/user/check', {
                    headers : {
                        "X-Authorization" : Cookies.get('elegante')
                    }
                });
                // console.log(res);
                if (res.status === 200){
                    const { email, role, name, active } = res.data;
                    setState(prevState => {
                        const state = {...prevState};
                        state.name = name;
                        state.email = email;
                        state.role = role;
                        state.active = active;
                        return state;
                    });
                    setAuthenicated(true);
                    setloading(false);
                    // console.log(appState);
                }
                else {
                    console.log('Authenication failed ...');
                    console.log(res);
                    setloading(false);
                    setredirect(true);
                    
                }
            }catch(err){
                console.log(err.response);
                if(err.response){
                    if(err.response.status === 401){
                        setloading(false);
                        setredirect(true);
                    }else if (err.response.status === 404){
                        setloading(false);
                        setredirect(true);
                    }
                }else{
                    setloading(false);
                    setredirect(true);
                }
            }
        } 
        // console.log('Authenicating ....');
        checkToken();
    }, [Authenicated, redirect, loading]);

    if(loading){
        return (<CircularProgress  color='secondary' size='4rem' className={classes.circleProgress} />);
    }
    else if(redirect){
        return <Redirect to='/login' />
    }else{
        return (
            <Route {...rest}
            render={
                (props) => {
                    if(Authenicated){
                        if(pg === 'all'){
                            return (
                                <AppLayout name={state.name} email={state.email} role={state.role} active={state.active}>
                                    <Component {...props}  />
                                </AppLayout>
                            );
                        }else if(state.role === pg){
                            return (
                                <AppLayout name={state.name} email={state.email} role={state.role} active={state.active}>
                                    <Component {...props} />
                                </AppLayout>
                            );
                        }else{  
                            return (<Redirect to='/login' />);
                        }
                        
                    }else{
                        return (<Redirect to='/login' />);
                    }
                }
            } />
        );
    }
}


export default PrivateRoute;
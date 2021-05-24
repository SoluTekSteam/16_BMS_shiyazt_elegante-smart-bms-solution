
import { React, Fragment, useState } from 'react';
import Cookies from 'js-cookie';
import { Redirect } from 'react-router-dom';

import { 
    AppBar,
    Toolbar,
    Typography,
    IconButton,
    Avatar,
    Button,
 } from '@material-ui/core';
 import BusinessIcon from '@material-ui/icons/Business';


 


 const AppLayout = (props) => {
    const [logout, setlogout] = useState(false);


    const handlerLogout = () => {
        if(Cookies.get('elegante') !== undefined){
            Cookies.remove('elegante');
            setlogout(true);
          }
     } 


     return (
         <Fragment>
            <AppBar position="static">
                <Toolbar style={{ display: 'flex' }}>
                    <IconButton edge="start" style={{ color: 'white' }} href={'/'}>
                        <BusinessIcon />
                    </IconButton>
                    <Typography variant='h6'>Elegante</Typography>
                    <div style={{ flexGrow: 1 }}>
                    </div>
                    <Button edge="end" variant="contained" color="secondary" onClick={handlerLogout}>
                        Logout
                    </Button>
                </Toolbar>
            </AppBar>
            <div style={{ margin: '10px auto 10px auto', padding : '10px'}}>
                {props.children}
            </div>

            {
              logout ? (
                <Redirect to='/login' />
              ) : ''
            }

        </Fragment>
     );

 }


 export default AppLayout;
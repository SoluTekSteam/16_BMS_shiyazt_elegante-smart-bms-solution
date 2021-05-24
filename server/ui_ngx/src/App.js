import React, { Fragement } from 'react';
import './App.css';
import {
  BrowserRouter as Router,
  Link,
  Switch,
  Route
} from 'react-router-dom';


//Components
import Login from './components/Login/Login';
import SignUp from './components/SignUp/SignUp';
import Home from './components/Home/Home';
import BuildingDetail from './components/BuildingDetail/BuildingDetail';
import FloorDetail from './components/FloorDetail/FloorDetail';
import DeviceDetail from './components/DeviceDetail/DeviceDetail';

import PrivateRoute from './components/AuthCenter/PrivateRoute/PrivateRoute';


function App() {
  return (
    <Router>
        <Switch>
          <Route exact path='/login' component={Login} />
          <Route exact path='/signup' component={SignUp} />
          <PrivateRoute exact path='/' component={Home} pg="all" />
          <PrivateRoute exact path='/building/:buildingid' component={BuildingDetail} pg="all" />
          <PrivateRoute exact path='/building/:buildingid/floor/:floorid' component={FloorDetail} pg="all" />
          <PrivateRoute exact path='/building/:buildingid/floor/:floorid/device/:deviceid' component={DeviceDetail} pg="all" />
        </Switch>
    </Router>
  );
}

export default App;

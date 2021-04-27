
const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');

const app = express();


// Initialize middlewares
app.use(cors());


app.use(express.json());

//Connect Database
connectDB();


// API Routes
app.use('/api/elegante/v1/user', require('./routes/api/users'));
app.use('/api/elegante/v1/building', require('./routes/api/buildings'));
app.use('/api/elegante/v1/floor', require('./routes/api/floors'));
app.use('/api/elegante/v1/device', require('./routes/api/devices'));


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`[INFO] Server started on port ${PORT} ...[OK]`));
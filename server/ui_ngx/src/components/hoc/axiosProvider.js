import axios from 'axios';

const instance = axios.create({
    baseURL: 'http://165.232.177.248/backend'
  });

export default instance;


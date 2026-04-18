import axios from 'axios';
import { SELLER_API_BASE_URL } from '../config';

const api = axios.create({
  baseURL: SELLER_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;

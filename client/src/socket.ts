import { io } from 'socket.io-client';
import { API_BASE_URL } from './config';

const SOCKET_URL = API_BASE_URL;

export const socket = io(SOCKET_URL, {
  autoConnect: true,
  reconnection: true,
});

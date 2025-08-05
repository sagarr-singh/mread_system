import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_API_SOCKET_URL;

export const createSocket = () => {
    return io(SOCKET_URL, {
        transports: ['websocket'],
        reconnection: true,
        reconnectionDelay: 1000,
    });
};

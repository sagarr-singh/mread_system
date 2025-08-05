
import io from "socket.io-client";
export class SocketService{
     socket;
    constructor(){
        this.socket = io(import.meta.env.VITE_API_SOCKET_URL, {
            transports: ['websocket'],
            reconnection: true,
            reconnectionDelay: 1000,
        });
    }
    connect() {
        return new Promise((resolve, reject) => {
            this.socket.on("connect", () => {
                console.log("✅ Socket connected successfully!");
                resolve();
            });
            this.socket.on("connect_error", (err) => {
                console.error("❌ Socket connection error:", err);
                reject(err);
            });
        });
    }
    
    disconnect() {
        this.socket.disconnect();
        console.log("Socket disconnected");
    }
}
export const socketService = new SocketService();
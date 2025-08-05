import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";

export const API = import.meta.env.VITE_API_URL;
export const ImgUrl = import.meta.env.VITE_API_URL_IMAGE;
export const SOCKET_URL = import.meta.env.VITE_API_SOCKET_URL;
export const AUTH_KEY = import.meta.env.VITE_AUTH_KEY;



const container = document.getElementById("root");
const root = createRoot(container);
root.render(
    <AuthProvider>
        <App />
    </AuthProvider>
);

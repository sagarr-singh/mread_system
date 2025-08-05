import { createContext, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(
        sessionStorage.getItem("isUserLoggedIn") === "true"
    );

    const login = () => {
        sessionStorage.setItem("isUserLoggedIn", "true");
        setIsLoggedIn(true);
        // useNavigate("/bill")
    };

    const logout = () => {
        sessionStorage.removeItem("isUserLoggedIn");
        sessionStorage.removeItem("user")
        setIsLoggedIn(false);
        toast.success("Logout Successfully");
    };

    useEffect(() => {
        const checkLoginStatus = () => {
            const loggedIn = sessionStorage.getItem("isUserLoggedIn") === "true";
            setIsLoggedIn(loggedIn);
        };

        window.addEventListener("storage", checkLoginStatus);
        return () => window.removeEventListener("storage", checkLoginStatus);
    }, []);

    return (
        <AuthContext.Provider value={{ isLoggedIn, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);

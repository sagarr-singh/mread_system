import React from "react";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
    const isLoggedIn = sessionStorage.getItem("isUserLoggedIn") === "true";
    return isLoggedIn ? children : <Navigate to="/auth/login" />;
};


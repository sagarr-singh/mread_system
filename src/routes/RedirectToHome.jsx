import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function RedirectToHome() {
    const navigate = useNavigate();

    useEffect(() => {
        const isLoggedIn = sessionStorage.getItem("isUserLoggedIn") === "true";
        navigate(isLoggedIn ? "/bill" : "/auth/login");
    }, [navigate]);

    return null;
};


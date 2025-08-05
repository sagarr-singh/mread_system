import React, { useEffect, useState } from 'react'
import { BiLogOutCircle } from "react-icons/bi";
import { FaRegUserCircle } from "react-icons/fa";
import { API } from '../main';
import { useAuth } from '../context/AuthContext';

export default function Logout() {
    const [data, setData] = useState({});
    const [dateTime, setDateTime] = useState();
    const { user, logout } = useAuth()

    // const handleLogout = () => {
    //     sessionStorage.removeItem("isUserLoggedIn");
    //     window.location.href = "/auth/login";
    // };

    useEffect(() => {
        const getDateTime = async () => {
            try {
                const res = await fetch(`${API}/login/getDateTime`);
                const result = await res.json();
                const serverTime = new Date(result.TimeDate);
                setDateTime(serverTime);
                setData(result);
            } catch (error) {
                console.error("Error loading date", error);
            }
        };
        getDateTime();
    }, []);



    useEffect(() => {
        if (!dateTime) return;

        const interval = setInterval(() => {
            setDateTime((prevTime) => new Date(prevTime.getTime() + 1000));
        }, 1000);

        return () => clearInterval(interval);
    }, [dateTime]);

    // const formatDate = dateTime
    //     ? dateTime.toLocaleString('en-GB').replace(',', ' |')
    //     : '';



    const formatDate = dateTime ? dateTime.toLocaleString('en-GB').replace(',', ' |') : "";
    const GetUser = sessionStorage.getItem("user")



    return (
        <header className="w-full h-auto bg-white flex flex-row justify-end items-center px-4 py-2 shadow z-40 text-xs sm:text-sm">
            <div className="flex items-center gap-3 text-gray-700 font-medium whitespace-nowrap overflow-hidden">
                <span className="truncate">{formatDate}</span>
                <div className="flex items-center gap-1 truncate">
                    <FaRegUserCircle className="text-base sm:text-lg" />
                    <span className="truncate">{GetUser}</span>
                </div>
            </div>

            <button
                onClick={logout}
                className="flex items-center gap-1 ml-4 bg-red-500 hover:bg-red-600 text-white font-medium px-3 py-1.5 rounded-md shadow-sm transition duration-200 text-xs sm:text-sm whitespace-nowrap"
            >
                <BiLogOutCircle className="text-base sm:text-lg" />
                Logout
            </button>
        </header>

    );
}

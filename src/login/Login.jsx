import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import backgroundImg from '../assets/bg.png';
import mglLogo from '../assets/mgl.jpg';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();
    const { login } = useAuth()

    const validate = () => {
        const err = {};
        if (!email.trim()) err.email = 'User ID is required';
        if (!password.trim()) err.password = 'Password is required';
        setErrors(err);
        return Object.keys(err).length === 0;
    };

    const onFormSubmit = () => {
        if (!validate()) return;

        const isValidUser =
            (email === 'Admin' && password === '@dm!n') ||
            (email === 'TR1' && password === 'T@R1') ||
            (email === 'TR2' && password === 'T@R2') ||
            (email === 'TR3' && password === 'T@R3') ||
            (email === 'TR4' && password === 'T@R4') ||
            (email === 'TR5' && password === 'T@R5') ||
            (email === 'RL1' && password === '1');

        if (isValidUser) {
            sessionStorage.setItem("user", email)
            login(email)
            toast.success("Login Successfully")
            navigate('/bill');
        } else {
            toast.error('Invalid credentials');
        }
    };


    return (
        <div className='responsive-controls'>
            <div
                className="w-screen h-screen bg-cover bg-center flex items-center justify-center"
                style={{ backgroundImage: `url(${backgroundImg})`, height: '100vh' }}
                onKeyDown={(e) => e.key === 'Enter' && onFormSubmit()}
                tabIndex={0}
            >
                <div className="bg-white text-black shadow-xl rounded-xl p-5 w-full max-w-md text-center">
                    <h2 className="text-2xl  bg-amber-500 font-semibold mb-6">Meter Reading System</h2>
                    <img src={mglLogo} alt="MGL Logo" className="mx-auto w-24 h-24 mb-4" />

                    <div className="mb-4 text-left">
                        <input
                            type="text"
                            value={email}
                            placeholder="User ID"
                            className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                    </div>

                    <div className="mb-4 text-left">
                        <input
                            type="password"
                            value={password}
                            placeholder="Password"
                            className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                    </div>

                    <button
                        onClick={onFormSubmit}
                        className="w-full bg-blue-500 text-white py-2 rounded transition duration-150"
                    >
                        Log In
                    </button>
                </div>
            </div>
        </div>
    );
}

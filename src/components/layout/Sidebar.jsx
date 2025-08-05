import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    FaBars,
    FaSearch,
    FaUpload,
    FaImage,
    FaListAlt,
    FaFileAlt,
    FaImages,
    FaShare,
} from 'react-icons/fa';

export default function TailwindSidebar() {
    const [collapsed, setCollapsed] = useState(false);
    const location = useLocation();

    const menuItems = [
        // { path: '/ipa', icon: <FaImages />, label: 'Meter Reading Verify' },


        { path: '/bill', icon: <FaSearch />, label: 'Search Bill By Month' },
        { path: '/ocrmeterreading', icon: <FaImage />, label: 'OCR Meter Reading' },
        { path: '/upload', icon: <FaUpload />, label: 'Upload & Send Data' },
        { path: '/notupload', icon: <FaFileAlt />, label: 'Not Uploaded Record' },
        // { path: '/ocrstatus', icon: <FaShare />, label: 'OCR Status' },
        { path: '/summary', icon: <FaListAlt />, label: 'Bill Summary' },
    ];

    return (
        <div className="flex">
            <div
                className={`bg-white border-r border-gray-300 min-h-screen transition-all duration-300 ${collapsed ? 'w-20' : 'w-70'
                    }`}
            >
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-300">
                    <button onClick={() => setCollapsed(!collapsed)} className="text-black text-xl">
                        <FaBars />
                    </button>
                    {!collapsed && (
                        <img
                            src="https://mread.in/Panel/assets/images/logo.png"
                            alt="Logo"
                            className="h-8"
                            style={{ width: '160px', height: 'auto' }}
                        />
                    )}
                </div>

                <nav className="mt-1">
                    {menuItems.map(({ path, icon, label }) => {
                        const isActive = location.pathname === path;
                        return (
                            <Link
                                key={path}
                                to={path}
                                className={`flex items-center px-4 py-3 space-x-3 text-black font-extrabold hover:bg-gray-100 transition ${isActive ? 'bg-blue-100 border-l-4 border-blue-500 text-blue-700' : ''
                                    }`}
                            >
                                <span className="text-lg">{icon}</span>
                                {!collapsed && <span className="whitespace-nowrap">{label}</span>}
                            </Link>
                        );
                    })}
                </nav>
            </div>


        </div>
    );
}

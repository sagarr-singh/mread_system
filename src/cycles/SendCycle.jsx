import React, { useState } from "react";

export default function SendCycle() {
    const [cycleName, setCycleName] = useState("");
    const [selectedDate, setSelectedDate] = useState("");

    const handleDateChange = (e) => {
        const date = e.target.value;
        setSelectedDate(date);
        // console.log("Selected date:", date);
    };

    const handleFetchAndSend = () => {
        console.log("Cycle Name:", cycleName);
        console.log("Date to Send:", selectedDate);
        // API call
    };

    return (
        <div className="responsive-controls">
            <div className="p-6 bg-gray-100 min-h-screen flex flex-1 overflow-y-scroll scrollbar-hide x-scrollbar-">
                <div className="flex-1 w-full h-fit bg-white rounded-xl shadow-md border border-gray-200 p-6">
                    <div className="bg-gray-500 text-white text-2xl font-bold px-4 py-2 rounded mb-6 shadow">
                        Cyclewise Bill Sending
                    </div>

                    <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg mb-6">
                        <div className="flex justify-start">
                            <div className="min-w-[500px] overflow-hidden text-start">
                                <label className="block text-xl font-medium mb-1 text-gray-700">
                                    Enter Cycle Name
                                </label>
                                <input
                                    type="text"
                                    value={cycleName}
                                    onChange={(e) => setCycleName(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                                    placeholder="Enter Cycle Name"
                                />

                                <br />

                                <label className="block text-xl font-medium mb-1 text-gray-700 mt-4">
                                    Select Date
                                </label>
                                <input
                                    type="date"
                                    value={selectedDate}
                                    onChange={handleDateChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                                />

                                <br />

                                <button
                                    className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded mt-4"
                                    type="button"
                                    onClick={handleFetchAndSend}
                                >
                                    Fetch & Send
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

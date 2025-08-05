import React, { useEffect, useState } from "react";
import { API, AUTH_KEY, ImgUrl } from "../main";
import Spinner from "../spinner";
import { useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { Select } from 'antd';


export default function ImagesIpa() {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState([]);
    const [dateList, setDateList] = useState([]);
    const [sendingDate, setSendingDate] = useState("");
    const [expiryDate, setExpiryDate] = useState("");
    const [pendingSaves, setPendingSaves] = useState([]);
    const [savedItems, setSavedItems] = useState([]);
    const { search } = useLocation();

    const { Option } = Select;


    const authKey = new URLSearchParams(search).get("authKey");


    if (authKey !== AUTH_KEY || !authKey) {
        return <p className="text-center text-red-600 font-semibold mt-10">UnAuthorized Page Access</p>;
    }



    useEffect(() => {
        const fetchDates = async () => {
            try {
                setLoading(true);
                const res = await fetch(`${API}/meterread/getScheduleDate`);
                const result = await res.json();
                setDateList(result);
            } catch (error) {
                console.error("Error loading date list", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDates();
    }, []);



    const fetchImages = async () => {
        if (!sendingDate) return;
        try {
            setLoading(true);
            const res = await fetch(`${API}/meterread/getImageData`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ scheduleDate: sendingDate }),
            });
            const result = await res.json();
            setData(result);
            setExpiryDate(result[0]?.reading_expiry_date || "NA");
            // toast("Fetched Images Successfully")
        } catch (error) {
            console.error("Error loading image data", error);
        } finally {
            setLoading(false);
        }
    };



    useEffect(() => {
        fetchImages(sendingDate);
        const stored = localStorage.getItem("pendingSaves");
        if (stored) {
            const parsed = JSON.parse(stored);
            setPendingSaves(parsed);
            setSavedItems(parsed.map(item => item.imageName));
        }
    }, [sendingDate]);



    const handleReadingChange = (index, value, field) => {
        const updated = [...data];
        updated[index][field] = value;
        setData(updated);
    };




    const handleIndividualSave = (image) => {
        const entry = {
            ocrReading: image.ocr_reading_result,
            ocrMeterNo: image.ocr_number_result,
            imageName: image.unique_link,
            user: sessionStorage.getItem("user"),
        };

        setPendingSaves(prev => {
            let updated;
            const exists = prev.find(item => item.imageName === entry.imageName);
            updated = exists
                ? prev.map(item => item.imageName === entry.imageName ? entry : item)
                : [...prev, entry];

            localStorage.setItem("pendingSaves", JSON.stringify(updated));

            return updated;
        });

        setSavedItems(prev => [...new Set([...prev, image.unique_link])]);
        // console.log("Saved Readings:", [image.unique_link, image.ocr_reading_result, image.ocr_number_result]);
    };




    const handleBulkSave = async () => {
        // if (pendingSaves.length === 0) {
        //     toast("Nothing to save.");
        //     return;
        // }

        try {
            setLoading(true);

            const response = await fetch(`${API}/meterread/saveReadingInfo`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ readings: pendingSaves }),
            });

            let result = null;
            const text = await response.text();

            try {
                result = JSON.parse(text);
            } catch (parseErr) {
                console.error("Response not valid JSON:", text);
                toast.error("Server error: Invalid response format.");
                return;
            }

            if (result?.result === "Success") {
                toast.success("All readings saved successfully");
                setPendingSaves([]);
                localStorage.removeItem("pendingSaves");
                setSavedItems([])
                await fetchImages();
            } else {
                toast.error("Save failed. Try again.");
            }
        } catch (err) {
            console.error("Error saving readings:", err);
            toast.error("Error saving readings.");
        } finally {
            setLoading(false);
        }
    };




    // const updateData = async (reading, meter, imageName,) => {
    //     try {
    //         setLoading(true);
    //         const response = await fetch(`${API}/meterread/saveReadingInfo`, {
    //             method: "POST",
    //             headers: { "Content-Type": "application/json" },
    //             body: JSON.stringify({
    //                 ocrReading: reading,
    //                 ocrMeterNo: meter,
    //                 imageName: imageName,
    //                 user: sessionStorage.getItem("user")
    //             }),
    //         });

    //         const result = await response.json();

    //         if (result?.result === "Success") {
    //             toast("Data Saved successfully");
    //             await fetchImages(sendingDate);
    //         } else {
    //             toast("Failed to save. Try again.");
    //         }
    //     } catch (error) {
    //         console.error("Save failed:", error);
    //     } finally {
    //         setLoading(false);
    //     }
    // };

    return (
        <div className="responsive-controls">
            <div className="p-6 bg-gray-100 min-h-screen flex flex-1  overflow-y-scroll scrollbar-hide x-scrollbar-">
                <div className="flex-1 w-full h-fit bg-white rounded-xl shadow-md border border-gray-200 p-6">
                    <div className="bg-gray-500 text-white text-2xl font-bold px-4 py-2 rounded mb-6 shadow">
                        Verify Meter Readings
                    </div>


                    <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg mb-6 space-y-4">
                        <div className="flex flex-wrap gap-4 items-end">
                            <div className="w-[40%] min-w-[220px]">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Select Schedule Date:
                                </label>

                                <Select
                                    showSearch
                                    optionFilterProp="children"
                                    className="w-full"
                                    value={sendingDate}
                                    onChange={(value) => setSendingDate(value)}
                                >
                                    <Option value="">--Select Date</Option>
                                    {dateList.map((item, i) => (
                                        <Option key={i} value={item.sending_date}>
                                            {item.sending_date}
                                        </Option>
                                    ))}
                                </Select>
                            </div>


                            {data.length > 0 && (
                                <>
                                    <div className="min-w-[250px] flex-1">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date:</label>
                                        <input
                                            type="text"
                                            className="w-full border px-2 py-1 rounded bg-gray-100"
                                            value={expiryDate}
                                            disabled
                                        />
                                    </div>
                                    <div className="min-w-[250px] flex-1">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Total Meter Readings:</label>
                                        <input
                                            type="text"
                                            className="w-full border px-2 py-1 rounded bg-gray-100"
                                            value={data.length}
                                            disabled
                                        />
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {loading ? (
                        <Spinner />
                    ) : data.length > 0 ? (
                        <div className="flex flex-wrap -mx-3">
                            {data.map((image, index) => {
                                const imagePath = image.meter_image_path?.split("/public_html")[1];
                                const fullImageUrl = `${ImgUrl}${imagePath}`;

                                return (
                                    <div key={index} className="w-full md:w-1/3 px-3 mb-6">
                                        <div className="relative border rounded shadow p-4 bg-white h-full flex flex-col">
                                            {savedItems.includes(image.unique_link) && (
                                                <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded shadow">
                                                    ✅ Saved
                                                </div>
                                            )}

                                            <img
                                                src={fullImageUrl}
                                                alt="meter"
                                                className="w-full h-[180px] object-cover rounded mb-4 transition-transform duration-300 hover:scale-205"
                                                loading="lazy"
                                            />
                                            <br />

                                            <a
                                                className="block w-full text-center bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 rounded mb-2"
                                                href={fullImageUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                Open Image
                                            </a>

                                            <label className="block text-sm font-semibold mt-2">METER READING:</label>
                                            <input
                                                type="text"
                                                className="w-full border px-2 py-1 rounded"
                                                maxLength={30}
                                                value={image.ocr_reading_result}
                                                onChange={(e) => handleReadingChange(index, e.target.value, "ocr_reading_result")}
                                            />

                                            <label className="block text-sm font-semibold mt-3">METER NUMBER:</label>
                                            <input
                                                type="text"
                                                className="w-full border px-2 py-1 rounded"
                                                maxLength={30}
                                                value={image.ocr_number_result}
                                                onChange={(e) => handleReadingChange(index, e.target.value, "ocr_number_result")}
                                            />

                                            <br />

                                            <button
                                                type="button"
                                                className="block w-full text-center bg-gray-700 hover:bg-gray-800 text-white font-semibold py-2 rounded transition-colors duration-200 mb-2"
                                                onClick={() => handleIndividualSave(image)}

                                            >
                                                Save
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                            <div className="w-full px-3 mt-4">
                                <button
                                    type="button"
                                    className="block save-all w-full text-center bg-red-600 hover:bg-blue-700 text-white font-semibold py-3 rounded transition-colors duration-200"
                                    onClick={handleBulkSave}
                                    disabled={loading}
                                >
                                    {loading ? "Saving..." : "Save All"}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <p className="text-center text-gray-500 mt-6">No data available for the selected date.</p>
                    )}
                </div>
            </div>
        </div>
    );

}

import React, { useEffect, useState } from "react";
import { API } from "../main";
import Spinner from "../spinner";
import { useSearchParams } from "react-router-dom";
import { IoMdArrowBack } from "react-icons/io";
import { Select } from 'antd';

export default function BillDetailSummaryTable() {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [Dates, setDates] = useState([]);
    const [record, setRecord] = useState([])
    const [currentPage, setCurrentPage] = useState(1);
    const [searchParams] = useSearchParams();
    const initialScheduleDate = searchParams.get("selectionD") || "";
    const [scheduleDate, setScheduleDate] = useState(initialScheduleDate);
    const [showList, setShowList] = useState(false)

    const { Option } = Select;

    const itemsPerPage = 10;
    const safeFiltered = Array.isArray(record) ? record : [];
    const totalPages = Math.ceil(safeFiltered.length / itemsPerPage);
    const paginatedData = safeFiltered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);


    useEffect(() => {
        const fetchDateList = async (str_date) => {
            try {
                const res = await fetch(`${API}/Bill/getdates`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ str_date }),
                });

                const result = await res.json();
                setData(result);
                // setScheduleDate(result)
                setDates(result);
                setFiltered(result);
            } catch (error) {
                console.error("Error loading date list", error);
            }
        };

        const loadData = async (selectedMonth) => {
            setLoading(true);
            try {
                const res = await fetch(`${API}/Bill/getRecordDetail`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ str_selectedMonth: selectedMonth }),
                });
                const result = await res.json();
                setData(result);
                setRecord(result)
                setFiltered(result);
                setCurrentPage(1);
            } catch (err) {
                console.error("Error loading:", err);
            } finally {
                setLoading(false);
            }
        };

        if (scheduleDate.includes("'")) {
            setShowList(true);
            fetchDateList(scheduleDate);
        } else {
            setShowList(true);
            loadData(scheduleDate);

        }
    }, [scheduleDate]);


    return (
        <div className="responsive-controls">
            <div className="p-6 bg-gray-100 min-h-screen flex flex-1  overflow-y-scroll scrollbar-hide x-scrollbar-">
                <div className="flex-1 w-full h-fit bg-white rounded-xl shadow-md border border-gray-200 p-6">
                    <h2 className="bg-gray-500 text-white text-2xl font-bold px-4 py-2 rounded mb-6 shadow">
                        Bill Details :- {scheduleDate}
                    </h2>


                    {initialScheduleDate.includes("'") && (
                        <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg mb-6">
                            <div className="flex justify-center">
                                <div className="min-w-[300px] text-center">
                                    <label className="block text-sm font-bold mb-1 text-gray-700">
                                        Select Bill Date
                                    </label>
                                    <Select
                                        className="w-full"
                                        value={scheduleDate}
                                        showSearch
                                        onChange={(value) =>
                                            setScheduleDate(value)
                                        }
                                    >
                                        <Option value="">--Select Date</Option>
                                        {Dates.map((item, i) => (
                                            <Option key={i} value={item.sending_date}>
                                                {item.sending_date}
                                            </Option>
                                        ))}
                                    </Select>
                                </div>
                            </div>
                        </div>
                    )}



                    <div className="flex justify-start items-center gap-4 mb-4">
                        <button
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                            className="px-3 py-1 bg-gray-200 text-sm rounded disabled:opacity-50"
                        >
                            Prev
                        </button>
                        <span className="text-sm">
                            Page {currentPage} of {totalPages || 1}
                        </span>
                        <button
                            disabled={currentPage === totalPages}
                            onClick={() =>
                                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                            }
                            className="px-3 py-1 bg-gray-200 text-sm rounded disabled:opacity-50"
                        >
                            Next
                        </button>

                        <div className="font-bold">Total Data: {data.length}</div>
                    </div>

                    {loading && !scheduleDate.includes("'") ? (
                        <Spinner />
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full table-auto border border-gray-300 rounded-lg shadow-sm">
                                <thead className="bg-gray-200 text-sm">
                                    <tr>
                                        {["Schedule Date",
                                            "Sent",
                                            "Viewed",
                                            "OCR",
                                            "Delivered",
                                            "Customer Image Received"
                                        ].map((heading, i) => (
                                            <th
                                                key={i}
                                                className="p-3 border border-gray-200 text-left font-semibold"
                                            >
                                                {heading}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedData.map((d, i) => (
                                        <tr key={i} className="border-b hover:bg-gray-50">
                                            <td className="p-3 border border-gray-100">{d.sending_date}</td>
                                            <td className="p-3 border border-gray-100">{d.sent_flag}</td>
                                            <td className="p-3 border border-gray-100">{d.viewed_flag}</td>
                                            <td className="p-3 border border-gray-100">{d.ocr_flag}</td>
                                            <td className="p-3 border border-gray-100">{d.delivered_flag}</td>
                                            <td className="p-3 border border-gray-100">{d.cust_reading_rec_flag}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            <div className="flex justify-center mt-4">
                                <button
                                    type="button"
                                    className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white font-medium px-4 py-2 rounded-lg shadow-md transition duration-200"
                                    onClick={() => window.history.back()}
                                >
                                    <IoMdArrowBack className="text-lg" />
                                    Close
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

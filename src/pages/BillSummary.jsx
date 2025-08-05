import React, { useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { API } from "../main";
import Spinner from "../spinner";
import { EyeIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
import { Select } from 'antd';

export default function BillSummary() {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [billingMonths, setBillingMonths] = useState([]);
    const [selectedMonth, setSelectedMonth] = useState();
    const [currentPage, setCurrentPage] = useState(1);
    const [excelLoading, setExcelLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const [summary, setSummary] = useState({
        Total_Sent: 0,
        Total_Delivered: 0,
        Total_Viewed: 0,
        Total_OCR: 0,
        Total_CustomerReview: 0,
    });

    const navigate = useNavigate()
    const { Option } = Select;


    const safeFiltered = useMemo(() => Array.isArray(filtered) ? filtered : [], [filtered]);

    const itemsPerPage = 10;

    const totalPages = useMemo(() => {
        return Math.ceil(safeFiltered.length / itemsPerPage);
    }, [safeFiltered.length]);

    const paginatedData = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        const end = currentPage * itemsPerPage;
        return safeFiltered.slice(start, end);
    }, [currentPage, itemsPerPage, safeFiltered]);

    const filter1stColumn = useMemo(() => (
        selectedMonth === "All" ? "Month-Year" : "Schedule-Date"
    ), [selectedMonth]);


    useEffect(() => {
        const fetchMonth = async () => {
            try {
                // setLoading(true);
                const response = await fetch(`${API}/Bill/MonthList`);
                const data = await response.json();
                setBillingMonths(data);
                setSelectedMonth(data[0].month);
            } catch (error) {
                console.error("Error fetching billing months:", error);
            } finally {
                // setLoading(false);
            }
        };
        fetchMonth();
    }, []);


    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const res = await fetch(`${API}/Bill/getSumRecordDetail`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ str_selectedMonth: selectedMonth }),
                });

                const result = await res.json();
                const raw = result.sum || [];

                setData(raw);
                setFiltered(raw);
                setCurrentPage(1);

                setSummary({
                    Total_Sent: result.sum_sent,
                    Total_Delivered: result.sum_del,
                    Total_Viewed: result.sum_view,
                    Total_OCR: result.sum_ocr,
                    Total_CustomerReview: result.sum_cust,
                });
            } catch (err) {
                console.error("Error loading:", err);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [selectedMonth]);





    const exportCSV = async () => {
        if (filtered.length === 0) {
            toast.error("No data to export");
            return;
        }


        setExcelLoading(true);

        await new Promise((resolve) => setTimeout(resolve, 300));

        try {
            const ws = XLSX.utils.json_to_sheet(filtered);
            const csv = XLSX.utils.sheet_to_csv(ws);
            const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
            saveAs(blob, "Sum_Record_Detail.csv");
        } catch (error) {
            console.error("❌ Error exporting CSV:", error);
        } finally {
            setExcelLoading(false);
        }
    };


    const handleMonthChange = (value) => {
        setSelectedMonth(value);
    };


    const viewDetails = (row) => {
        const encodedMonth = encodeURIComponent(row.Dates);
        navigate(`/BillDetailSummary?selectionD=${encodedMonth}`);
    };


    // const filter1stColumn = selectedMonth === "All"
    //     ? "Month-Year"
    //     : "Schedule-Date";

    useEffect(() => {
        if (!searchQuery) {
            setFiltered(data);
            return;
        }

        const query = searchQuery.toLowerCase();
        const results = data.filter((item) =>
            item?.Dates?.toLowerCase().includes(query) ||
            item?.Total_Sent?.toString().includes(query) ||
            item?.Total_Delivered?.toString().includes(query) ||
            item?.Total_Viewed?.toString().includes(query) ||
            item?.Total_CustomerReview?.toString().includes(query)
        );
        setFiltered(results);
        setCurrentPage(1);
    }, [searchQuery, data]);



    return (
        <div className="responsive-controls">
            <div className="p-6 bg-gray-100 min-h-screen flex flex-1  overflow-y-scroll scrollbar-hide x-scrollbar-">
                <div className="flex-1 w-full h-fit bg-white rounded-xl shadow-md border border-gray-200 p-6">
                    <div className="bg-gray-500 text-white text-2xl font-bold px-4 py-2 rounded mb-6 shadow">
                        Bill Summary
                    </div>

                    <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg mb-6">
                        <div className="flex justify-center">
                            <div className="min-w-[300px] text-center">
                                <label className="block text-sm font-bold mb-1 text-gray-700">
                                    Select Month
                                </label>
                                {selectedMonth && (
                                    <Select
                                        value={selectedMonth}
                                        onChange={value => {
                                            handleMonthChange(value)
                                        }}
                                        className="w-full"
                                        placeholder="Select Month"
                                        showSearch
                                    >
                                        <Option value="All">All</Option>
                                        {billingMonths.map((item, index) => (
                                            <Option key={`${item.month}-${index}`} value={item.month}>
                                                {item.month}
                                            </Option>
                                        ))}
                                    </Select>
                                )}
                            </div>
                        </div>
                    </div>

                    {loading ? (
                        <Spinner />
                    ) : (
                        <div className="bg-gray-100 p-6 rounded shadow mb-6">
                            <h2 className="text-lg font-semibold mb-4">Summations:</h2>
                            <div className="flex flex-col gap-3 text-sm">
                                <div>
                                    <span className="font-semibold">Sent:</span> {summary.Total_Sent}
                                </div>
                                <div>
                                    <span className="font-semibold">Delivered:</span> {summary.Total_Delivered}
                                </div>
                                <div>
                                    <span className="font-semibold">Viewed:</span> {summary.Total_Viewed}
                                </div>
                                <div>
                                    <span className="font-semibold">OCR:</span> {summary.Total_OCR}
                                </div>
                                <div>
                                    <span className="font-semibold">Total Customer Image Received:</span> {summary.Total_CustomerReview}
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


                        <div className="flex flex-row ml-auto flex-wrap gap-4 mb-4">
                            <div className="min-w-[300px]">
                                <label className="text-sm font-extrabold mr-2 mb-1">Search :</label>
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="flex-1 border px-3 py-2 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                    </div>

                    {loading ? (
                        <Spinner />
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full table-auto border border-gray-300 rounded-lg shadow-sm">
                                <thead className="bg-gray-200 text-sm">
                                    <tr>
                                        {[filter1stColumn, "Total Sent", "Total Viewed", "Total OCR", "Total Delivered", "Customer Images", "Action"].map((heading, i) => (
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
                                            <td className="p-3 border border-gray-100">{d.Dates}</td>
                                            <td className="p-3 border border-gray-100">{d.Total_Sent}</td>
                                            <td className="p-3 border border-gray-100">{d.Total_Viewed}</td>
                                            <td className="p-3 border border-gray-100">{d.Total_OCR}</td>
                                            <td className="p-3 border border-gray-100">{d.Total_Delivered}</td>
                                            <td className="p-3 border border-gray-100">{d.Total_CustomerReview}</td>
                                            <td className="p-3 border border-gray-100">
                                                <button
                                                    className="text-blue-600 hover:text-blue-800"
                                                    onClick={() => viewDetails(d)}
                                                    title="View Detail"
                                                >
                                                    <EyeIcon className="h-5 w-5 inline" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <br />
                            <div className="flex justify-end">
                                {excelLoading ? (
                                    <Spinner />
                                ) : (
                                    <button
                                        onClick={exportCSV}
                                        className="bg-amber-600 text-white px-4 py-2 text-sm rounded hover:bg-amber-700"
                                    >
                                        Export to CSV
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div >
    );
}

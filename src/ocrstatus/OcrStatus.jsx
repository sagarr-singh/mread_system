import React, { useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { API } from "../main";
import Spinner from "../spinner";
import DataTable from "react-data-table-component";

export default function OCRStatus() {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState("");

    const itemsPerPage = 10;

    const safeFiltered = useMemo(() => {
        const q = searchQuery.toLowerCase();

        return data.filter((d) =>
            d.sending_date?.toString().includes(q) ||
            d.CustReadFlag?.toString().includes(q) ||
            d.reading_expiry_date?.toString().includes(q)
        );
    }, [data, searchQuery]);

    const totalPages = useMemo(() => {
        return Math.ceil(safeFiltered.length / itemsPerPage);
    }, [safeFiltered.length]);

    const paginatedData = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        const end = currentPage * itemsPerPage;
        return safeFiltered.slice(start, end);
    }, [currentPage, itemsPerPage, safeFiltered]);


    useEffect(() => {
        const fetchOCRStatus = async () => {
            try {
                setLoading(true);
                const res = await fetch(`${API}/meterread/getOCRStatus`);
                const result = await res.json();
                setData(result);
            } catch (error) {
                console.error("Error loading File list", error);
            } finally {
                setLoading(false);
            }
        };
        fetchOCRStatus();
    }, []);


    return (
        <div className="responsive-controls">
            <div className="p-6 bg-gray-100 min-h-screen flex flex-1  overflow-y-scroll scrollbar-hide x-scrollbar-">
                <div className="flex-1 w-full h-fit bg-white rounded-xl shadow-md border border-gray-200 p-6">
                    <h2 className="bg-gray-500 text-white text-2xl font-bold px-4 py-2 rounded mb-6 shadow">
                        OCR Status
                    </h2>

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

                        Total Data: {safeFiltered.length}


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
                                        {[
                                            "Schedule Date",
                                            "Customer Reading Flag",
                                            "Reading Expiry Date"
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
                                            <td className="p-3 border border-gray-100">{d.CustReadFlag}</td>
                                            <td className="p-3 border border-gray-100">{d.reading_expiry_date}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

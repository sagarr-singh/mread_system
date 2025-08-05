import React, { useEffect, useMemo, useState } from "react";
import { EyeIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";

export default function BillingTable({
    fetchBillingData,
    selectedMonth,
    selectedGroup,
}) {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState("");


    const navigate = useNavigate();

    const viewDetails = (row) => {
        const encodedMonth = encodeURIComponent(selectedMonth);
        const encodedGroup = encodeURIComponent(row.sending_date);

        navigate(`/MeterReading?billgroup=${encodedGroup}&month=${encodedMonth}`);
    };




    const itemsPerPage = 10;

    const safeFiltered = useMemo(() => {
        const q = searchQuery.toString();

        return data.filter((d) =>
            d.sending_date?.toString().includes(q) ||
            d.Sent?.toString().includes(q) ||
            d.Viewed?.toString().includes(q) ||
            d.Delivered?.toString().includes(q)
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
        const loadData = async () => {
            if (!selectedMonth || !selectedGroup) return;

            setLoading(true);
            const result = await fetchBillingData(selectedMonth, selectedGroup);
            setData(result || []);
            setLoading(false);
        };

        loadData();
    }, [selectedMonth, selectedGroup, fetchBillingData]);


    return (
        <>
            <div className="responsive-controls">
                <div className="flex-1 w-full h-fit bg-white rounded-xl shadow-md border border-gray-200 p-6">

                    <div className="flex justify-start items-center gap-4 mb-4">
                        <button
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                            className="px-3 py-1 bg-gray-200 text-sm rounded disabled:opacity-50"
                        >
                            Prev
                        </button>
                        <span className="text-sm">
                            Page {currentPage} of {totalPages}
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

                        <div className="font-bold">Total Data: {safeFiltered.length}</div>

                        <div className="flex flex-row ml-auto flexjustify-end flex-wrap gap-4 mb-2">
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
                </div>



                <div className="overflow-x-auto border border-gray-200 rounded-lg shadow">
                    <table className="min-w-full table-auto border border-gray-300 rounded-lg shadow-sm">
                        <thead className="bg-gray-200 text-sm thead">
                            <tr>
                                <th className="px-4 py-3">Schedule Date</th>
                                <th className="px-4 py-3">Sent</th>
                                <th className="px-4 py-3">Delivered</th>
                                <th className="px-4 py-3">Viewed</th>
                                <th className="px-4 py-3">Reading Received</th>
                                <th className="px-4 py-3">Reading Delivery %</th>
                                <th className="px-4 py-3">Reading Viewed %</th>
                                <th className="px-4 py-3 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={8} className="text-center py-6 text-gray-400">
                                        Loading data...
                                    </td>
                                </tr>
                            ) : paginatedData.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="text-center py-6 text-gray-400">
                                        No billing records found.
                                    </td>
                                </tr>
                            ) : (
                                paginatedData.map((row, index) => (
                                    <tr key={index} className="hover:bg-gray-50">
                                        <td className="p-3 border border-gray-100">
                                            {row.sending_date}</td>
                                        <td className="p-3 border border-gray-100">
                                            {row.Sent}</td>
                                        <td className="p-3 border border-gray-100">
                                            {row.Delivered}</td>
                                        <td className="p-3 border border-gray-100">
                                            {row.Viewed}</td>
                                        <td className="p-3 border border-gray-100">
                                            {row.ReadRec}</td>
                                        <td className="p-3 border border-gray-100">

                                            {row.Delivered
                                                ? ((row.Delivered / row.Sent) * 100).toFixed(2)
                                                : "0.00"}
                                            %
                                        </td>
                                        <td className="px-4 py-2">
                                            {row.Viewed
                                                ? ((row.Viewed / row.Delivered) * 100).toFixed(2)
                                                : "0.00"}
                                            %
                                        </td>
                                        <td className="px-4 py-2 text-right">
                                            <button
                                                className="text-blue-600 hover:text-blue-800"
                                                onClick={() => viewDetails(row)}
                                                title="View"
                                            >
                                                <EyeIcon className="h-5 w-5 inline" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}

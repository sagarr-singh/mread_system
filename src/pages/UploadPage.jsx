import React, { useEffect, useState, useRef, useMemo } from "react";
import Spinner from "../spinner";
import { SOCKET_URL } from "../main";
import { socketService } from "../sockets";
import toast from "react-hot-toast";

export default function UploadPage() {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 10;
    const fileProgress = useRef({});
    const dataRef = useRef([]);


    useEffect(() => {
        dataRef.current = data;
    }, [data]);

    const paginatedData = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        const end = start + ITEMS_PER_PAGE;
        return data.slice(start, end);
    }, [data, currentPage]);



    const loadData = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${SOCKET_URL}/uploadFile/getNoOfFilesCount`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ intOff: 1 }),
            });
            const result = await res.json();
            setData(Array.isArray(result.files) ? result.files : []);
        } catch (err) {
            console.error("Error loading data:", err);
        } finally {
            setLoading(false);
        }
    };


    const handleInserted = (data) => {
        console.log("Inserted:", data);
        fileProgress.current[data.filename] = {
            ...fileProgress.current[data.filename],
            Inserted: data.Inserted,
        };

        const inserted = data.Inserted ?? 0;
        const notInserted = fileProgress.current[data.filename]?.NotInserted ?? 0;
        const total = Number(data.total);

        const isDone = inserted + notInserted === total;

        setData((prev) =>
            prev.map((file) =>
                file.FileName === data.filename
                    ? {
                        ...file,
                        ProcessedCount: inserted,
                        NoOfReading: total,
                        Status: isDone ? "Done" : file.Status,
                    }
                    : file
            )
        );

        if (isDone) checkFileUploaded(total, inserted, notInserted, data.filename);
    };


    const handleNotInserted = (data) => {
        console.log("NotInserted:", data);
        fileProgress.current[data.filename] = {
            ...fileProgress.current[data.filename],
            NotInserted: data.NotInserted,
        };

        const inserted = fileProgress.current[data.filename]?.Inserted ?? 0;
        const notInserted = data.NotInserted ?? 0;
        const total = Number(data.total);

        const isDone = inserted + notInserted === total;

        setData((prev) =>
            prev.map((file) =>
                file.FileName === data.filename
                    ? {
                        ...file,
                        NotInserted: notInserted,
                        Status: isDone ? "Done" : file.Status,
                    }
                    : file
            )
        );

        if (isDone) checkFileUploaded(total, inserted, notInserted, data.filename);
    };


    const handleSending = (data) => {
        console.log("Sending:", data);

        setData((prev) =>
            prev.map((file) =>
                file.FileName === data.filename
                    ? {
                        ...file,
                        SendingCount: data.Sent ?? file.SendingCount,
                    }
                    : file
            )
        );

        const file = dataRef.current.find((f) => f.FileName === data.filename);
        const total = file?.NoOfReading ?? 0;

        checkFileSent(total, data.Sent, data.filename);
    };

    useEffect(() => {
        loadData();
        socketService.connect();
        const socket = socketService.socket;

        socket.on("Inserted", handleInserted);
        socket.on("NotInserted", handleNotInserted);
        socket.on("Sending", handleSending);

        return () => {
            socket.off("Inserted", handleInserted);
            socket.off("NotInserted", handleNotInserted);
            socket.off("Sending", handleSending);
            socketService.disconnect();
        };
    }, []);




    const checkFileUploaded = (total, inserted, notInserted, filename) => {
        if (Number(total) === inserted + notInserted) {
            fetch(`${SOCKET_URL}/uploadFile/changeStatusCompleted`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ str_fileName: filename }),
            })
                .then((res) => res.json())
                .then((resDone) => {
                    if (resDone.Result === "Success") {
                        toast.success("File Uploaded Successfully");
                        loadData();
                    }
                })
                .catch((err) => console.error("changeStatusCompleted failed:", err));
        }
    };

    const checkFileSent = (total, intSentCount, filename) => {
        if (Number(total) === Number(intSentCount)) {
            fetch(`${SOCKET_URL}/uploadFile/changeStatusToSendData`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ str_fileNames: filename }),
            })
                .then((res) => res.json())
                .then((res) => {
                    toast.success("Message Sent Successfully");
                    loadData();
                })
                .catch((err) => console.error("changeStatusToSendData failed:", err));
        } else {
            console.log("Still sending:", { total, intSentCount });
        }
    };

    const btn_upload = async (row) => {
        const { FileName: fileName, RecNo: recNo } = row;

        try {
            const res1 = await fetch(`${SOCKET_URL}/uploadFile/StatusChangeToProcessing`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ str_RecNo: recNo }),
            });

            const result1 = await res1.json();

            if (result1.Result === "Success") {
                setLoading(true);

                const res2 = await fetch(`${SOCKET_URL}/uploadFile/uploadFile`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ str_fileName: fileName }),
                });

                const result2 = await res2.json();

                if (result2.Result === "No Column Match") {
                    toast.error("Mismatch Column Name");
                    return;
                }

                await loadData();
            }
        } catch (error) {
            console.error("Upload failed:", error);
        } finally {
            setLoading(false);
        }
    };

    const btn_send = async (row) => {
        const filenameSend = row.FileName;

        setData((prev) =>
            prev.map((file) =>
                file.FileName === filenameSend ? { ...file, Status: "Sending" } : file
            )
        );

        try {
            await fetch(`${SOCKET_URL}/uploadFile/changeStatusToSending`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ str_fileNames: filenameSend }),
            });

            const res = await fetch(`${SOCKET_URL}/meterread/dovesend`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ str_fileName: filenameSend }),
            });

            const result = await res.json();

            if (result?.str_msg === "Insufficient Balance") {
                toast.error("Insufficient Balance");
                setData((prev) =>
                    prev.map((file) =>
                        file.FileName === filenameSend ? { ...file, Status: "Done" } : file
                    )
                );
            }
            else if (result?.str_msg === "Success") {
                toast.success("Message Sent Successfully");
                setData((prev) =>
                    prev.map((file) =>
                        file.FileName === filenameSend ? { ...file, Status: "Done" } : file
                    )
                );
            }
        } catch (err) {
            console.error("Send failed:", err);
            setData((prev) =>
                prev.map((file) =>
                    file.FileName === filenameSend ? { ...file, Status: "Done" } : file
                )
            );
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const fileName = file.name.replace(/ /g, "_");
        const formData = new FormData();
        formData.append("str_uploadFiles", file, fileName);

        try {
            const res = await fetch(`${SOCKET_URL}/uploadFile/uploadFilesToAnotherFolder`, {
                method: "POST",
                body: formData,
            });

            if (!res.ok) throw new Error("Upload failed");
            loadData();
        } catch (err) {
            console.error("Upload error:", err);
            toast.error("Failed to upload file");
        }
    };

    const int_countOfFiles = data.length;

    return (
        <div className="responsive-controls">
            <div className="p-6 bg-gray-100 min-h-screen flex flex-1 overflow-y-scroll scrollbar-hide">
                <div className="flex-1 w-full h-fit bg-white rounded-xl shadow-md border border-gray-200 p-6">
                    <h2 className="bg-gray-500 text-white text-2xl font-bold px-4 py-2 rounded mb-6 shadow">
                        Upload & Send Data
                    </h2>

                    <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg mb-6">
                        <div className="flex justify-start">
                            <div className="min-w-[300px] text-center">
                                <input
                                    type="file"
                                    onChange={handleFileUpload}
                                    accept=".xlsx, .xls, .csv"
                                    className={`text-blue-700 font-bold font-[cursive] ${int_countOfFiles === 0 ? "opacity-50 cursor-not-allowed" : ""
                                        }`}
                                />
                                <div className="mt-4">
                                    {int_countOfFiles > 0 ? (
                                        <h5 className="text-black">
                                            Total No. Of Files In Process.....:{" "}
                                            <strong>{int_countOfFiles}</strong>
                                        </h5>
                                    ) : (
                                        <h5 className="text-red-600">
                                            Upload Files For Processing
                                        </h5>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {loading ? (
                        <div className="text-center py-4">
                            <Spinner />
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full table-auto border border-gray-300 rounded-lg shadow-sm">
                                <thead className="bg-gray-200 text-sm">
                                    <tr>
                                        {[
                                            "Sr. No.",
                                            "File Name",
                                            "Total Records",
                                            "Uploaded",
                                            "Not Uploaded",
                                            "Sent",
                                            "Action",
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
                                    {paginatedData.map((file, index) => {
                                        const status = file.Status?.trim();
                                        return (
                                            <tr
                                                key={file.FileName}
                                                className="border-b hover:bg-gray-50"
                                            >
                                                <td className="p-3 border border-gray-100">
                                                    {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                                                </td>
                                                <td className="p-3 border border-gray-100">
                                                    {file.FileName}
                                                </td>
                                                <td className="p-3 border border-gray-100">
                                                    {file.NoOfReading || 0}
                                                </td>
                                                <td className="p-3 border border-gray-100">
                                                    {file.ProcessedCount || 0}
                                                </td>
                                                <td className="p-3 border border-gray-100">
                                                    {file.NotInserted || 0}
                                                </td>
                                                <td className="p-3 border border-gray-100">
                                                    {file.SendingCount || 0}
                                                </td>
                                                <td className="p-3 border border-gray-100">
                                                    {status === "Pending" ? (
                                                        <button
                                                            className="bg-blue-500 text-white px-3 py-1 rounded text-sm"
                                                            onClick={() => btn_upload(file)}
                                                        >
                                                            Upload
                                                        </button>
                                                    ) : status === "Processing" ? (
                                                        <span className="text-orange-600 font-semibold">
                                                            Processing...
                                                        </span>
                                                    ) : status === "Sending" ? (
                                                        <span className="text-blue-600 font-semibold">
                                                            Sending...
                                                        </span>
                                                    ) : status === "Done" ? (
                                                        <button
                                                            className="bg-green-500 text-white px-3 py-1 rounded text-sm"
                                                            onClick={() => btn_send(file)}
                                                        >
                                                            Send
                                                        </button>
                                                    ) : (
                                                        <span className="text-gray-500">{status}</span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

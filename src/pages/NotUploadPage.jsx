import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { API } from "../main";
import Spinner from "../spinner";
import { Select } from 'antd';

export default function NotUpload() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [fileName, setFileName] = useState("All");
  const [fileOptions, setFileOptions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  const { Option } = Select;


  const itemsPerPage = 10;
  const filteredData = data.filter((d) => {
    const q = searchQuery.toLowerCase();
    return (
      d.bp_no?.toLowerCase().includes(q) ||
      d.phone_no?.toLowerCase().includes(q) ||
      d.mrdoc?.toLowerCase().includes(q) ||
      d.meter_no?.toLowerCase().includes(q) ||
      d.month?.toLowerCase().includes(q) ||
      d.sending_date?.toLowerCase().includes(q)
    );
  });

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );


  useEffect(() => {
    const fetchFileList = async () => {
      try {
        const res = await fetch(`${API}/uploadFile/getExcelFileList`);
        const result = await res.json();
        setFileOptions(result);
      } catch (error) {
        console.error("Error loading File list", error);
      }
    };
    fetchFileList();
  }, []);


  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API}/uploadFile/getExcelFileData`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ str_fileName: fileName }),
        });
        const result = await res.json();
        setData(result);
        setFiltered(result);
        setCurrentPage(1);
      } catch (err) {
        console.error("Error loading:", err);
      }
      setLoading(false);
    };

    loadData();
  }, [fileName]);

  return (
    <div className="responsive-controls">
      <div className="p-6 bg-gray-100 min-h-screen flex flex-1  overflow-y-scroll scrollbar-hide x-scrollbar-">
        <div className="flex-1 w-full h-fit bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <h2 className="bg-gray-500 text-white text-2xl font-bold px-4 py-2 rounded mb-6 shadow">
            Incomplete Readings
          </h2>


          <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg mb-6">
            <div className="flex justify-center">
              <div className="min-w-[300px] text-center">
                <label className="block text-sm font-bold mb-1 text-gray-700">
                  Select File Name
                </label>
                <Select
                  className="w-full"
                  value={fileName}
                  showSearch
                  onChange={setFileName}
                >
                  <Option value="All">All</Option>
                  {fileOptions.map((item, i) => (
                    <Option key={i} value={item.fileName}>
                      {item.fileName}
                    </Option>
                  ))}
                </Select>
              </div>
            </div>
          </div>


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

            <div className="text-sm font-bold">Total Data: {filteredData.length}</div>

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
                      "Business Partner",
                      "Meter No.",
                      "Meter Doc No.",
                      "Mobile No.",
                      "Schedule Date",
                      "Month",
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
                      <td className="p-3 border border-gray-100">{d.bp_no}</td>
                      <td className="p-3 border border-gray-100">{d.meter_no}</td>
                      <td className="p-3 border border-gray-100">{d.mrdoc}</td>
                      <td className="p-3 border border-gray-100">{d.phone_no}</td>
                      <td className="p-3 border border-gray-100">
                        {d.sending_date}
                      </td>
                      <td className="p-3 border border-gray-100">{d.month}</td>
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

import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { API } from "../main";
import Spinner from "../spinner";
import { Select } from 'antd';
import toast from "react-hot-toast";

export default function MeterReadingPage() {
  const [loading, setLoading] = useState(false);
  const [excelLoading, setExcelLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [data, setData] = useState([]);
  const [filtered, setFiltered] = useState([]);

  const [scheduleDateOptions, setScheduleDateOptions] = useState([]);

  const [searchParams] = useSearchParams();
  const initialScheduleDate = searchParams.get("billgroup") || "";
  const initialMonth = searchParams.get("month") || "";


  const [scheduleDate, setScheduleDate] = useState(initialScheduleDate);
  const [readingMatch, setReadingMatch] = useState("True");
  const [meterNoMatch, setMeterNoMatch] = useState("True");
  const [searchQuery, setSearchQuery] = useState("");

  const { Option } = Select;

  const todaysDate = new Date().toISOString().split("T")[0];

  useEffect(() => {
    const fetchScheduleDates = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API}/meterread/getScheduleDate`);
        const dates = await res.json();
        setScheduleDateOptions(dates);
        setFiltered(dates);
        if (!scheduleDate && dates.length > 0) {
          setScheduleDate(initialScheduleDate || dates[0].sending_date);
        }
      } catch (error) {
        console.error("Error loading schedule dates", error);
      } finally {
        setLoading(false);
      }
    };
    fetchScheduleDates();
  }, []);

  useEffect(() => {
    if (!scheduleDate) return;
    const loadData = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API}/meterread/getAllReadingData`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            mReadStatus: readingMatch,
            mNoStatus: meterNoMatch,
            scheduleDate,
          }),
        });
        const result = await res.json();
        const resolvedDate = scheduleDate || result[0]?.sending_date;
        setScheduleDate(resolvedDate);
        setData(result);
        setFiltered(result);
        // console.log("result", result);
      } catch (err) {
        console.error("Error loading meter reading data:", err);
      }
      setLoading(false);
    };

    loadData();
  }, [scheduleDate, readingMatch, meterNoMatch]);

  const exportCSV = async () => {
    if (filtered.length === 0) {
      toast.error("No data to export");
      return;
    }

    setExcelLoading(true);

    await new Promise((resolve) => setTimeout(resolve, 300));

    try {
      const ws = XLSX.utils.json_to_sheet(safeFiltered);
      const csv = XLSX.utils.sheet_to_csv(ws);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });

      // await new Promise((res) => setTimeout(res, 500));

      saveAs(blob, "meter_readings.csv");
    } catch (error) {
      console.error("❌ Error exporting CSV:", error);
    } finally {
      setExcelLoading(false);
    }
  };




  // const itemsPerPage = 10;
  // const safeFiltered = Array.isArray(filtered) ? filtered : [];
  // const totalPages = Math.ceil(safeFiltered.length / itemsPerPage);
  // console.log('filtered value:', filtered);


  // const paginatedData = safeFiltered.slice(
  //   (currentPage - 1) * itemsPerPage,
  //   currentPage * itemsPerPage
  // );


  const itemsPerPage = 10;

  const safeFiltered = useMemo(() => {
    const q = searchQuery.toLowerCase();

    return data.filter((d) =>
      d.bp_no?.toLowerCase().includes(q) ||
      d.phone_no?.toLowerCase().includes(q) ||
      d.sending_date?.toLowerCase().includes(q) ||
      d.meter_no?.toLowerCase().includes(q)
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



  return (
    <div className="p-4 bg-gray-100 min-h-screen overflow-y-auto">
      <div className="w-full bg-white rounded-xl shadow-md border border-gray-200 p-4 sm:p-6">

        <div className="bg-gray-500 text-white text-xl sm:text-2xl font-bold px-4 py-2 rounded mb-6 shadow">
          Meter Readings :– {initialMonth || initialScheduleDate || scheduleDate}
        </div>

        <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg mb-6">
          <div className="flex flex-col sm:flex-row flex-wrap gap-6">
            <div className="w-full sm:w-[300px]">
              <label className="block text-sm font-bold mb-1">Schedule Date</label>
              <Select
                value={scheduleDate}
                onChange={setScheduleDate}
                className="w-full"
                showSearch
              >
                {scheduleDateOptions.map((item, index) => (
                  <Option key={index} value={item.sending_date}>
                    {item.sending_date}
                  </Option>
                ))}
              </Select>
            </div>

            <div className="w-full sm:w-[300px]">
              <label className="block text-sm font-bold mb-1">Meter Reading Match</label>
              <Select
                value={readingMatch}
                onChange={setReadingMatch}
                className="w-full"
              >
                <Option value="All">All</Option>
                <Option value="True">True</Option>
                <Option value="False">False</Option>
              </Select>
            </div>

            <div className="w-full sm:w-[300px]">
              <label className="block text-sm font-bold mb-1">Meter Number Match</label>
              <Select
                value={meterNoMatch}
                onChange={setMeterNoMatch}
                className="w-full"
              >
                <Option value="All">All</Option>
                <Option value="True">True</Option>
                <Option value="False">False</Option>
              </Select>
            </div>
          </div>
        </div>


        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
          <div className="flex gap-2">
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
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              className="px-3 py-1 bg-gray-200 text-sm rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>

          <div className="text-sm font-bold">Total Data: {safeFiltered.length}</div>

          <div className="w-full md:w-[300px] ml-auto">
            <label className="text-sm font-bold mb-1 block">Search:</label>
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full border px-3 py-2 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>


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

        {loading ? (
          <Spinner />
        ) : (
          <>
            {filtered.length === 0 ? (
              <div className="text-red-600 text-sm mt-4">No data available to export.</div>
            ) : (
              <div className="overflow-x-auto mt-4">
                <table className="min-w-[1000px] table-auto border border-gray-300 rounded-lg shadow-sm">
                  <thead className="bg-gray-200 text-sm">
                    <tr>
                      {[
                        "B.P No.",
                        "Contact No.",
                        "Meter No.",
                        "Schedule Date",
                        "Meter Image",
                        "Meter Reading",
                        "Reading Date/Time",
                        "Derrived Reading",
                        "Meter Reading(OCR)",
                        "Meter No(OCR)",
                        "Meter Reading Match",
                        "Meter No Match",
                        "Connection Object",
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
                    {paginatedData.map((d, i) => {
                      const imgPath = d.meter_image_path?.split("/public_html")[1];
                      return (
                        <tr key={i} className="border-b">
                          <td className="p-3 border border-gray-100">{d.bp_no}</td>
                          <td className="p-3 border border-gray-100">{d.phone_no}</td>
                          <td className="p-3 border border-gray-100">{d.meter_no}</td>
                          <td className="p-3 border border-gray-100">{d.sending_date}</td>
                          <td className="p-3 border border-gray-100">
                            {imgPath && (
                              <a
                                href={`https://mread.in${imgPath}`}
                                target="_blank"
                                rel="noreferrer"
                              >
                                <img
                                  src={`https://mread.in${imgPath}`}
                                  className="w-24 hover:scale-1000 hover:z-10 hover:shadow-lg transition-transform duration-300 ease-in-out"
                                  loading="lazy"
                                />
                              </a>
                            )}
                          </td>
                          <td className="p-3 border border-gray-100">{d.cust_meter_reading}</td>
                          <td className="p-3 border border-gray-100">{d.cust_reading_rec_ts}</td>
                          <td className="p-3 border border-gray-100">{d.ocr_reading?.slice(0, 5)}</td>
                          <td className="p-3 border border-gray-100">{d.ocr_reading}</td>
                          <td className="p-3 border border-gray-100">{d.ocr_meter_no}</td>
                          <td className="p-3 border border-gray-100">
                            {imgPath && d.reading_match_flag}
                          </td>
                          <td className="p-3 border border-gray-100">
                            {imgPath && d.meter_no_match_flag}
                          </td>
                          <td className="p-3 border border-gray-100">{d.connection_obj}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>

  );
}

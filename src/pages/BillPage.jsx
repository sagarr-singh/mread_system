import React, { useState, useEffect } from "react";
import { API } from "../main";
import Spinner from "../spinner";
import BillingTable from "../components/BillingTable";
import { Select } from 'antd';

export default function BillPage() {
  const [billingMonths, setBillingMonths] = useState([]);
  const [billingGroups, setBillingGroups] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("");
  const [loading, setLoading] = useState(true);
  const [groupLoading, setGroupLoading] = useState(false);
  const { Option } = Select;


  useEffect(() => {
    const fetchMonth = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API}/Bill/MonthList`);
        const data = await response.json();
        setBillingMonths(data);
      } catch (error) {
        console.error("Error fetching billing months:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMonth();
  }, []);

  const fetchGroup = async (month) => {
    try {
      setGroupLoading(true);
      const response = await fetch(`${API}/Bill/BillGroupList`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ month }),
      });

      const data = await response.json();
      // console.log("Group data:", data);
      setBillingGroups(data);
    } catch (error) {
      console.error("Error fetching billing group:", error);
    } finally {
      setGroupLoading(false);
    }
  };

  const fetchBillingDataAll = async (month, groups) => {
    try {
      const response = await fetch(`${API}/Bill/GetDataAll`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          month,
          group: groups,
        }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching billing data for all groups:", error);
      return [];
    }
  };

  const fetchBillingData = async (month, group) => {
    try {
      const response = await fetch(`${API}/Bill/GetData`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ month, group }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching billing data:", error);
      return [];
    }
  };


  const currentMonth = new Date().toISOString().split("T")[0];


  const handleMonthChange = (e) => {
    const selected = e.target.value;
    setSelectedMonth(selected ? selected : currentMonth);
    setSelectedGroup("");
    fetchGroup(selected);
  };

  return (
    <div className="flex min-h-screen flex-1 bg-gray-100 p-4">
      <div className="bg-white flex-1 w-fit shadow-md rounded-lg p-6 border border-gray-200">
        <div className="bg-gray-500 text-white text-2xl font-bold px-4 py-2 rounded mb-6 shadow-sm">
          Bill Data
        </div>

        <div className="flex flex-wrap -mx-2">
          <div className="w-full md:w-1/2 px-2 mb-4">
            <label className="block text-sm font-semibold text-black mb-1">
              Select Billing Month
            </label>

            {loading ? (
              <Spinner />
            ) : (
              <Select
                value={selectedMonth}
                onChange={(value) => {
                  setSelectedMonth(value);
                  setSelectedGroup("");
                  fetchGroup(value);
                }}
                placeholder="Select Billing Month"
                className="w-full"
                showSearch
              >
                <Option value="">-- Select Billing Month</Option>
                {billingMonths.map((item, index) => (
                  <Option key={index} value={item.month}>
                    {item.month}
                  </Option>
                ))}
              </Select>
            )}
          </div>

          {selectedMonth && (
            <div className="w-full md:w-1/2 px-2 mb-4">
              <label className="block text-sm font-semibold text-black mb-1">
                Select Billing Group
              </label>

              {groupLoading ? (
                <Spinner />
              ) : (
                <Select
                  value={selectedGroup}
                  onChange={(value) => {
                    setSelectedGroup(value);
                    fetchBillingData(selectedMonth, value);
                  }}
                  className="w-full"
                  showSearch
                >
                  {/* <Option value="">-- Select Billing Group</Option> */}
                  {billingGroups.map((item, index) => (
                    <Option key={index} value={item.portion}>
                      {item.portion}
                    </Option>
                  ))}
                </Select>
              )}
            </div>
          )}

          {selectedMonth && selectedGroup ? (
            <BillingTable
              selectedMonth={selectedMonth}
              selectedGroup={selectedGroup}
              fetchBillingData={
                selectedGroup === "All"
                  ? () =>
                    fetchBillingDataAll(
                      selectedMonth,
                      billingGroups.map((g) => g.portion)
                    )
                  : () => fetchBillingData(selectedMonth, selectedGroup)
              }
            />
          ) : (
            <div className="text-gray-500 text-sm mt-4 px-2">
              {/* You can show guidance here if needed */}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

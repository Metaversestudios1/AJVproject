import React, { useEffect, useState } from "react";
import { MdDelete } from "react-icons/md";
import { CiEdit } from "react-icons/ci";
import { NavLink } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import { GoKebabHorizontal } from "react-icons/go";
import "react-toastify/dist/ReactToastify.css";
import getUserFromToken from "../utils/getUserFromToken";
import * as XLSX from "xlsx";
const Property = () => {
  const userInfo = getUserFromToken(); // Getting user info (which includes agent id)
  const [properties, setProperties] = useState([]);
  const [noData, setNoData] = useState(false);
  const [loader, setLoader] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [count, setCount] = useState(0);
  const [search, setSearch] = useState("");
  const [activePropertyId, setActivePropertyId] = useState(null); // For kebab menu popup

  // Fetch agent details and properties on component mount
  useEffect(() => {
    fetchAgentProperties();
  }, [page, search]);

  // Fetch agent details and property IDs
  const fetchAgentProperties = async () => {
    setLoader(true);
    try {
      // Fetch agent details using agent id from userInfo
      const agentRes = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/getSingleAgent`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: userInfo?.id }), // Assuming agent_id is in userInfo
      });

      const agentResponse = await agentRes.json();
      if (agentResponse.success) {
        const propertyIds = agentResponse.result?.properties || []; // Getting property IDs array
        fetchProperties(propertyIds);
      } else {
        toast.error("Failed to fetch agent details.");
        setLoader(false);
      }
    } catch (error) {
      toast.error("Error fetching agent details.");
      setLoader(false);
    }
  };

  // Fetch properties based on property IDs
  const fetchProperties = async (propertyIds) => {
    if (!propertyIds.length) {
      setNoData(true);
      setLoader(false);
      return;
    }
  
    setLoader(true);
    try {
      // Use Promise.all to fetch all properties concurrently
      const propertyRequests = propertyIds.map((id) =>
        fetch(`${process.env.REACT_APP_BACKEND_URL}/api/getSingleProperty`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id }),
        }).then(res => res.json())
      );
  
      const responses = await Promise.all(propertyRequests);
  
      const fetchedProperties = responses
        .filter(response => response.success)
        .map(response => response.result);
  
      if (fetchedProperties.length) {
        setProperties(fetchedProperties);
        setCount(fetchedProperties.length);
      } else {
        setNoData(true);
      }
  
    } catch (error) {
      toast.error("Error fetching properties.");
    } finally {
      setLoader(false);
    }
  };
  



  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "search") {
      setSearch(value);
      setPage(1);
    }
    if (name === "pageSize") {
      setPageSize(parseInt(value, 10)); // Convert value to a number
      setPage(1);
    }
  };
  function downloadExcel() {
    const table = document.getElementById("propertytable"); // Your table ID
    const allDataRows = []; // This will hold all the table rows data

    // Get all rows from the table body (skip the header)
    const rows = table.querySelectorAll("tbody tr"); // Adjust selector if your table structure is different

    rows.forEach((row) => {
      const rowData = {};
      const cells = row.querySelectorAll("td, th"); // Get all cells in the current row (th included for Sr no.)
      const totalCells = cells.length;

      // Loop through cells, excluding the third column (index 2)
      for (let index = 1; index < totalCells; index++) {
        if (index === 2 || index === totalCells - 1) continue; // Skip the image column (third column)

        // Assuming you have predefined column headers
        const columnHeader =
          table.querySelectorAll("thead th")[index].innerText; // Get header name
        rowData[columnHeader] = cells[index].innerText; // Set the cell data with the header name as key
      }
      allDataRows.push(rowData); // Add row data to allDataRows array
    });

    // Create a new workbook and a worksheet
    const worksheet = XLSX.utils.json_to_sheet(allDataRows);
    const workbook = XLSX.utils.book_new();

    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "Site Report");

    // Generate Excel file and prompt for download
    XLSX.writeFile(workbook, "Propertyreport.xlsx");
  }
  const startIndex = (page - 1) * pageSize;

  return (
    <div className="relative">
      <ToastContainer autoClose={2000} pauseOnHover theme="light" />

      <div className="flex items-center">
        <div className="text-2xl font-bold mx-2 my-8 px-4">Property List</div>
      </div>

      <div className="flex justify-between">

        <input
          placeholder="Search"
          type="text"
          name="search"
          value={search}
          onChange={handleChange}
          className="text-black border-[1px] rounded-lg bg-white p-2 m-5"
        />
        <div className={` flex `}>
        <select
          type="text"
          name="pageSize"
          value={pageSize}
          onChange={handleChange}
          className={`text-black border-[1px] rounded-lg bg-white p-2 m-5`}
        >
          <option value="">select Limit</option>
          <option value="10">10</option>
          <option value="25">25</option>
          <option value="50">50</option>
          <option value="100">100</option>
          <option value="200">200</option>
        </select>
      </div>
      <div className="flex">
        <button
          onClick={downloadExcel}
          className="bg-blue-800 text-white p-3 m-5 text-sm rounded-lg"
        >
          Download Excel
        </button>
      </div>
      </div>

      {loader && (
        <div className="absolute h-full w-full top-64 flex justify-center items-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-current border-e-transparent" />
        </div>
      )}

      <div className="relative overflow-x-auto m-5 mb-0">
        {properties.length > 0 && (
          <table  id="propertytable" className="w-full text-sm text-left border-2 border-gray-300">
            <thead className="text-xs uppercase bg-gray-200">
              <tr>
                {[
                  "Sr no.",
                  "Property Name",
                  "Property Image",
                  "Description",
                  "Address",
                  "Sites",
                ].map((header, index) => (
                  <th key={index} className="px-6 py-3 border-2 border-gray-300">{header}</th>
                ))}
              </tr>
            </thead>

            <tbody>
              {properties.map((item, index) => (
                <tr key={item?._id} className="bg-white">
                  <th className="px-6 py-4 font-medium text-gray-900 border-2 border-gray-300">
                    {startIndex + index + 1}
                  </th>
                  
                  <td className="px-6 py-4 font-medium text-gray-900 border-2 border-gray-300">
                    {item?.propertyname}
                  </td>
                    <td className="px-6 py-4 border-2 border-gray-300 relative">
                    {item?.photos?.length > 0 && (
                      <div className="flex space-x-2">
                        {" "}
                        {/* Flex container for images */}
                        {item.photos.map((photo, index) => (
                          <div key={index} className="relative">
                            {" "}
                            {/* Wrapper div for positioning */}
                            <a
                              href={photo.url}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <img
                                src={photo.url}
                                alt={`Profile ${index + 1}`} // Alternate text for accessibility
                                className="w-12 h-12 rounded-full object-cover aspect-square"
                                style={{ width: "50px", height: "50px" }} // Set width and height to 50px
                              />
                            </a>
                          </div>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 border-2 border-gray-300">{item?.description}</td>
                  <td className="px-6 py-4 border-2 border-gray-300">{item?.address}</td>
                  <td className="px-6 py-4 border-2 border-gray-300">{item?.sites}</td>
               
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
  {noData && (
        <div className="text-center text-xl">
          Currently! There are no property in the storage.
        </div>
      )}
      {properties.length > 0 && (
        <div className="flex flex-col items-center my-10">
          <span className="text-sm text-black">
            Showing <span className="font-semibold">{startIndex + 1}</span> to{" "}
            <span className="font-semibold">{Math.min(startIndex + pageSize, count)}</span> of{" "}
            <span className="font-semibold">{count}</span> Entries
          </span>
          <div className="inline-flex mt-2">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              className="flex items-center justify-center px-3 h-8 text-sm font-medium text-white bg-gray-800 rounded-s hover:bg-gray-900"
            >
              Prev
            </button>
            <button
              onClick={() => setPage(page + 1)}
              disabled={properties.length < pageSize || startIndex + pageSize >= count}
              className="flex items-center justify-center px-3 h-8 text-sm font-medium text-white bg-gray-800 border-s border-gray-700 rounded-e hover:bg-gray-900"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Property;
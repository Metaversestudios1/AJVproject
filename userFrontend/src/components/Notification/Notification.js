import React, { useEffect, useState } from "react";
import { MdDelete } from "react-icons/md";
import { CiEdit } from "react-icons/ci";
import { NavLink } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import { GoKebabHorizontal } from "react-icons/go";
import "react-toastify/dist/ReactToastify.css";
import * as XLSX from "xlsx";

const Notification = () => {
  const [notification, setnotification] = useState([]);
  const [noData, setNoData] = useState(false);
  const [loader, setLoader] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [count, setCount] = useState(0);
  const [search, setSearch] = useState("");
  const [activePropertyId, setActivePropertyId] = useState(null); // For kebab menu popup
  useEffect(() => {
    fetchData();
  }, [page, search, pageSize]);

  const fetchData = async () => {
    setLoader(true);
    const res = await fetch(
      `${process.env.REACT_APP_BACKEND_URL}/api/getAllNotification?page=${page}&limit=${pageSize}&search=${search}`
    );
    const response = await res.json();
    console.log(response)
    if (response.success) {
      setNoData(false);
      if (response.result.length === 0) {
        setNoData(true);
      }
      setnotification(response.result);
      setCount(response.count);
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
  const handleDeleteImage = async (propertyId, photoIndex) => {
    // e.preventDefault();
    const permissionOfDelete = window.confirm(
      "Are you sure, you want to delete the property photo"
    );

    if (permissionOfDelete) {
      let userOne = notification.length === 1;
      if (count === 1) {
        userOne = false;
      }
      const res = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/deletePropertyPhoto`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ propertyId, photoIndex }),
        }
      );
      const response = await res.json();
      if (response.success) {
        toast.success("Property photo is deleted Successfully!", {
          position: "top-right",
          autoClose: 1000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });
        if (userOne) {
          setPage(page - 1);
        } else {
          fetchData();
        }
      }
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
      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />

      <div className="flex items-center">
        <div className="text-2xl font-bold mx-2 my-8 px-4">Notification</div>
      </div>
      <div className="flex justify-between">
        {/* <NavLink to="/addnotification">
          <button className="bg-blue-800 text-white p-3 m-5 text-sm rounded-lg">
            Add New
          </button>
        </NavLink> */}

        <div className={`flex items-center`}>
          <input
            placeholder="Search "
            type="text"
            name="search"
            value={search}
            onChange={handleChange}
            className={`text-black border-[1px] rounded-lg bg-white p-2 m-5`}
          />
        </div>
        {/* <div className={` flex `}>
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
        </div> */}
        {/* <div className="flex">
          <button
            onClick={downloadExcel}
            className="bg-blue-800 text-white p-3 m-5 text-sm rounded-lg"
          >
            Download Excel
          </button>
        </div> */}
      </div>

      {loader && (
        <div className="absolute h-full w-full top-64  flex justify-center items-center">
          <div
            className=" flex justify-center h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-e-transparent align-[-0.125em] text-surface motion-reduce:animate-[spin_1.5s_linear_infinite] "
            role="status"
          >
            <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
              Loading...
            </span>
          </div>
        </div>
      )}
      <div className="relative overflow-x-auto m-5 mb-0">
        {notification.length > 0 && (
          <table
            id="propertytable"
            className="w-full text-sm text-left rtl:text-right border-2 border-gray-300"
          >
            <thead className="text-xs uppercase bg-gray-200">
              <tr>
                <th scope="col" className="px-6 py-3 border-2 border-gray-300">
                  Sr no.
                </th>
                <th scope="col" className="px-6 py-3 border-2 border-gray-300">
                  Text
                </th>
                <th scope="col" className="px-6 py-3 border-2 border-gray-300">
                  Images
                </th>
              </tr>
            </thead>

            <tbody>
              {notification.map((item, index) => (
                <tr key={item?._id} className="bg-white">
                  <th
                    scope="row"
                    className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap border-2 border-gray-300"
                  >
                    {startIndex + index + 1}
                  </th>
                  <th
                    scope="row"
                    className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap border-2 border-gray-300"
                  >
                    {item?.description}
                  </th>
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
                 
                  
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {noData && (
        <div className="text-center text-xl">
          Currently! There are no images in the storage.
        </div>
      )}

      {notification.length > 0 && (
        <div className="flex flex-col items-center my-10">
          <span className="text-sm text-black">
            Showing{" "}
            <span className="font-semibold text-black">{startIndex + 1}</span>{" "}
            to{" "}
            <span className="font-semibold text-black">
              {Math.min(startIndex + pageSize, count)}
            </span>{" "}
            of <span className="font-semibold text-black">{count}</span> Entries
          </span>
          <div className="inline-flex mt-2 xs:mt-0">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              className="flex items-center justify-center px-3 h-8 text-sm font-medium text-white bg-gray-800 rounded-s hover:bg-gray-900"
            >
              Prev
            </button>
            <button
              onClick={() => setPage(page + 1)}
              disabled={
                notification.length < pageSize || startIndex + pageSize >= count
              }
              className="flex items-center justify-center px-3 h-8 text-sm font-medium text-white bg-gray-800 border-0 border-s border-gray-700 rounded-e hover:bg-gray-900"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notification;

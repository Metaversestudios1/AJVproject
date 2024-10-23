import React, { useEffect, useState } from "react";
import { NavLink, useParams } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import { GoKebabHorizontal } from "react-icons/go";
import "react-toastify/dist/ReactToastify.css";
import { MdEdit } from "react-icons/md";
import * as XLSX from "xlsx";
import getUserFromToken from "../utils/getUserFromToken";

const Sites = () => {
  const userInfo = getUserFromToken();
  const [sites, setSites] = useState([]);
  const [noData, setNoData] = useState(false);
  const [loader, setLoader] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5); // Default page size
  const [paginatedSites, setPaginatedSites] = useState([]);
  const [count, setCount] = useState(0);
  const [search, setSearch] = useState("");
  const [activePropertyId, setActivePropertyId] = useState(null); // For kebab menu popup
  const params = useParams();
  const [filter, setfilter] = useState("");
  const { id } = params;
  const fetchPropertyName = async (id) => {
    const nameRes = await fetch(
      `${process.env.REACT_APP_BACKEND_URL}/api/getSingleProperty`,
      {
        method: "POST",
        headers: { "Content-type": "application/json" },
        body: JSON.stringify({ id }),
      }
    );
    const propertyName = await nameRes.json();
    return (propertyName?.success && propertyName?.result?.propertyname) || "-";
  };

  const fetchAgentData = async (agentId) => {
    const agentRes = await fetch(
      `${process.env.REACT_APP_BACKEND_URL}/api/getSingleAgent`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: agentId }),
      }
    );
    const agentData = await agentRes.json();
    if (agentData.success) {
      return agentData.result;
    } else {
      return null; // Handle no agent data found
    }
  };

  const fetchAllSites = async () => {
    const res = await fetch(
      `${process.env.REACT_APP_BACKEND_URL}/api/getAllSite`
    );
    const siteData = await res.json();
    if (siteData.success) {
      return siteData.result;
    }
    return [];
  };

  const fetchData = async () => {
    setLoader(true);
    setSites([]);

    try {
      // Fetch the agent data first
      const agentData = await fetchAgentData(userInfo.id);

      if (
        agentData &&
        agentData.properties &&
        agentData.properties.length > 0
      ) {
        const agentProperties = agentData.properties.map(
          (property) => property
        );

        // Fetch all sites
        const allSites = await fetchAllSites();

        // Initialize an array to hold all the matching sites
        let sitesForAgent = [];

        // Filter the sites where propertyId matches any of the agent's properties
        agentProperties.forEach((property) => {
          const matchingSites = allSites.filter(
            (site) => site.propertyId._id === property
          );
          sitesForAgent = [...sitesForAgent, ...matchingSites]; // Accumulate matching sites
        });

        // Apply the filter before setting the data
        let filteredSites = sitesForAgent;

        // Apply the selected filter from the state
        if (filter === "recent") {
          // Assuming sites have a createdAt date
          filteredSites = filteredSites.sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          );
        } else if (filter === "oldest") {
          filteredSites = filteredSites.sort(
            (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
          );
        } else if (filter === "Available") {
          filteredSites = filteredSites.filter(
            (site) => site.status === "Available"
          );
        } else if (filter === "Booked") {
          filteredSites = filteredSites.filter(
            (site) => site.status === "Booked"
          );
        } else if (filter === "Completed") {
          filteredSites = filteredSites.filter(
            (site) => site.status === "Completed"
          );
        }

        // Fetch related data (property names, agent names, client names) and prepare the site data
        const sitesWithDetails = await Promise.all(
          filteredSites.map(async (site) => {
            let propertyName = "-";
            if (site.propertyId) {
              propertyName = await fetchPropertyName(site.propertyId);
            }

            return {
              ...site,
              propertyName,
              // Add more details as required (clientName, agentName)
            };
          })
        );

        setSites(sitesWithDetails);
        setCount(sitesWithDetails.length);
        setNoData(sitesWithDetails.length === 0);
        updatePaginatedSites();
      } else {
        setNoData(true); // No properties for this agent
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoader(false);
    }
  };

  // Fetch data when component mounts or relevant dependencies change
  useEffect(() => {
    fetchData();
  }, [currentPage, search, filter, pageSize]);
  const updatePaginatedSites = () => {
    
    const filteredSites = sites.filter(site => {
      const siteName = site.propertyName ? site.propertyName.toLowerCase() : ""; // Safeguard for undefined
      const includesSearchTerm = siteName.includes(search.toLowerCase());
      
      return includesSearchTerm; // Only return sites that match the search term
    });
  
    
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
  
    if (filteredSites.length === 0) {
      setNoData(true)
      setPaginatedSites([]); // Clear paginatedSites when no results are found
    } else {
      setPaginatedSites(filteredSites.slice(startIndex, endIndex));
    }
  };
  
  // Update paginated data when sites, currentPage, or pageSize change
  useEffect(() => {
    updatePaginatedSites();
  }, [sites, currentPage, pageSize]);

  const handlePageChange = (direction) => {
    setCurrentPage((prev) => {
      if (direction === "next") return prev + 1;
      if (direction === "prev") return Math.max(prev - 1, 1);
      return prev; // Return current page if no direction is specified
    });
  };
  const handleKebabClick = (propertyId) => {
    // Toggle the kebab menu for the clicked row
    setActivePropertyId(activePropertyId === propertyId ? null : propertyId);
  };
  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    updatePaginatedSites(); // Call this to update the filtered sites immediately
  };
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "search") {
      setSearch(value);
      setCurrentPage(1);
    }
    if (name === "filter") {
      setfilter(value);
      setCurrentPage(1);
    }
    if (name === "pageSize") {
      setPageSize(parseInt(value, 10)); // Convert value to a number
      setCurrentPage(1);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    const permissionOfDelete = window.confirm(
      `Are you sure you want change status of the site ${newStatus}?`
    );
    if (permissionOfDelete) {
      let projectOne = sites.length === 1;
      if (count === 1) {
        projectOne = false;
      }
      try {
        const res = await fetch(
          `${process.env.REACT_APP_BACKEND_URL}/api/updatesitestatus/${id}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ status: newStatus }),
          }
        );
        const response = await res.json();
        if (response.success) {
          if (newStatus === "Completed") {
            toast.success(`Site Completed Successfully!`, {
              position: "top-right",
              autoClose: 3000,
            });
          } else {
            toast.success(
              `Property booked Successfully! Now you can Add your Payment Details`,
              {
                position: "top-right",
                autoClose: 3000,
              }
            );
          }

          if (projectOne) {
            fetchData();
          }
        }
      } catch (error) {
        console.error("Error updating status:", error);
        alert("Error updating status");
      }
    }
  };

  function downloadExcel() {
    const table = document.getElementById("sitetable"); // Your table ID
    const allDataRows = []; // This will hold all the table rows data

    // Get all rows from the table body (skip the header)
    const rows = table.querySelectorAll("tbody tr"); // Adjust selector if your table structure is different

    rows.forEach((row) => {
      const rowData = {};
      const cells = row.querySelectorAll("td"); // Get all cells in the current row
      const totalCells = cells.length;

      // Loop through cells except the last two
      for (let index = 1; index < totalCells - 2; index++) {
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
    XLSX.writeFile(workbook, "Sitereport.xlsx");
  }

  const startIndex = (currentPage - 1) * pageSize;

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
        <div className="text-2xl font-bold mx-2 my-8 px-4">Sites List</div>
      </div>
      <div className="flex justify-between">
        {/* <NavLink to="/sites/addSite/">
          <button className="bg-blue-800 text-white p-3 m-5 text-sm rounded-lg">
            Add New
          </button>
        </NavLink> */}

        <div className={`flex `}>
          <input
            placeholder="Search "
            type="text"
            name="search"
            value={search}
            onChange={handleSearchChange}
            className={`text-black border-[1px] rounded-lg bg-white p-2 m-5`}
          />
        </div>

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
        <div className={` flex `}>
          <select
            type="text"
            name="filter"
            value={filter}
            onChange={handleChange}
            className={`text-black border-[1px] rounded-lg bg-white p-2 m-5`}
          >
            <option value="">select filter</option>
            <option value="recent">Recent</option>
            <option value="oldest">Oldest</option>
            <option value="Available">Available</option>
            <option value="Booked">Booked</option>
            <option value="Completed">Completed</option>
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
        {paginatedSites.length > 0 && (
          <table
            id="sitetable"
            className="w-full text-sm text-left rtl:text-right border-2 border-gray-300"
          >
            <thead className="text-xs uppercase bg-gray-200">
              <tr>
                <th scope="col" className="px-6 py-3 border-2 border-gray-300">
                  Sr no.
                </th>
                <th scope="col" className="px-6 py-3 border-2 border-gray-300">
                  Property Name
                </th>
                <th scope="col" className="px-6 py-3 border-2 border-gray-300">
                  Client Name
                </th>
                <th scope="col" className="px-6 py-3 border-2 border-gray-300">
                  Agent Name
                </th>
                {/* <th scope="col" className="px-6 py-3 border-2 border-gray-300">
                  Site Number
                </th> */}
                <th scope="col" className="px-6 py-3 border-2 border-gray-300">
                  Description
                </th>
                <th scope="col" className="px-6 py-3 border-2 border-gray-300">
                  Site Staus
                </th>
                <th scope="col" className="px-6 py-3 border-2 border-gray-300">
                  Site Actions
                </th>
                <th scope="col" className="px-6 py-3 border-2 border-gray-300">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {paginatedSites.map((item, index) => (
                <tr key={item?._id} className="bg-white">
                  <td
                    scope="row"
                    className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap border-2 border-gray-300"
                  >
                    {startIndex + index + 1}
                  </td>
                  <td
                    scope="row"
                    className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap border-2 border-gray-300"
                  >
                    {item?.propertyName}
                  </td>
                  <td className="px-6 py-4 border-2 border-gray-300">
                    {item?.ClientName}
                    <span style={{ display: "none" }}>{item?.ClientId}</span>
                  </td>
                  <td className="px-6 py-4 border-2 border-gray-300">
                    {item?.AgentName}
                  </td>
                  {/* <td className="px-6 py-4 border-2 border-gray-300">
                    {item?.siteNumber}
                  </td> */}

                  <td className="px-6 py-4 border-2 border-gray-300">
                    {item?.description}
                  </td>
                  <td className="px-6 py-4 border-2 border-gray-300">
                    <button
                      className={`text-white font-bold py-2 px-4 rounded ${
                        item?.status === "Available"
                          ? "bg-green-500 hover:bg-green-600"
                          : item?.status === "Booked"
                          ? "bg-blue-500 hover:bg-blue-600"
                          : item?.status === "Completed"
                          ? "bg-orange-500 hover:bg-orange-600"
                          : "bg-gray-500 hover:bg-gray-600" // default case if none match
                      }`}
                    >
                      {item?.status}
                    </button>
                  </td>
                  <td className="px-6 py-4 border-2 border-gray-300">
                    <br></br>
                    &ensp;
                    <div className="flex justify-between">
                      {item?.status === "Available" ? (
                        <div>
                          {item?.propertyDetailsstatus === "0" ? (
                            // Show "Add Payment Details" button when propertyDetailsstatus is 0
                            <button className="bg-blue-800 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
                              <NavLink to={`/addPropertyDetails/${item?._id}`}>
                                <span className="block w-full text-left px-4 py-2 text-sm ">
                                  Add Payment Details
                                </span>
                              </NavLink>
                            </button>
                          ) : item?.propertyDetailsstatus === "1" ? (
                            <div>
                              {/* Show "Click to Book" button when propertyDetailsstatus is 1 */}
                              <button
                                className="bg-blue-900 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded"
                                onClick={() =>
                                  handleStatusChange(item._id, "Booked")
                                }
                              >
                                Click to Book
                              </button>

                              {/* Show "Update Payment Details" button when propertyDetailsstatus is 1 */}
                              <button className="bg-blue-800 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded mt-2">
                                <NavLink
                                  to={`/addPropertyDetails/${item?._id}`}
                                >
                                  <span className="block w-full text-left px-4 py-2 text-sm ">
                                    Update Payment Details
                                  </span>
                                </NavLink>
                              </button>
                            </div>
                          ) : null}
                        </div>
                      ) : item?.status === "Booked" ? (
                        <div>
                          <button
                            className="bg-orange-900 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded"
                            onClick={() =>
                              handleStatusChange(item._id, "Completed")
                            }
                          >
                            Click to Complete the Site
                          </button>
                          <br></br>
                          <br></br>
                          <button
                            className="bg-blue-800 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded"
                            //  onClick={() => handleStatusChange(item._id, 'approved')}
                          >
                            <NavLink to={`/addPropertyDetails/${item?._id}`}>
                              <button className="block w-full text-left px-4 py-2 text-sm ">
                                update Payment Details{" "}
                              </button>
                            </NavLink>
                          </button>
                        </div>
                      ) : (
                        <div>
                          {" "}
                          <button
                            className="bg-blue-800 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded"
                            //  onClick={() => handleStatusChange(item._id, 'approved')}
                          >
                            <NavLink to={`/addPropertyDetails/${item?._id}`}>
                              <button className="block w-full text-left px-4 py-2 text-sm ">
                                update Payment Details{" "}
                              </button>
                            </NavLink>
                          </button>
                        </div>
                      )}
                    </div>
                  </td>

                  <td className="px-6 py-4 border-2 border-gray-300 relative">
                    <div className="flex justify-center">
                      <GoKebabHorizontal
                        className="text-lg transform rotate-90 cursor-pointer"
                        onClick={() => handleKebabClick(item._id)}
                      />
                    </div>
                    {activePropertyId === item._id && (
                      <div className="absolute z-50 right-5 top-7 mt-2 w-28 bg-white border border-gray-200 shadow-lg rounded-md">
                        <NavLink to={`/sites/editsite/${item?._id}`}>
                          <button className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100">
                            <MdEdit className="inline mr-2" /> Edit
                          </button>
                        </NavLink>
                        {item?.propertyDetailsstatus === "1" && (
                          <NavLink to={`/viewsite/${item?._id}`}>
                            <button className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100">
                              <MdEdit className="inline mr-2" /> View Property
                              Details
                            </button>
                          </NavLink>
                        )}

                        {/* Uncomment this block if you want to add a delete button */}
                        {/* 
    <button
      onClick={() => handleDelete(item._id)}
      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
    >
      <MdDelete className="inline mr-2" /> Delete
    </button>
    */}
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
          Currently! There are no site in the storage.
        </div>
      )}

      {paginatedSites.length > 0 && (
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
              onClick={() => handlePageChange("prev")}
              disabled={currentPage === 1} // Disable if loader is true
              className="flex items-center justify-center px-3 h-8 text-sm font-medium text-white bg-gray-800 rounded-s hover:bg-gray-900"
            >
              Prev
            </button>
            <button
              onClick={() => handlePageChange("next")}
              disabled={paginatedSites.length < pageSize}
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

export default Sites;

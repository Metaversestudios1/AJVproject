import React, { useEffect, useState } from "react";
import { MdDelete } from "react-icons/md";
import { NavLink, useParams } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import { GoKebabHorizontal } from "react-icons/go";
import "react-toastify/dist/ReactToastify.css";
import { GoBookmarkFill } from "react-icons/go";
import { MdEdit } from "react-icons/md";
const Sites = () => {
  const [sites, setSites] = useState([]);
  const [noData, setNoData] = useState(false);
  const [loader, setLoader] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [count, setCount] = useState(0);
  const [search, setSearch] = useState("");
  const [activePropertyId, setActivePropertyId] = useState(null); // For kebab menu popup
  const params = useParams();
  const { id } = params;

  useEffect(() => {
    fetchData();
  }, [page, search]);

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
    if (propertyName && propertyName.success && propertyName.result) {
      return propertyName.result.propertyname;
    } else {
      return "-"; // Return "Unknown" if data is not present
    }
  };

  const fetchClientName = async (id) => {
    const nameRes = await fetch(
      `${process.env.REACT_APP_BACKEND_URL}/api/getSingleClient`,
      {
        method: "POST",
        headers: { "Content-type": "application/json" },
        body: JSON.stringify({ id }),
      }
    );
    const clientname = await nameRes.json();
    if (clientname && clientname.success && clientname.result) {
      return clientname.result.clientname;
    } else {
      return "-"; // Return "Unknown" if data is not present
    }
  };

  const fetchAgentName = async (id) => {
    const nameRes = await fetch(
      `${process.env.REACT_APP_BACKEND_URL}/api/getSingleAgent`,
      {
        method: "POST",
        headers: { "Content-type": "application/json" },
        body: JSON.stringify({ id }),
      }
    );
    const agentname = await nameRes.json();
    if (agentname && agentname.success && agentname.result) {
      return agentname.result.agentname;
    } else {
      return "-"; // Return "Unknown" if data is not present
    }
  };
  const fetchData = async () => {
    setLoader(true);
    setSites([])
    let feturl;
  
    if (id) {
      // If the ID is present in the URL, fetch data for that specific user
      feturl = `${process.env.REACT_APP_BACKEND_URL}/api/getAllSite?page=${page}&limit=${pageSize}&search=${search}&id=${id}`;
    } else {
      // If no ID in URL, fetch all properties
      feturl = `${process.env.REACT_APP_BACKEND_URL}/api/getAllSite?page=${page}&limit=${pageSize}&search=${search}`;
    }
    
    try {
      const res = await fetch(feturl);
      const response = await res.json();
  
      if (response.success) {
        setNoData(false);
  
        // If no data is returned
        if (response.result.length === 0) {
          setNoData(true);
        }
  
        const sitesWithPropertyNames = await Promise.all(
          response.result.map(async (site) => {
            let propertyName, agentName, clientName;
  
            if (site.propertyId) {
              propertyName = await fetchPropertyName(site.propertyId);
            }
  
            if (site.agentId) {
              agentName = await fetchAgentName(site.agentId);
            }
  
            if (site.clientId) {
              clientName = await fetchClientName(site.clientId);
            }
  
            return {
              ...site,
              propertyName: propertyName,
              ClientName: clientName,
              AgentName: agentName,
            };
          })
        );
  
        setSites(sitesWithPropertyNames);
        setCount(response.count || sitesWithPropertyNames.length);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoader(false); // Ensure the loader is stopped even if fetch fails
    }
  };

  const handleKebabClick = (propertyId) => {
    // Toggle the kebab menu for the clicked row
    setActivePropertyId(activePropertyId === propertyId ? null : propertyId);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "search") {
      setSearch(value);
      setPage(1);
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
            setPage((prevPage) => Math.max(prevPage - 1, 1));
          } else {
            fetchData();
          }
        }
      } catch (error) {
        console.error("Error updating status:", error);
        alert("Error updating status");
      }
    }
  };

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
        <div className="text-2xl font-bold mx-2 my-8 px-4">Sites List</div>
      </div>
      <div className="flex justify-between">
        {/* <NavLink to="/sites/addSite/">
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
        {sites.length > 0 && (
          <table className="w-full text-sm text-left rtl:text-right border-2 border-gray-300">
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
              {sites.map((item, index) => (
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
                    {item?.propertyName}
                  </th>
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
                    <button className="bg-green-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded">
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
                            <button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
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
                                className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded"
                                onClick={() =>
                                  handleStatusChange(item._id, "Booked")
                                }
                              >
                                Click to Book
                              </button>

                              {/* Show "Update Payment Details" button when propertyDetailsstatus is 1 */}
                              <button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded mt-2">
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
                            className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded"
                            onClick={() =>
                              handleStatusChange(item._id, "Completed")
                            }
                          >
                            Click to Complete the Site
                          </button>
                          <br></br>
                          <br></br>
                          <button
                            className="bg-blue-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded"
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
                        <div> <button
                        className="bg-blue-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded"
                        //  onClick={() => handleStatusChange(item._id, 'approved')}
                      >
                        <NavLink to={`/addPropertyDetails/${item?._id}`}>
                          <button className="block w-full text-left px-4 py-2 text-sm ">
                            update Payment Details{" "}
                          </button>
                        </NavLink>
                      </button></div>
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

      {sites.length > 0 && (
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
        disabled={page === 1 || loader}  // Disable if loader is true
        className="flex items-center justify-center px-3 h-8 text-sm font-medium text-white bg-gray-800 rounded-s hover:bg-gray-900"
      >
        Prev
      </button>
      <button
        onClick={() => setPage(page + 1)}
        disabled={loader || sites.length < pageSize || startIndex + pageSize >= count}
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

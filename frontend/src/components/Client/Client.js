import React, { useEffect, useState } from "react";
import { MdDelete } from "react-icons/md";
import { CiEdit } from "react-icons/ci";
import { NavLink } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ImCross } from "react-icons/im";
import { IoMdEye } from "react-icons/io";
import { GoKebabHorizontal } from "react-icons/go";

const Client = () => {
  const [clients, setClients] = useState([]);
  const [noData, setNoData] = useState(false);
  const [loader, setLoader] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [count, setCount] = useState(0);
  const [search, setSearch] = useState("");
  const [activePropertyId, setActivePropertyId] = useState(null); // For kebab menu popup

  useEffect(() => {
    fetchData();
  }, [page, search]);

 

  const fetchData = async () => {
    setLoader(true);
    try {
      const res = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/getAllClient?page=${page}&limit=${pageSize}&search=${search}`
      );
      const response = await res.json();
  
      if (response.success) {
        const clientsData = response.result;
  
        // Fetch the booked property name for each client
        const updatedClients = await Promise.all(
          clientsData.map(async (client) => {
            if (client.bookedProperties) {
              // Fetch the property details using the property ID
              const propertyRes = await fetch(
                `${process.env.REACT_APP_BACKEND_URL}/api/getSingleProperty`,{
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ id : client.bookedProperties }),
                }
              );
              const propertyData = await propertyRes.json();
              console.log(propertyData)
              // Add the property name to the client object
              if (propertyData.success) {
                client.bookedProperties = propertyData.result.propertyname
                ; // Assuming the API returns propertyName
              }
            }
            return client;
          })
        );
  console.log(updatedClients)
        setClients(updatedClients);
        setCount(response.count);
        setNoData(updatedClients.length === 0);
      }
    } catch (error) {
      console.error("Error fetching data", error);
    } finally {
      setLoader(false);
    }
  };
  

  const handleDelete = async (e, id) => {
    e.preventDefault();
    const permissionOfDelete = window.confirm(
      "Are you sure, you want to delete the user"
    );
    if (permissionOfDelete) {
      let clientOne = clients.length === 1;
      if (count === 1) {
        clientOne = false;
      }
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/deleteClient`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) {
        throw new Error("Network response was not ok");
      }
      const response = await res.json();
      if (response.success) {
        toast.success("Employee is deleted Successfully!", {
          position: "top-right",
          autoClose: 1000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });
        if (clientOne) {
          setPage(page - 1);
        } else {
          fetchData();
        }
      }
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
        <div className="text-2xl font-bold mx-2 my-8 px-4">Clients List</div>
      </div>
      <div className="flex justify-between">
        <NavLink to="/clients/addclient">
          <button className="bg-blue-800 text-white p-3 m-5 text-sm rounded-lg">
            Add New
          </button>
        </NavLink>

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
        {clients.length > 0 && (
          <table className="w-full text-sm text-left rtl:text-right border-2 border-gray-300">
            <thead className="text-xs uppercase bg-gray-200">
              <tr>
                <th scope="col" className="px-6 py-3 border-2 border-gray-300">
                  Sr no.
                </th>
                <th scope="col" className="px-6 py-3 border-2 border-gray-300">
                  name
                </th>
                <th scope="col" className="px-6 py-3 border-2 border-gray-300">
                  Contact Number
                </th>
                <th scope="col" className="px-6 py-3 border-2 border-gray-300">
                  email
                </th>
                <th scope="col" className="px-6 py-3 border-2 border-gray-300">
                  address
                </th>
                <th scope="col" className="px-6 py-3 border-2 border-gray-300">
                  Booked Properties
                </th>
                <th scope="col" className="px-6 py-3 border-2 border-gray-300">
                  Preferred Property Type
                </th>
                <th scope="col" className="px-6 py-3 border-2 border-gray-300">
                  budget
                </th>
                <th scope="col" className="px-6 py-3 border-2 border-gray-300">
                  notes
                </th>
                <th scope="col" className="px-6 py-3 border-2 border-gray-300">
                  Created At
                </th>
                <th scope="col" className="px-6 py-3 border-2 border-gray-300">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {clients.map((item, index) => (
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
                    {item?.clientname}
                  </th>
                  <td className="px-6 py-4 border-2 border-gray-300">
                    {item?.contactNumber}
                  </td>
                  <td className="px-6 py-4 border-2 border-gray-300">
                    {item?.email }
                  </td>
                  <td className="px-6 py-4 border-2 border-gray-300">
                    {item?.address }
                  </td>
                  <td className="px-6 py-4 border-2 border-gray-300">
                    {item?.bookedProperties}
                  </td>
                  <td className="px-6 py-4 border-2 border-gray-300">
                    {item?.preferredPropertyType }
                  </td>
                  <td className="px-6 py-4 border-2 border-gray-300">
                    {item?.budget || 'N/A'}
                  </td>
                  <td className="px-6 py-4 border-2 border-gray-300">
                    {item?.notes || 'N/A'}
                  </td>
                  <td className="px-6 py-4 border-2 border-gray-300">
                    {item?.createdAt?.split("T")[0]}
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
                      <NavLink to={`/clients/editclient/${item._id}`}>
                      <button
                      onClick={() => console.log("Edit:", item._id)}
                      className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                      >
                      <CiEdit className="inline mr-2" /> Edit
                      </button>
                      </NavLink>
                        <button
                          onClick={(e) => handleDelete(e, item._id)}
                          className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                        >
                          <MdDelete className="inline mr-2" /> Delete
                        </button>
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
          Currently! There are no clients in the storage.
        </div>
      )}

      {clients.length > 0 && (
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
                clients.length < pageSize || startIndex + pageSize >= count
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

export default Client;

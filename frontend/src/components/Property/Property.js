import React, { useEffect, useState } from "react";
import { MdDelete } from "react-icons/md";
import { CiEdit } from "react-icons/ci";
import { NavLink } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import { GoKebabHorizontal } from "react-icons/go";
import "react-toastify/dist/ReactToastify.css";

const Property = () => {
  const [properties, setProperties] = useState([]);
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
    const res = await fetch(
      `${process.env.REACT_APP_BACKEND_URL}/api/getAllProperty?page=${page}&limit=${pageSize}&search=${search}`
    );
    const response = await res.json();
    if (response.success) {
      setNoData(false);
      if (response.result.length === 0) {
        setNoData(true);
      }
      setProperties(response.result);
      setCount(response.count);
      setLoader(false);
    }
  };

  const handleDelete = async (id) => {
    const permissionOfDelete = window.confirm(
      "Are you sure, you want to delete the user?"
    );
    if (permissionOfDelete) {
      let propertyOne = properties.length === 1;
      if (count === 1) {
        propertyOne = false;
      }
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/deleteemployee`, {
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
        if (propertyOne) {
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
        <div className="text-2xl font-bold mx-2 my-8 px-4">Property List</div>
      </div>
      <div className="flex justify-between">
        <NavLink to="/properties/addproperty">
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
        {properties.length > 0 && (
          <table className="w-full text-sm text-left rtl:text-right border-2 border-gray-300">
            <thead className="text-xs uppercase bg-gray-200">
              <tr>
                <th scope="col" className="px-6 py-3 border-2 border-gray-300">
                  Sr no.
                </th>
                <th scope="col" className="px-6 py-3 border-2 border-gray-300">
                  property Name
                </th>
                <th scope="col" className="px-6 py-3 border-2 border-gray-300">
                  property Image
                </th>
                <th scope="col" className="px-6 py-3 border-2 border-gray-300">
                  description 
                </th>
                <th scope="col" className="px-6 py-3 border-2 border-gray-300">
                  address
                </th>
                <th scope="col" className="px-6 py-3 border-2 border-gray-300">
                  sites
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
              {properties.map((item, index) => (
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
                    {item?.propertyname}
                  </th>
                  <td className="px-6 py-4 border-2 border-gray-300 relative">
  {item?.photo?.url && (
    <>
      <img
        src={item.photo.url}
        alt="Profile"
        className="w-12 h-12 rounded-full object-cover aspect-square"
        style={{ width: "50px", height: "50px" }} // Set width and height to 50px
      />
     
    </>
  )}
</td>

                  <td className="px-6 py-4 border-2 border-gray-300">
                    {item?.description}
                  </td>
                  <td className="px-6 py-4 border-2 border-gray-300">
                    {item?.address}
                  </td>
                  <td className="px-6 py-4 border-2 border-gray-300">
                    {item?.sites}
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
                      <NavLink to={`/sites/addSite/${item?._id}`}>
                      <button
                          className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                        >
                          Add Sites
                        </button>
                        </NavLink>
                        {/*<button
                          onClick={() => console.log("Edit:", item._id)}
                          className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                        >
                          <CiEdit className="inline mr-2" /> Edit
                        </button>
                        <button
                          onClick={() => handleDelete(item._id)}
                          className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                        >
                          <MdDelete className="inline mr-2" /> Delete
                        </button>*/}
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

      {properties.length > 0 && (
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
                properties.length < pageSize || startIndex + pageSize >= count
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

export default Property;

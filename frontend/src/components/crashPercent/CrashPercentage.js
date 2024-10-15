import React, { useEffect, useState } from "react";
import { MdDelete } from "react-icons/md";
import { IoMdEye } from "react-icons/io";
import { CiEdit } from "react-icons/ci";
import { NavLink } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const CrashPercentage = () => {
  const navigate = useNavigate();
  const [wins, setWins] = useState([]);
  const [loader, setLoader] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [noData, setNoData] = useState(false);
  const [count, setCount] = useState(0);
  const [search, setSearch] = useState("");
  

  useEffect(() => {
    fetchWins();
  }, [page, search]);

  const fetchWins = async () => {
    try {
      setLoader(true);
      const res = await fetch(
        `http://localhost:8000/api/getAllplanecrash?page=${page}&limit=${pageSize}&search=${search}&transactionType=withdraw`
      );
      const response = await res.json();
      console.log(response)
      if (response.success) {
        setWins(response.result);
        setNoData(response.result.length === 0);
        setCount(response.count);
      }
      setLoader(false);
    } catch (error) {
      console.error("Error fetching wins:", error);
      setLoader(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "search") {
      setSearch(value);
      setPage(1);
    } 
  };

  const handleStatusChange = async (id, newStatus) => {
    let status = newStatus === 1 ? "Inactive" : "Activate";
    const permissionOfDelete = window.confirm(
      `Are you sure you want to ${status} the Project?`
    );
    if (permissionOfDelete) {
      let projectOne = wins.length === 1;
      if (count === 1) {
        projectOne = false;
      }
      try {
        const res = await fetch(
          `http://localhost:8000//api/updatestatus/Project/${id}`,
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
          toast.success(`Project is ${status} Successfully!`, {
            position: "top-right",
            autoClose: 1000,
          });
          if (projectOne) {
            setPage((prevPage) => Math.max(prevPage - 1, 1));
          } else {
            fetchWins();
          }
        }
      } catch (error) {
        console.error("Error updating status:", error);
        alert("Error updating status");
      }
    }
  };
  const handleDelete = async (e, id) => {
    e.preventDefault();
    const permissionOfDelete = window.confirm(
      "Are you sure, you want to delete the crash percentage"
    );
    if (permissionOfDelete) {
      let winsOne = wins.length === 1;
      if (count === 1) {
        winsOne = false;
      }
      const res = await fetch(`http://localhost:8000/api/deleteplanecrash`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) {
        throw new Error("Network response was not ok");
      }
      const response = await res.json();
      if (response.success) {
        toast.success("Percentage is deleted Successfully!", {
          position: "top-right",
          autoClose: 1000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });
        if (winsOne) {
          setPage(page - 1);
        } else {
          fetchWins();
        }
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
        <div className="text-2xl font-bold mx-2 my-8 px-4">Crash percentage </div>
      </div>
      <div className="flex justify-between">
        <NavLink to="/addcrashpercentage">
          <button className="bg-blue-800 text-white p-3 m-5 text-sm rounded-lg">
            Add New
          </button>
        </NavLink>
        <input
          placeholder="Search "
          type="text"
          name="search"
          value={search}
          onChange={handleChange}
          className="text-black border-[1px] rounded-lg bg-white p-2 m-5"
        />
        
      </div>

      {loader && (
        <div className="absolute h-full w-full flex justify-center items-center">
          <div
            className="flex justify-center h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-e-transparent text-surface dark:text-white"
            role="status"
          >
            <span className="absolute m-px h-px w-px overflow-hidden whitespace-nowrap border-0 p-0">
              Loading...
            </span>
          </div>
        </div>
      )}

      <div className="relative overflow-x-auto m-5 mb-0">
        {wins.length > 0 && (
          <table className="w-full text-sm text-left border-2 border-gray-300">
            <thead className="text-xs uppercase bg-gray-200">
              <tr>
                <th className="px-6 py-3 border-2">Sr no.</th>
                <th className="px-6 py-3 border-2">First value</th>
                <th className="px-6 py-3 border-2">Second value</th>
                <th className="px-6 py-3 border-2">Crash percentage</th>
                <th className="px-6 py-3 border-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {wins.map((item, index) => (
                <tr key={item._id} className="bg-white border-b">
                  <th className="px-6 py-4 font-medium border-2">
                    {startIndex + index + 1}
                  </th>
                  <td className="px-6 py-4 font-medium border-2">
                    {item?.firstValue}
                  </td>
                  <td className="px-6 py-4 font-medium border-2">
                    {item?.secondValue}
                  </td>
                  <td className="px-6 py-4 font-medium border-2">
                    {item?.crashPercentage}%
                  </td>

                  <td className="px-6 py-4 font-medium border-2">
                    <div className="flex justify-center gap-2">
                      <CiEdit
                        className="text-xl text-blue-500 hover:scale-110 cursor-pointer"
                        onClick={() => navigate(`/editcrashpercentage/${item._id}`)}
                      />
                      <MdDelete
                        onClick={(e) => handleDelete(e, item?._id)}
                        className="text-2xl cursor-pointer text-red-900"
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {noData && (
          <div className="text-center text-2xl font-semibold text-gray-500 p-10">
            No Data Found in Crash percentage
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <button
          onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
          disabled={page === 1}
          className={`bg-blue-800 text-white p-2 m-5 text-sm rounded-lg ${
            page === 1 ? "opacity-50" : ""
          }`}
        >
          Previous
        </button>
        <button
          onClick={() =>
            setPage((prev) => (wins.length === 0 ? prev : prev + 1))
          }
          disabled={
            wins.length < pageSize || startIndex + pageSize >= count
          }
          className={`bg-blue-800 text-white p-2 m-5 text-sm rounded-lg ${
            wins.length < pageSize || startIndex + pageSize >= count ? "opacity-50" : ""
          }`}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default CrashPercentage;

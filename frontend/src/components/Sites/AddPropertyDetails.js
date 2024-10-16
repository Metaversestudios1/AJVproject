import React, { useEffect, useState } from "react";
import { IoIosArrowRoundBack } from "react-icons/io";
import { useNavigate, useParams } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import $ from "jquery";
import "jquery-validation";

const AddPropertyDetails = () => {
  const [loader, setLoader] = useState(false);
  const [clients, setClients] = useState([]);
  const [agents, setAgents] = useState([]);
  const [propertyName, setPropertyName] = useState("");
  const [error, setError] = useState("");
  const params = useParams();
  const { id } = params;
  const navigate = useNavigate();

  const initialState = {
    propertyDetails: {
      totalValue: "",
      amountPaid: "",
      balanceRemaining: "",
    },
    saleDeedDetails: {
      deedNumber: "",
      executionDate: "",
      buyer: "",
      seller: "",
      propertyDescription: "",
      saleAmount: "",
      witnesses: "",
      registrationDate: "",
    },
  };
  const [data, setData] = useState(initialState);
  //   useEffect(() => {
  //     setLoader(true);
  //     const fetchData = async () => {
  //       try {
  //         const [agentRes, clientRes, propertyRes] = await Promise.all([
  //           fetch(`${process.env.REACT_APP_BACKEND_URL}/api/getAllAgent`),
  //           fetch(`${process.env.REACT_APP_BACKEND_URL}/api/getAllClient`),
  //           fetch(`${process.env.REACT_APP_BACKEND_URL}/api/getSingleProperty`, {
  //             method: "POST",
  //             headers: { "Content-Type": "application/json" },
  //             body: JSON.stringify({ id }),
  //           }),
  //         ]);

  //         const [agentData, clientData, propertyData] = await Promise.all([
  //           agentRes.json(),
  //           clientRes.json(),
  //           propertyRes.json(),
  //         ]);

  //         if (agentData.success)
  //           setAgents([{ agentname: "happy", _id: "670f5383cfcf0e7090ea312e" }]);
  //         if (clientData.success)
  //           setClients([{ name: "heera", _id: "670f5383cfcf0e7070ea312e" }]);
  //         if (propertyData.success) {
  //           setData((prevData) => ({
  //             ...prevData,
  //             propertyId: propertyData.result._id, // Store the ID in data
  //           }));
  //           setPropertyName(propertyData.result.propertyname); // Store the name separately
  //         }
  //         setLoader(false);
  //       } catch (error) {
  //         console.error("Error fetching data:", error);
  //       }
  //     };

  //     fetchData();
  //   }, [id]);

  const validatesiteform = () => {
    $("#siteform").validate({
      rules: {
        totalValue: {
          required: true,
        },
        amountPaid: {
          required: true,
        },
        balanceRemaining: {
          required: true,
        },
      },
      messages: {
        totalValue: {
          required: "Please enter total value",
        },
        amountPaid: {
          required: "Please enter amount paid",
        },
        balanceRemaining: {
          required: "Please enter Balance remaining",
        },
      },
      errorElement: "div",
      errorPlacement: function (error, element) {
        error.addClass("invalid-feedback");
        error.insertAfter(element);
      },
      highlight: function (element, errorClass, validClass) {
        $(element).addClass("is-invalid").removeClass("is-valid");
      },
      unhighlight: function (element, errorClass, validClass) {
        $(element).removeClass("is-invalid").addClass("is-valid");
      },
    });

    // Return validation status
    return $("#siteform").valid();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Check if the name corresponds to a nested property
    if (name in data.propertyDetails) {
      setData((prevData) => ({
        ...prevData,
        propertyDetails: {
          ...prevData.propertyDetails,
          [name]: value, // Update only the specific property
        },
        ...prevData.saleDeedDetails
      }));
    } else if (name in data.saleDeedDetails) {
      setData((prevData) => ({
        ...prevData,
        ...prevData.propertyDetails,
        saleDeedDetails: {
          ...prevData.saleDeedDetails,
          [name]: value, // Update only the specific property
        },
      }));
    } else {
      setData({ ...data, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validatesiteform()) {
      return;
    }
    try {
      setLoader(true);
      const updatedata = { id, data };
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/updateSite`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedata),
      });
      const response = await res.json();
      console.log(response);
      if (response.success) {
        toast.success("Property details updated Successfully for the site!", {
          position: "top-right",
          autoClose: 1000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });
        setTimeout(() => {
          navigate("/sites");
        }, 1500);
      } else {
        setLoader(false);
        setError(response.message);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };
  console.log(data);

  return (
    <>
      <div className="flex items-center ">
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
          <IoIosArrowRoundBack
            onClick={handleGoBack}
            className="bg-[#032e4e] text-white rounded-sm text-[40px] cursor-pointer shadow-xl ml-5"
          />
        </div>
        <div className="flex items-center">
          <div className="text-2xl font-bold mx-2 my-8 px-4">
            Add Property details
          </div>
        </div>
      </div>
      {loader ? (
        <div className="absolute w-[80%] h-[40%] flex justify-center items-center">
          <div
            className=" flex justify-center h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-e-transparent align-[-0.125em] text-surface motion-reduce:animate-[spin_1.5s_linear_infinite] "
            role="status"
          >
            <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
              Loading...
            </span>
          </div>
        </div>
      ) : (
        <div className="w-[50%] m-auto my-10">
          <form id="siteform">
            <div className="my-2">
              <label
                htmlFor="totalValue"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-black"
              >
                Total value
                <span className="text-red-900 text-lg ">&#x2a;</span>
              </label>
              <input
                name="totalValue"
                value={data.propertyDetails.totalValue}
                onChange={handleChange}
                type="text"
                id="totalValue"
                className="bg-gray-200 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-black block w-full p-2.5 "
                placeholder="Enter total value"
                required
              />
            </div>
            <div className="my-2">
              <label
                htmlFor="amountPaid"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-black"
              >
                Amount Paid
                <span className="text-red-900 text-lg ">&#x2a;</span>
              </label>
              <input
                name="amountPaid"
                value={data.propertyDetails.amountPaid}
                onChange={handleChange}
                type="text"
                id="amountPaid"
                className="bg-gray-200 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-black block w-full p-2.5 "
                placeholder="Enter amount paid"
                required
              />
            </div>
            <div className="my-2">
              <label
                htmlFor="balanceRemaining"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-black"
              >
                Balance Remaining
                <span className="text-red-900 text-lg ">&#x2a;</span>
              </label>
              <input
                name="balanceRemaining"
                value={data.propertyDetails.balanceRemaining}
                onChange={handleChange}
                type="text"
                id="balanceRemaining"
                className="bg-gray-200 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-black block w-full p-2.5 "
                placeholder="Enter balance remaining"
                required
              />
            </div>
            <div className="my-2">
              <label
                htmlFor="deedNumber"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-black"
              >
              Deed Number
              </label>
              <input
                name="deedNumber"
                value={data.saleDeedDetails.deedNumber}
                onChange={handleChange}
                type="text"
                id="deedNumber"
                className="bg-gray-200 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-black block w-full p-2.5 "
                placeholder="Enter deed number"
              />
            </div>
            <div className="my-2">
              <label
                htmlFor="executionDate"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-black"
              >
              Execution Date
              </label>
              <input
                name="executionDate"
                value={data.saleDeedDetails.executionDate}
                onChange={handleChange}
                type="date"
                id="executionDate"
                className="bg-gray-200 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-black block w-full p-2.5 "
                placeholder="Enter execution date"
              />
            </div>
            <div className="my-2">
              <label
                htmlFor="buyer"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-black"
              >
              Buyer
              </label>
              <input
                name="buyer"
                value={data.propertyDetails.buyer}
                onChange={handleChange}
                type="text"
                id="buyer"
                className="bg-gray-200 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-black block w-full p-2.5 "
                placeholder="Enter buyer name"
              />
            </div>
            <div className="my-2">
              <label
                htmlFor="seller"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-black"
              >
              Seller
              </label>
              <input
                name="seller"
                value={data.saleDeedDetails.seller}
                onChange={handleChange}
                type="text"
                id="seller"
                className="bg-gray-200 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-black block w-full p-2.5 "
                placeholder="Enter seller name"
              />
            </div>
            <div className="my-2">
              <label
                htmlFor="propertyDescription"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-black"
              >
              Property Description
              </label>
              <input
                name="propertyDescription"
                value={data.saleDeedDetails.propertyDescription}
                onChange={handleChange}
                type="text"
                id="propertyDescription"
                className="bg-gray-200 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-black block w-full p-2.5 "
                placeholder="Enter property description"
              />
            </div>
            <div className="my-2">
              <label
                htmlFor="saleAmount"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-black"
              >
              Sale Amount
              </label>
              <input
                name="saleAmount"
                value={data.saleDeedDetails.saleAmount}
                onChange={handleChange}
                type="text"
                id="saleAmount"
                className="bg-gray-200 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-black block w-full p-2.5 "
                placeholder="Enter Sale Amount"
              />
            </div>
            <div className="my-2">
              <label
                htmlFor="witnesses"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-black"
              >
              Witnesses
              </label>
              <input
                name="witnesses"
                value={data.saleDeedDetails.witnesses}
                onChange={handleChange}
                type="text"
                id="witnesses"
                className="bg-gray-200 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-black block w-full p-2.5 "
                placeholder="Enter witnesses"
              />
            </div>
            <button
              type="submit"
              onClick={handleSubmit}
              className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            >
              Update
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default AddPropertyDetails;

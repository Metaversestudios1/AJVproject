import React, { useEffect, useState } from "react";
import { IoIosArrowRoundBack } from "react-icons/io";
import { useNavigate, useParams } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import { CiEdit } from "react-icons/ci";
import { NavLink } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import $ from "jquery";
import "jquery-validation";

const AddPropertyDetails = () => {
  const [loader, setLoader] = useState(false);
  const [clients, setClients] = useState([]);
  const [agents, setAgents] = useState([]);
  const [siteid, setsiteid] = useState([]);
  const [propertyName, setPropertyName] = useState("");
  const [error, setError] = useState("");
  const params = useParams();
  const { id } = params;
  const navigate = useNavigate();

  const initialState = {
    agentId: "",
    clientId: "",
    propertyDetailsstatus: "1",
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
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [agentRes, clientRes] = await Promise.all([
          fetch(
            `${process.env.REACT_APP_BACKEND_URL}/api/getAllAgentproperty?sid=${id}`
          ),
          fetch(`${process.env.REACT_APP_BACKEND_URL}/api/getAllClient`),
        ]);

        const [agentData, clientData] = await Promise.all([
          agentRes.json(),
          clientRes.json(),
        ]);
        console.log(clientData);
        if (agentData.success) setAgents(agentData.result);
        if (clientData.success) setClients(clientData.result);
        setLoader(false);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
    fetchOldData();
  }, [id]);

  const validatesiteform = () => {
    $("#siteform").validate({
      rules: {
        totalValue: {
          required: true,
          number: true, // Ensures that only numbers (including decimals) are allowed
        },
        clientId: {
          required: true,
        },
        agentId: {
          required: true,
        },
        amountPaid: {
          required: true,
          number: true,
        },
        balanceRemaining: {
          required: true,
          number: true,
        },

        saleAmount: {
          number: true,
        },
      },
      messages: {
        totalValue: {
          required: "Please enter total value",
          number: "Please enter a valid number", // Custom message for number validation
        },
        amountPaid: {
          required: "Please enter amount paid",
          number: "Please enter a valid number", // Custom message for number validation
        },
        balanceRemaining: {
          required: "Please enter Balance remaining",
          number: "Please enter a valid number", // Custom message for number validation
        },
        saleAmount: {
          number: "Please enter a valid number", // Custom message for number validation
        },
        agentId: {
          required: "Please select agent",
        },
        clientId: {
          required: "Please select client",
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

    const updatedData = { ...data };

    // Check if the name corresponds to propertyDetails
    if (name in updatedData.propertyDetails) {
      updatedData.propertyDetails = {
        ...updatedData.propertyDetails,
        [name]: value, // Update the specific property first
      };

      // After updating, recalculate balanceRemaining
      const totalValue =
        parseFloat(updatedData.propertyDetails.totalValue) || 0;
      const amountPaid =
        parseFloat(updatedData.propertyDetails.amountPaid) || 0;
      updatedData.propertyDetails.balanceRemaining = totalValue - amountPaid;
    } else if (name in updatedData.saleDeedDetails) {
      updatedData.saleDeedDetails = {
        ...updatedData.saleDeedDetails,
        [name]: value, // Update only the specific property
      };
    } else {
      updatedData[name] = value; // Update top-level property
    }

    // Update the state with the modified data
    setData(updatedData);
  };

  const fetchOldData = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/getSingleSite`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id }),
        }
      );
      const result = await response.json();
      if (result.success) {
        const formatDate = (dateString) => {
          if (dateString) {
            const date = new Date(dateString);
            return date.toISOString().split("T")[0]; // Convert to yyyy-mm-dd format
          }
          return ""; // Return empty if dateString is null/undefined
        };
        const propertyDetails = result.result?.propertyDetails || {};
        const saleDeedDetails = result.result?.saleDeedDetails || {};
        console.log(result.result?.clientId);
        setData({
          clientId: result.result?.clientId,
          agentId: result.result?.agentId,
          propertyDetailsstatus: "1",
          propertyDetails: {
            totalValue: propertyDetails.totalValue || "",
            amountPaid: propertyDetails.amountPaid || "",
            balanceRemaining: propertyDetails.balanceRemaining || "",
          },
          saleDeedDetails: {
            deedNumber: saleDeedDetails.deedNumber || "",
            executionDate: formatDate(saleDeedDetails.executionDate),
            registrationDate: formatDate(saleDeedDetails.registrationDate),
            seller: saleDeedDetails.seller || "",
            saleAmount: saleDeedDetails.saleAmount || "",
            witnesses: saleDeedDetails.witnesses || "",
            buyer: saleDeedDetails.buyer || "",
          },
        });
      } else {
        console.error("No data found for the given parameter.");
      }
    } catch (error) {
      console.error("Failed to fetch old data:", error);
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
      const res = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/updateSite`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedata),
        }
      );
      const response = await res.json();
      if (response.success) {
        toast.success("Payment details updated Successfully for the site!", {
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
            Add Payment details
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
        <div className="w-[70%] m-auto my-10">
          <form id="siteform">
            <label>
              <b>Property Details</b>
            </label>
            <div className="grid gap-6 mb-6 md:grid-cols-2 items-center">
              <div className="my-2">
                <label
                  htmlFor="clientId"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-black"
                >
                  Clients
                </label>
                <select
                  name="clientId"
                  value={data?.clientId}
                  onChange={handleChange}
                  className="bg-gray-200 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-black block w-full p-2.5 "
                >
                  <option value="">Select a client.</option>
                  {clients.map((option) => {
                    return (
                      <option
                        key={option?._id}
                        value={option?._id}
                        className=" bg-gray-200 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-black block w-full p-2.5 "
                        selected={option._id === data?.clientId}
                      >
                        {option?.clientname}
                      </option>
                    );
                  })}
                </select>
              </div>
              <div className="my-2">
                <label
                  htmlFor="agentId"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-black"
                >
                  Agents
                </label>
                <select
                  name="agentId"
                  value={data?.agentId}
                  onChange={handleChange}
                  className="bg-gray-200 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-black block w-full p-2.5"
                >
                  {agents.length === 0 ? (
                    <option value="">Assign property to agent first</option> // Show this option when no agents are available
                  ) : (
                    <>
                      <option value="">Select an agent.</option>
                      {agents.map((option) => (
                        <option
                          key={option?._id}
                          value={option?._id}
                          className="bg-gray-200 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-black block w-full p-2.5"
                          selected={option._id === data.agentId}
                        >
                          {option?.agentname}
                        </option>
                      ))}
                    </>
                  )}
                </select>
                {agents.length === 0 && (
                  <NavLink to={`/agents`}>
                    <button className="bg-green-500 text-white font-bold py-2 px-4 rounded hover:bg-green-600">
                      <CiEdit className="inline mr-2" /> Assign Properties
                    </button>
                  </NavLink>
                )}
              </div>
            </div>
            <div className="grid gap-6 mb-6 md:grid-cols-2 items-center">
              <div>
                <label
                  htmlFor="totalValue"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-black"
                >
                  Total value
                  <span className="text-red-900 text-lg ">&#x2a;</span>
                </label>
                <input
                  name="propertyDetailsstatus"
                  value={data.propertyDetailsstatus}
                  onChange={handleChange}
                  type="hidden"
                  id="propertyDetailsstatus"
                />
                <input
                  name="totalValue"
                  value={data.propertyDetails.totalValue}
                  onChange={handleChange}
                  type="number"
                  id="totalValue"
                  className="bg-gray-200 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-black block w-full p-2.5 "
                  placeholder="Eg.1234.."
                  min="1"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="amountPaid"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-black"
                >
                  First Payment
                  <span className="text-red-900 text-lg ">&#x2a;</span>
                </label>
                <input
                  name="amountPaid"
                  value={data.propertyDetails.amountPaid}
                  onChange={handleChange}
                  type="number"
                  id="amountPaid"
                  className="bg-gray-200 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-black block w-full p-2.5 "
                  placeholder="Eg.1200.."
                  required
                  min="1"
                />
              </div>
            </div>
            <div className="grid gap-6 mb-6 md:grid-cols-2 items-center">
              <div>
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
                  placeholder="Eg.100.."
                  required
                />
              </div>
            </div>
            <label>
              <b>Sales Deed Details</b>
            </label>
            &ensp; &ensp;
            <br></br>
            <div className="grid gap-6 mb-6 md:grid-cols-2 items-center">
              <div>
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
                  placeholder="Eg.ABCD"
                />
              </div>
            </div>
            <div className="grid gap-6 mb-6 md:grid-cols-2 items-center">
              <div>
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
              <div>
                <label
                  htmlFor="buyer"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-black"
                >
                  Buyer
                </label>
                <input
                  name="buyer"
                  value={data.saleDeedDetails.buyer}
                  onChange={handleChange}
                  type="text"
                  id="buyer"
                  className="bg-gray-200 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-black block w-full p-2.5 "
                  placeholder="Eg.MR.John"
                />
              </div>
            </div>
            <div className="grid gap-6 mb-6 md:grid-cols-2 items-center">
              <div>
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
                  placeholder="Eg.200"
                />
              </div>
              <div>
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
                  placeholder="Jane Smith"
                />
              </div>
            </div>
            <div className="grid gap-6 mb-6 md:grid-cols-2 items-center">
              <div>
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
                  placeholder="MR.John"
                />
              </div>
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

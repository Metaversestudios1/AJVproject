import React, { useEffect, useState } from "react";
import { IoIosArrowRoundBack } from "react-icons/io";
import { useNavigate, useParams } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import $ from "jquery";
import "jquery-validation";

const AddSite = () => {
  const [loader, setLoader] = useState(false);
  const [clients, setClients] = useState([]);
  const [agents, setAgents] = useState([]);
  const [propertyName, setPropertyName] = useState("");
  const [error, setError] = useState("");
  const params = useParams();
  const { id } = params;
  const navigate = useNavigate();

  const initialState = {
    propertyId: "",
    siteNumber: "",
    agentId: "",
    clientId: "",
  };
  const [data, setData] = useState(initialState);
  useEffect(() => {
    setLoader(true);
    const fetchData = async () => {
      try {
        const [agentRes, clientRes, propertyRes] = await Promise.all([
          fetch(`${process.env.REACT_APP_BACKEND_URL}/api/getAllAgent`),
          fetch(`${process.env.REACT_APP_BACKEND_URL}/api/getAllClient`),
          fetch(`${process.env.REACT_APP_BACKEND_URL}/api/getSingleProperty`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id }),
          }),
        ]);

        const [agentData, clientData, propertyData] = await Promise.all([
          agentRes.json(),
          clientRes.json(),
          propertyRes.json(),
        ]);

        if (agentData.success) setAgents([{agentname: "happy", _id:"670f5383cfcf0e7090ea312e"}]);
        if (clientData.success) setClients([{name: "heera", _id:"670f5383cfcf0e7070ea312e"}]);
        if (propertyData.success) {
          setData((prevData) => ({
            ...prevData,
            propertyId: propertyData.result._id, // Store the ID in data
          }));
          setPropertyName(propertyData.result.propertyname); // Store the name separately
        }
        setLoader(false);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [id]);

  const validatesiteform = () => {
    $.validator.addMethod(
      "validPhone",
      function (value, element) {
        return this.optional(element) || /^\d{10}$/.test(value);
      },
      "Please enter a valid 10-digit phone number."
    );
    // Initialize jQuery validation
    $("#siteform").validate({
      rules: {
        propertyId: {
          required: true,
        },
        siteNumber: {
          required: true,
        },
        agentId: {
          required: true,
        },
        clientId: {
          required: true,
        },
      },
      messages: {
        propertyId: {
          required: "Please enter Property id",
        },
        siteNumber: {
          required: "Please enter site number",
        },
        agentId: {
          required: "Please enter agent id",
        },
        clientId: {
          required: "Please enter client id",
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

    // Check if the name includes nested object properties
    setData({ ...data, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validatesiteform()) {
      return;
    }
    try {
      setLoader(true);
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/insertSite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const response = await res.json();
      console.log(response)
      if (response.success) {
        toast.success("New Site is added Successfully!", {
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
  console.log(data)

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
          <div className="text-2xl font-bold mx-2 my-8 px-4">Add Sites</div>
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
            htmlFor="propertyId"
            className="block mb-2 text-sm font-medium text-gray-900 dark:text-black"
          >
            Property
          </label>
          <select
            name="propertyId"
            value={data.propertyId} // This keeps the property ID selected
            onChange={handleChange} // This updates the ID in state when a new option is selected
            className="bg-gray-200 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-black block w-full p-2.5 "
          >
            <option value="">Select a property.</option>
            <option
              key={id} // Key should be unique
              value={id} // This is the ID value passed
              className=" bg-gray-200 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-black block w-full p-2.5 "
            >
              {propertyName} {/* This is where you display the name, not the ID */}
            </option>
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
                className="bg-gray-200 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-black block w-full p-2.5 "
              >
                <option value="">Select an agent.</option>
                {agents.map((option) => {
                  return (
                    <option
                      key={option?._id}
                      value={option?._id}
                      className=" bg-gray-200 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-black block w-full p-2.5 "
                    >
                      {option?.agentname}
                    </option>
                  );
                })}
              </select>
            </div>
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
                    >
                      {option?.name}
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="my-2">
              <label
                htmlFor="siteNumber"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-black"
              >
                Site Number
                <span className="text-red-900 text-lg ">&#x2a;</span>
              </label>
              <textarea
                name="siteNumber"
                value={data.siteNumber}
                onChange={handleChange}
                type="text"
                id="siteNumber"
                className="bg-gray-200 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-black block w-full p-2.5 "
                placeholder="Enter site number"
                required
              />
            </div>

            <button
              type="submit"
              onClick={handleSubmit}
              className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            >
              ADD
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default AddSite;

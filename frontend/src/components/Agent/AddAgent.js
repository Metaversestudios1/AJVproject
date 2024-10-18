import React, { useEffect, useState } from "react";
import { IoIosArrowRoundBack } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import $ from "jquery";
import "jquery-validation";
import { FaAngleDown } from "react-icons/fa6";

const AddAgent = () => {
  const [loader, setLoader] = useState(false);
  const [agentID, setAgentID] = useState("");
  const [property, setProperty] = useState([]);
  const [clients, setClients] = useState([]);
  const [ranks, setRanks] = useState([]);
  const [clientDropdownOpen, setClientDropdownOpen] = useState(false);
  const [propertyDropdownOpen, setPropertyDropdownOpen] = useState(false);

  const navigate = useNavigate();

  const initialState = {
    agentname: "",
    agent_id: "",
    password: "",
    rank: "",
  };
  const [data, setData] = useState(initialState);
  const [rankId, setRankId] = useState(""); // Track the selected rank_id

  useEffect(() => {
    fetchRank();
  }, []);

  const fetchRank = async () => {
    const res = await fetch(
      `${process.env.REACT_APP_BACKEND_URL}/api/getAllRank`
    );
    const response = await res.json();
    if (response.success) {
      setRanks(response.result);
    }
  };


 
  // Handle clients and properties separately
  const handleCheckboxChange = (e, type) => {
    const { value, checked } = e.target;

    if (type === "clients") {
      setData((prevState) => ({
        ...prevState,
        clients: checked
          ? [...prevState.clients, value]
          : prevState.clients.filter((id) => id !== value),
      }));
    } else if (type === "properties") {
      setData((prevState) => ({
        ...prevState,
        properties: checked
          ? [...prevState.properties, value]
          : prevState.properties.filter((id) => id !== value),
      }));
    }
  };

  const validateagentform = () => {
    // Initialize jQuery validation
    $("#agentform").validate({
      rules: {
        agentname: {
          required: true,
        },
        password: {
          required: true,
        },
        rank: {
          required: true,
        },
        clients: {
          required: true,
        },
        properties: {
          required: true,
        },
      },
      messages: {
        agentname: {
          required: "Please enter agent name",
        },
        password: {
          required: "Please enter password",
        },
        rank: {
          required: "Please enter rank",
        },
        clients: {
          required: "Please select a client",
        },
        properties: {
          required: "Please select properties",
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

    return $("#agentform").valid();
  };
  const handleRankChange = (e) => {
    const selectedRankId = e.target.value; // This will be the MongoDB _id
    const selectedRank = ranks.find(rank => rank._id === selectedRankId); // Find the rank object from the ranks array
  
    if (selectedRank) {
      setData({ ...data, rank: selectedRank._id, agent_id: selectedRank.rank_id}); // Set the rank collection ID (_id)
      
    }
  };
  const handleChange = (e) => {
    const { name, value } = e.target;
    setData({ ...data, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateagentform()) {
      return;
    }
    try {
      setLoader(true);
     
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/insertAgent`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const response = await res.json();
      console.log(response)
      if (response.success) {
        toast.success("New agent is added successfully!", { position: "top-right", autoClose: 1000 });
        setTimeout(() => {
          navigate("/agents");
        }, 1500);
      } else {
        setLoader(false);
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
        <ToastContainer autoClose={2000} />
        <div className="flex items-center">
          <IoIosArrowRoundBack
            onClick={handleGoBack}
            className="bg-[#032e4e] text-white rounded-sm text-[40px] cursor-pointer shadow-xl ml-5"
          />
        </div>
        <div className="flex items-center">
          <div className="text-2xl font-bold mx-2 my-8 px-4">Add Agent</div>
        </div>
      </div>
      {loader ? (
        <div className="absolute w-[80%] h-[40%] flex justify-center items-center">
          <div className="animate-spin h-8 w-8 border-4 border-current border-e-transparent rounded-full" role="status">
            <span className="sr-only">Loading...</span>
          </div>
        </div>
      ) : (
        <div className="w-[70%] m-auto my-10">
          <form id="agentform">
            <div className="grid gap-6 mb-6 md:grid-cols-2 items-center">
              <div>
                <label htmlFor="agent_id" className="block mb-2 text-sm font-medium text-gray-900 dark:text-black">
                  Agent id <span className="text-red-900 text-lg ">&#x2a;</span>
                </label>
                <input
                  name="agent_id"
                  value={data.agent_id}
                  type="text"
                  id="agent_id"
                  className="bg-gray-200 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-black block w-full p-2.5"
                  readOnly
                />
              </div>
              <div>
                <label htmlFor="agentname" className="block mb-2 text-sm font-medium text-gray-900 dark:text-black">
                  Agent name <span className="text-red-900 text-lg ">&#x2a;</span>
                </label>
                <input
                  name="agentname"
                  value={data.agentname}
                  onChange={handleChange}
                  type="text"
                  id="agentname"
                  className="bg-gray-200 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-black block w-full p-2.5"
                  placeholder="Enter Agent name"
                />
              </div>
            </div>
            <div className="grid gap-6 mb-6 md:grid-cols-2 items-center">

            <div className="">
            <label
              htmlFor="password"
              className="block mb-2 text-sm font-medium text-gray-900 dark:text-black"
            >
              Password
              <span className="text-red-900 text-lg ">&#x2a;</span>
            </label>
            <input
              name="password"
              value={data.password}
              onChange={handleChange}
              type="password"
              id="password"
              className="bg-gray-200 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-black block w-full p-2.5 "
              placeholder="Enter a password"
            />
          </div>
            {/* Rank Dropdown */}
            <div className="">
              <label htmlFor="rank" className="block mb-2 text-sm font-medium text-gray-900 dark:text-black">
                Rank
              </label>
              <select
                name="rank"
                value={data.rank}
                onChange={(e) => handleRankChange(e)}
                className="bg-gray-200 border text-gray-900 text-sm rounded-lg p-2.5 w-full"
              >
                <option value="">Select a rank.</option>
                {ranks.map((option) => (
                  <option key={option._id} value={option._id}>
                    {option.name}
                  </option>
                ))}
              </select>
            </div>
            </div>
            <div className="grid gap-6 mb-6 md:grid-cols-2 items-center">

            {/* Clients Dropdown */}
           
            </div>

            <button
              type="submit"
              onClick={handleSubmit}
              className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5"
            >
              ADD
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default AddAgent;

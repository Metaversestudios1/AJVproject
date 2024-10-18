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
  const [siteid, setsiteid] = useState([]);
  const [clientName, setClientName] = useState("");
  const [agentName, setAgentName] = useState("");
  const [propertyName, setPropertyName] = useState("");
  const [error, setError] = useState("");
  const params = useParams();
  const { id } = params;
  const navigate = useNavigate();

  const initialState = {
    agentId: "",
    clientId: "",
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
            fetch(`${process.env.REACT_APP_BACKEND_URL}/api/getSinleAgent`),
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
        const fetchedClientId = result.result?.clientId;
        const fetchedAgentId = result.result?.agentId;
        console.log(result.result?.clientId);
        setData({
           clientId: fetchedClientId,
          agentId: fetchedAgentId,        
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
        fetchClientAndAgentNames(fetchedClientId, fetchedAgentId);
     
      } else {
        console.error("No data found for the given parameter.");
      }
    } catch (error) {
      console.error("Failed to fetch old data:", error);
    }
  };

  const fetchClientAndAgentNames = async (clientId, agentId) => {
    try {
      const clientResponse = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/getSingleClient`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: clientId }),
        }
      );
      const clientResult = await clientResponse.json();
      if (clientResult.success) {
        setClientName(clientResult.result?.clientname); // Adjust based on the response structure
      }

      const agentResponse = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/getSingleAgent`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: agentId }),
        }
      );
      const agentResult = await agentResponse.json();
      if (agentResult.success) {
        setAgentName(agentResult.result?.agentname); // Adjust based on the response structure
      }
    } catch (error) {
      console.error("Error fetching client and agent names:", error);
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
            Property details
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
          <label><b>Property Details</b></label>
          <div className="grid gap-6 mb-6 md:grid-cols-2 items-center">
           
          <div className="my-2">
              <label
                htmlFor="clientId"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-black"
              >
                Clients : {clientName}
              </label>
            </div>
            <div className="my-2">
              <label
                htmlFor="agentId"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-black"
              >
                Agents : {agentName}
              </label>
            </div>
            </div>

          <div className="grid gap-6 mb-6 md:grid-cols-2 items-center">
           
          <div>
              <label
                htmlFor="totalValue"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-black"
              >
                Total value :{data.propertyDetails.totalValue}
              </label>
             
           </div>
           <div>
              <label
                htmlFor="amountPaid"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-black"
              >
                Amount Paid :
                {data.propertyDetails.amountPaid}
              </label>
            </div>
            </div>
            <div className="grid gap-6 mb-6 md:grid-cols-2 items-center">
       
            <div >
              <label
                htmlFor="balanceRemaining"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-black"
              >
                Balance Remaining : {data.propertyDetails.balanceRemaining}
               </label>
            </div>
            </div>
            <label><b>Sales Deed Details</b></label>&ensp;
            &ensp;
            <br></br>
          
            <div className="grid gap-6 mb-6 md:grid-cols-2 items-center">
       
            <div >
              <label
                htmlFor="deedNumber"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-black"
              >
              Deed Number : {data.saleDeedDetails.deedNumber}
              </label>
             
            </div>
            </div>
            <div className="grid gap-6 mb-6 md:grid-cols-2 items-center">
           
            <div >
              <label
                htmlFor="executionDate"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-black"
              >
              Execution Date : {data.saleDeedDetails.executionDate}
              </label>
              
            </div>
            <div >
              <label
                htmlFor="buyer"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-black"
              >
              Buyer : {data.saleDeedDetails.buyer}
              </label>
             
            </div>
            </div>
            
            <div className="grid gap-6 mb-6 md:grid-cols-2 items-center">
       
            <div >
              <label
                htmlFor="saleAmount"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-black"
              >
              Sale Amount : {data.saleDeedDetails.saleAmount}
              </label>
            
            </div>
            <div>
              <label
                htmlFor="witnesses"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-black"
              >
              Witnesses : {data.saleDeedDetails.witnesses}
              </label>
              
            </div>
            </div>
            <div className="grid gap-6 mb-6 md:grid-cols-2 items-center">
       
       <div >
       <label
         htmlFor="seller"
         className="block mb-2 text-sm font-medium text-gray-900 dark:text-black"
       >
       Seller : {data.saleDeedDetails.seller}
       </label>
      
     </div>
     
     </div>
          </form>
        </div>
      )}
    </>
  );
};

export default AddPropertyDetails;

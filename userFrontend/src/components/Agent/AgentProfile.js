import React, { useEffect, useState } from "react";
import { IoIosArrowRoundBack } from "react-icons/io";
import { useNavigate, useParams } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import getUserFromToken from "../utils/getUserFromToken";

const AgentProfile = () => {
    const userInfo = getUserFromToken()
  const [loader, setLoader] = useState(false);
  const [clients, setClients] = useState([]);
  const [agent, setAgent] = useState(null); // Change to object to hold agent details
  const [rank, setRank] = useState(null); // State to hold rank details
  const params = useParams();
  const [superiorAgent, setSuperiorAgent] = useState(null); // State for superior agent name
 
  const { id } = params;
  const navigate = useNavigate();
 
  useEffect(() => {
    const fetchData = async () => {
      setLoader(true); // Set loader to true while fetching data
      try {
        const [clientRes, agentRes] = await Promise.all([
          fetch(`${process.env.REACT_APP_BACKEND_URL}/api/getAllClient`),
          fetch(`${process.env.REACT_APP_BACKEND_URL}/api/getSingleAgent`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id:userInfo.id }), // Send agent ID to fetch specific agent
          }),
        ]);
 
        const clientData = await clientRes.json();
        const agentData = await agentRes.json();
 
        if (clientData.success) setClients(clientData.result);
        if (agentData.success) {
          setAgent(agentData.result); // Set agent details
 
          // Fetch the rank details
          if (agentData.result.rank) {
            const rankRes = await fetch(
              `${process.env.REACT_APP_BACKEND_URL}/api/getSingleRank`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: agentData.result.rank }), // Send rank ID to fetch specific rank
              }
            );
 
           
            const rankData = await rankRes.json();
           
            if (rankData.success) setRank(rankData.result); // Set rank details
 
            if (agentData.result.superior) {
           
              const superiorRes = await fetch(
                `${process.env.REACT_APP_BACKEND_URL}/api/getSingleAgent`,
                {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ id: agentData.result.superior }), // Pass superior agent ID
                }
              );
              const superiorData = await superiorRes.json();
              if (superiorData.success) setSuperiorAgent(superiorData.result.agentname); // Set superior agent's name
            }
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoader(false); // Always turn loader off at the end
      }
    };
 
    fetchData();
  }, [id]);
 
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
            Agent
          </div>
        </div>
      </div>
      {loader ? (
        <div className="absolute w-[80%] h-[40%] flex justify-center items-center">
          <div
            className=" flex justify-center h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-e-transparent align-[-0.125em] text-surface motion-reduce:animate-[spin_1.5s_linear_infinite]"
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
            <label><b>Agent Profile</b></label>
            <div className="grid gap-6 mb-6 md:grid-cols-2 items-center mt-3">
              {agent && (
                <>
                  <div>
                    <label
                      htmlFor="agentName"
                      className="block mb-2 text-sm font-medium text-gray-900 dark:text-black"
                    >
                      <b>Agent Name</b>: {agent.agentname}
                    </label>
                  </div>
                  <div>
                    <label
                      htmlFor="agentId"
                      className="block mb-2 text-sm font-medium text-gray-900 dark:text-black"
                    >
                      <b>Agent ID</b>: {agent.agent_id}
                    </label>
                  </div>
                  <div>
                    <label
                      htmlFor="rank"
                      className="block mb-2 text-sm font-medium text-gray-900 dark:text-black"
                    >
                      <b>Rank</b>: {rank ? rank.name : "Loading..."} {/* Display rank name */}
                    </label>
                  </div>
                  <div>
                    <label
                      htmlFor="rank"
                      className="block mb-2 text-sm font-medium text-gray-900 dark:text-black"
                    >
                     <b>Commision Rate</b> : {rank ? rank.commissionRate : "Loading..."} % {/* Display rank name */}
                    </label>
                  </div>
                  <div>
                    <label
                      htmlFor="rank"
                      className="block mb-2 text-sm font-medium text-gray-900 dark:text-black"
                    >
                      <b>Level</b>: {rank ? rank.level : "Loading..."} {/* Display rank name */}
                    </label>
                  </div>
                  <div>
                    <label
                      htmlFor="clients"
                      className="block mb-2 text-sm font-medium text-gray-900 dark:text-black"
                    >
                      <b>Clients </b>: {agent.clients?.length || "None"}
                    </label>
                  </div>
                  <div>
                    <label
                      htmlFor="properties"
                      className="block mb-2 text-sm font-medium text-gray-900 dark:text-black"
                    >
                      <b>Properties</b>: {agent.properties?.length || "None"}
                    </label>
                  </div>
                  <div>
                    <label
                      htmlFor="superior"
                      className="block mb-2 text-sm font-medium text-gray-900 dark:text-black"
                    >
                     <b>Referal Agent</b> : {superiorAgent || "None"}
                    </label>
                  </div>
                </>
              )}
            </div>
          </form>
        </div>
      )}
    </>
  );
};
 
export default AgentProfile;
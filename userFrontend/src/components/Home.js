import React, { useEffect, useState } from "react";
import getUserFromToken from "../components/utils/getUserFromToken";
import { NavLink } from "react-router-dom";
import { IoIosArrowRoundForward } from "react-icons/io";
import { IoHomeOutline } from "react-icons/io5";
import { LiaSitemapSolid } from "react-icons/lia";
import { MdOutlineEventAvailable } from "react-icons/md";
import { FaRegBookmark } from "react-icons/fa6";
const Home = () => {
  const userInfo = getUserFromToken();
  const [loader, setLoader] = useState(true);
  const [totalClient, setTotalClient] = useState(0);
  const [totalClientSites, setTotalClientSites] = useState(0);
  const [totalProperties, setTotalProperties] = useState(0);
  const [totalSites, setTotalSites] = useState(0);
  const [totalAvailableSites, setTotalAvailableSites] = useState(0);
  const [totalBookedSites, setTotalBookedSites] = useState(0);

  useEffect(() => {
    setLoader(true);

    const fetchData = async () => {
      try {
        if (userInfo.role === "client") {
          await fetchClientSites();
        } else if (userInfo.role === "agent") {
          await Promise.all([fetchPropertyCount(), fetchClientCount()]);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoader(false);
      }
    };

    fetchData();
  }, [userInfo.role]); // Dependency on userInfo.role to refetch if role changes
  const fetchClient = async () => {
    const res = await fetch(
      `${process.env.REACT_APP_BACKEND_URL}/api/getSingleClient`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: userInfo?.id }),
      }
    );
    const response = await res.json();
    return response?.result;
  };

  const fetchAllSites = async () => {
    const res = await fetch(
      `${process.env.REACT_APP_BACKEND_URL}/api/getAllSite`
    );
    const siteData = await res.json();
    if (siteData.success) {
      return siteData.result;
    }
    return [];
  };
  const fetchClientSites = async () => {
    const clientData = await fetchClient();
    if (clientData && clientData.bookedProperties) {
      const bookedProperties = clientData.bookedProperties; // This should be an array of booked property IDs

      // Fetch all sites
      const allSites = await fetchAllSites();
      let sitesForClient = [];
      // Filter sites that match the booked property IDs or where the client_id matches the userInfo.id
      const matchingSites = allSites.filter((site) => {
        const isBookedProperty = bookedProperties === site.propertyId._id;
        console.log(isBookedProperty);

        // Check if site propertyId matches any booked property
        const isClientSite = site.clientId === userInfo.id; // Check if site belongs to the client
        console.log(isClientSite);
        return isBookedProperty && isClientSite; // Only return sites that match either condition
      });
      sitesForClient = [...sitesForClient, ...matchingSites];
      setTotalClientSites(sitesForClient.length)
    }
  };

  const fetchPropertyCount = async () => {
    const res = await fetch(
      `${process.env.REACT_APP_BACKEND_URL}/api/getSingleAgent`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: userInfo?.id }), // Assuming agent_id is in userInfo
      }
    );
    const response = await res.json();
    const properties = response.result.properties;
    setTotalProperties(properties.length);

    // Fetch sites for all properties
    await fetchSitesForProperties(properties);
  };

  const fetchSitesForProperties = async (properties) => {
    try {
      let totalSiteCount = 0;
      let availableSiteCount = 0;
      let bookedSiteCount = 0;

      // Fetch all sites once, instead of making multiple requests
      const res = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/getAllSite`
      );

      const response = await res.json();
      const allSites = response.result;
      // Now filter the sites by property ID
      properties.forEach((property) => {
        const sitesForProperty = allSites.filter(
          (site) => site.propertyId._id === property
        );

        // Count total, available, and booked sites for the current property
        totalSiteCount += sitesForProperty.length;
        availableSiteCount += sitesForProperty.filter(
          (site) => site.status === "Available"
        ).length;
        bookedSiteCount += sitesForProperty.filter(
          (site) => site.status === "Booked"
        ).length;
      });

      // Set the counts in state after processing
      setTotalSites(totalSiteCount);
      setTotalAvailableSites(availableSiteCount);
      setTotalBookedSites(bookedSiteCount);
    } catch (error) {
      console.error("Error fetching sites:", error);
    }
  };

  const fetchClientCount = async () => {
    const res = await fetch(
      `${process.env.REACT_APP_BACKEND_URL}/api/getclientcount`
    );
    const response = await res.json();
    setTotalClient(response.count);
  };

  return (
    <div>
      {loader ? (
        <div className="absolute z-20 h-full w-full md:right-6 flex justify-center items-center">
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
        <div className="flex flex-col md:flex-row p-3 mb-6 w-full">
          {/* Property Summary */}
          {(userInfo.role === "Agent" || userInfo.role === "agent") ? (
            <div className="flex gap-2 flex-1 my-1">
              <div className="bg-white shadow-lg shadow-gray-200 rounded-2xl p-4">
                <NavLink to="/properties">
                  <div className="flex items-center">
                    <div className="inline-flex justify-center items-center w-12 h-12 text-white bg-[#1E88E5] rounded-lg">
                      <IoHomeOutline className="text-xl" />
                    </div>
                    <div className="ml-3">
                      <span className="text-2xl font-bold leading-none text-gray-900 sm:text-3xl">
                        {totalProperties}
                      </span>
                      <h3 className="text-base font-normal text-gray-500">
                        Total Properties
                      </h3>
                    </div>
                  </div>
                </NavLink>
              </div>

              <br />

              {/* Total Sites */}
              <div className="bg-white shadow-lg shadow-gray-200 rounded-2xl p-4">
                <NavLink to="/sites">
                  <div className="flex items-center">
                    <div className="inline-flex justify-center items-center w-12 h-12 text-white bg-[#1E88E5] rounded-lg">
                      <LiaSitemapSolid className="text-xl" />
                    </div>
                    <div className="ml-3">
                      <span className="text-2xl font-bold leading-none text-gray-900 sm:text-3xl">
                        {totalSites}
                      </span>
                      <h3 className="text-base font-normal text-gray-500">
                        Total Sites
                      </h3>
                    </div>
                  </div>
                </NavLink>
              </div>

              <br />

              {/* Available Sites */}
              <div className="bg-white shadow-lg shadow-gray-200 rounded-2xl p-4">
                <NavLink to="/sites">
                  <div className="flex items-center">
                    <div className="inline-flex justify-center items-center w-12 h-12 text-white bg-[#1E88E5] rounded-lg">
                      <MdOutlineEventAvailable className="text-xl" />
                    </div>
                    <div className="ml-3">
                      <span className="text-2xl font-bold leading-none text-gray-900 sm:text-3xl">
                        {totalAvailableSites}
                      </span>
                      <h3 className="text-base font-normal text-gray-500">
                        Available Sites
                      </h3>
                    </div>
                  </div>
                </NavLink>
              </div>

              <br />

              {/* Booked Sites */}
              <div className="bg-white shadow-lg shadow-gray-200 rounded-2xl p-4">
                <NavLink to="/sites">
                  <div className="flex items-center">
                    <div className="inline-flex justify-center items-center w-12 h-12 text-white bg-[#1E88E5] rounded-lg">
                      <FaRegBookmark className="text-xl" />
                    </div>
                    <div className="ml-3">
                      <span className="text-2xl font-bold leading-none text-gray-900 sm:text-3xl">
                        {totalBookedSites}
                      </span>
                      <h3 className="text-base font-normal text-gray-500">
                        Booked Sites
                      </h3>
                    </div>
                  </div>
                </NavLink>
              </div>
            </div>
          ):(<div className="flex gap-2 flex-1 my-1">
            <div className="bg-white shadow-lg shadow-gray-200 rounded-2xl p-4">
              <NavLink to="/properties">
                <div className="flex items-center">
                  <div className="inline-flex justify-center items-center w-12 h-12 text-white bg-[#1E88E5] rounded-lg">
                    <LiaSitemapSolid className="text-xl" />
                  </div>
                  <div className="ml-3">
                    <span className="text-2xl font-bold leading-none text-gray-900 sm:text-3xl">
                      {totalClientSites}
                    </span>
                    <h3 className="text-base font-normal text-gray-500">
                      Total client Sites
                    </h3>
                  </div>
                </div>
              </NavLink>
            </div>

            <br />

  
          </div>)}
        </div>
      )}
    </div>
  );
};

export default Home;

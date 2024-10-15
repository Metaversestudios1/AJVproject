import React, { useEffect, useState } from "react";
import { IoIosArrowRoundBack } from "react-icons/io";
import { useNavigate, useParams } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import $ from "jquery";
import "jquery-validation";
import { FaAngleDown } from "react-icons/fa6";

const EditWinPercentage = () => {
    const params = useParams();
  const { id } = params;
  const [loader, setLoader] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const initialState = {
    firstValue: "",
    secondValue: "",
    crashPercentage: "",
  };
  const [oldData, setOldData] = useState(initialState);
  useEffect(() => {
    fetchOldData();
  }, []);
  const fetchOldData = async () => {
    const res = await fetch(`http://localhost:8000/api/getSingleplanecrash`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    const response = await res.json();
    if (response.success) {
      setOldData({
        ...oldData,
        firstValue: response.result.firstValue,
        secondValue: response.result.secondValue,
        crashPercentage: response.result.crashPercentage,
      });
    }
  };
  const validateWinsForm = () => {
    // Initialize jQuery validation
    $("#winsForm").validate({
      rules: {
        firstValue: {
          required: true,
        },
        secondValue: {
          required: true,
        },
        crashPercentage: {
          required: true,
        },
      },
      messages: {
        firstValue: {
          required: "Please enter first value",
        },
        secondValue: {
          required: "Please enter second value",
        },
        crashPercentage: {
          required: "Please enter crash percentage",
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
    return $("#winsForm").valid();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setOldData?.({ ...oldData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateWinsForm()) {
      return;
    }

    try {
      setLoader(true);
      const updatedata = {oldData, id}
      const res = await fetch(`http://localhost:8000/api/updateplanecrash`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedata),
      });
      const response = await res.json();
      if (response.success) {
        toast.success("Percentage is updated Successfully!", {
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
          navigate("/crashpercentage");
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
          <div className="text-2xl font-bold mx-2 my-8 px-4">Edit Crash Percentage</div>
        </div>
      </div>
      {loader ? (
        <div className="absolute w-[80%] h-[80%] flex justify-center items-center">
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
        
  <div className="flex w-[90%] m-auto my-5">
          <div className="flex-1 flex flex-col p-4">
            <div className=""><span><b>Rule 1</b></span> -If Plane crash value set between 1 to 2 means it will crash  between 1.0 to 1.99</div><br></br>
          
            {/* <div className=""><span><b>Rule 1</b></span>- Plane crash value set between 1 to 5 means it will crash  between 1.0 to 4.99</div>
            <div className=""><span><b>Rule 1</b></span> - Plane crash value set between 1 to 7 means it will crash  between 1.0 to 6.99</div>
            <div className=""><span><b>Rule 1</b></span> - Plane crash value set between 1 to 10 means it will crash  between 1.0 to 9.99</div>
            <div className=""><span><b>Rule 1</b></span> - Plane crash value set between 1 to 100 means it will crash  between 1.0 to 99.99</div>
            <div className=""><span><b>Rule 1</b></span> - Plane crash value set between 1 to 1000 means it will crash  between 1.0 to 999.99</div> */}
            <div className=""><span><b>Rule 2</b></span> - Crash Percentage Decide How Many percentage the range of random Values will generate</div>
           
            
          </div>
          <form id="winsForm" className="flex-1">
            <div className="my-2">
              <label
                htmlFor="firstValue"
                className="block mb-2 text-lg font-medium text-gray-900 dark:text-black"
              >
                First value<span className="text-red-900 text-lg ">&#x2a;</span>
              </label>
              <input
                name="firstValue"
                value={oldData.firstValue}
                type="number"
                id="firstValue"
                className="bg-gray-200 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-black block w-full p-2.5 "
                placeholder="Please enter first value"
              />
            </div>

            <div className="my-2">
              <label
                htmlFor="secondValue"
                className="block mb-2 text-lg font-medium text-gray-900 dark:text-black"
              >
                Second Value
                <span className="text-red-900 text-lg ">&#x2a;</span>
              </label>
              <input
                name="secondValue"
                value={oldData.secondValue}
                onChange={handleChange}
                type="number"
                id="secondValue"
                className="bg-gray-200 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-black block w-full p-2.5 "
                placeholder="Please enter second value"
              />
            </div>
            <div className=" my-2">
              <label
                htmlFor="crashPercentage"
                className="block mb-2 text-lg font-medium text-gray-900 dark:text-black"
              >
                Crash Percentage
                <span className="text-red-900 text-lg ">&#x2a;</span>
              </label>
              <input
                name="crashPercentage"
                value={oldData.crashPercentage}
                onChange={handleChange}
                type="number"
                id="crashPercentage"
                className="bg-gray-200 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-black block w-full p-2.5 "
                placeholder="Please enter crash percentage"
              />
            </div>

            {error && <p className="text-red-900  text-[17px] mb-5">{error}</p>}
            <button
              type="submit"
              onClick={handleSubmit}
              className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 "
            >
              ADD
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default EditWinPercentage;

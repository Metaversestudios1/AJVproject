import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { IoIosArrowRoundBack, IoEye, IoEyeOff } from "react-icons/io";
import { IoMdEye } from "react-icons/io";

import $ from "jquery";
import "jquery-validation";
const BankDetails = () => {
  const navigate = useNavigate();
  const [loader, setLoader] = useState(true);
  const initialState = {
    bankName: "",
    accountNo: '',
    accountholderhame: "",
    ifscCode: "",
    mobileNo: "",
    upiId: "",
    QrCode: null,
    
  };

  const [data, setData] = useState(initialState);
  useEffect(() => {
    fetchOldData();
  }, []);
  const fetchOldData = async () => {
    const res = await fetch(`http://localhost:8000/api/getbankdetails`);
    const response = await res.json();
    if (response.success) {
      setData({
        ...data,
        bankName: response.result[0].bankName,
        accountNo: response.result[0].accountNo,
        accountholderhame: response.result[0].accountholderhame,
        ifscCode: response.result[0].ifscCode,
        mobileNo: response.result[0].mobileNo,
        upiId: response.result[0].upiId,
        QrCode: response.result[0].QrCode,
       
      });
      setLoader(false);
    }
  };
  const validatebankForm = () => {
    $("#bankform").validate({
      rules: {
        bankName: { required: true },
        accountNo: { required: true },
        accountholderhame: { required: true },
        ifscCode: { required: true },
        mobileNo: { required: true,
            minlength:10,
            maxlength:10,
         },
       // upiId: { required: true },
        
       
      },
      messages: {
        bankName: { required: "Please enter bank Name" },
        accountNo: { required: "Please enter Account Number" },
        accountholderhame: { required: "Please enter Account holder name" },
        ifscCode: { required: "Please enter IFSC code" },        
        mobileNo: { required: "Please enter min recharge amount" },
       },
    });
    return $("#bankform").valid();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];

    setData({ ...data, QrCode: file });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validatebankForm()) {
      return;
    }
    const formData = new FormData();
    Object.keys(data).forEach((key) => {
      formData.append(key, data[key]);
    });
    console.log(data);
    try {
      const res = await fetch(`http://localhost:8000/api/updatebankdetails`, {
        method: "PUT",
        //headers: { "Content-Type": "application/json" },
        body:formData,
      });
      const response = await res.json();
      if (response.success) {
        toast.success("Bank Details updated Successfully!", {
          position: "top-right",
          autoClose: 1000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });
        // setTimeout(() => {
        //   navigate(0);
        // }, 1500);
      }
    } catch (err) {
      console.log(err);
    }
  };
  const handleChange = (e) => {
    const { name, value } = e.target;
    setData({ ...data, [name]: value });
  };
  const handleClick = (imageUrl) => {
      // Replace with your image URL
       window.open(imageUrl, '_blank');
  };
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
        <IoIosArrowRoundBack
          onClick={() => navigate(-1)}
          className="bg-[#0472ff] rounded-full hover:scale-110 transition-all text-white text-[40px] cursor-pointer ml-5"
        />
        <div className="text-2xl font-bold mx-2 my-8 px-2">Bank Details</div>
      </div>
      {loader ? (
        <div className="absolute w-[100%] h-[40%] flex justify-center items-center">
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
        <div className="flex flex-col items-center w-[70%] m-auto">
          <form id="bankform" className="w-[60%]">
            <div className="my-4 relative">
              <label
                htmlFor="bankName"
                className="block mb-2 text-lg font-medium text-gray-900 dark:text-black"
              >
                Bank Name
              </label>
              <input
                type="text"
                name="bankName"
                id="bankName"
                value={data.bankName}
                onChange={handleChange}
                className="bg-gray-200 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-black block w-full p-2.5 "
                placeholder="Enter bankName"
              />
            </div>
            <div className="my-4 relative">
              <label
                htmlFor="accountNo"
                className="block mb-2 text-lg font-medium text-gray-900 dark:text-black"
              >
                Account No
              </label>
              <input
                type="text"
                name="accountNo"
                id="accountNo"
                value={data.accountNo}
                onChange={handleChange}
                className="bg-gray-200 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-black block w-full p-2.5 "
                placeholder="Enter Account no"
              />
            </div>
            <div className="my-4 relative">
              <label
                htmlFor="accountholderhame"
                className="block mb-2 text-lg font-medium text-gray-900 dark:text-black"
              >
                Account Holder Name
              </label>
              <input
                type="text"
                name="accountholderhame"
                id="accountholderhame"
                value={data.accountholderhame}
                onChange={handleChange}
                className="bg-gray-200 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-black block w-full p-2.5 "
                placeholder="Enter Max Account Holder Name"
              />
            </div>
            <div className="my-4 relative">
              <label
                htmlFor="ifscCode"
                className="block mb-2 text-lg font-medium text-gray-900 dark:text-black"
              >
                IFSC Code
              </label>
              <input
                type="text"
                name="ifscCode"
                id="ifscCode"
                value={data.ifscCode}
                onChange={handleChange}
                className="bg-gray-200 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-black block w-full p-2.5 "
                placeholder="Enter IFSC Code"
              />
            </div>
            <div className="my-4 relative">
              <label
                htmlFor="mobileNo"
                className="block mb-2 text-lg font-medium text-gray-900 dark:text-black"
              >
                Mobile Number
              </label>
              <input
                type="text"
                name="mobileNo"
                id="mobileNo"
                value={data.mobileNo}
                onChange={handleChange}
                className="bg-gray-200 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-black block w-full p-2.5 "
                placeholder="Enter Mobile Number"
              />
            </div>
            <div className="my-4 relative">
              <label
                htmlFor="upiId"
                className="block mb-2 text-lg font-medium text-gray-900 dark:text-black"
              >
                UPI Id
              </label>
              <input
                type="text"
                name="upiId"
                id="upiId"
                value={data.upiId}
                onChange={handleChange}
                className="bg-gray-200 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-black block w-full p-2.5 "
                placeholder="Enter UPI Id"
              />
            </div>
            <div className="my-4 relative">
              <label
                htmlFor="QrCode"
                className="block mb-2 text-lg font-medium text-gray-900 dark:text-black"
              >
               Upload QR Code 
              </label> <div >
              <IoMdEye 
    onClick={() => handleClick(data.QrCode.url)} 
    style={{ cursor: 'pointer' }} 
    className="text-2xl text-blue-900" 
/>
         
    </div>
              <input
                type="file"
                name="QrCode"
                id="QrCode"
                onChange={handleFileChange}
                className="bg-gray-200 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-black block w-full p-2.5 "
                placeholder="Enter Start Game Range Timer"
              />
            </div>
            <button
              type="submit"
              className="text-white bg-[#0472ff] hover:bg-blue-800 font-medium rounded-lg px-5 py-2.5"
              onClick={handleSubmit}
            >
              Update 
            </button>
          </form>
        </div>
      )}
      
    </div>
  );
};

export default BankDetails;

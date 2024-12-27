import React, { useEffect, useState } from "react";
import { IoIosArrowRoundBack } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import $ from "jquery";
import "jquery-validation";

const AddNotification = () => {
  const [loader, setLoader] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const initialState = {   
    description: "",
    photos: [],  
  };
  const [data, setData] = useState(initialState);

  useEffect(() => {
    // Initialize jQuery validation
    $("#propertyform").validate({
      rules: {
        photos: {
          required: true,
        },
        description: {
          required: true,
        },
      },
      messages: {
        description: {
          required: "Please enter a description",
        },
        photos: {
          required: "Please select photos",
        },
      },
      errorElement: "div",
      errorPlacement: function (error, element) {
        error.addClass("invalid-feedback");
        error.insertAfter(element);
      },
      highlight: function (element) {
        $(element).addClass("is-invalid").removeClass("is-valid");
      },
      unhighlight: function (element) {
        $(element).removeClass("is-invalid").addClass("is-valid");
      },
    });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData({ ...data, [name]: value });
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 10) {
      alert("You can only upload a maximum of 10 images.");
      e.target.value = ""; // Reset the input
      return;
    }
    setData({ ...data, photos: files });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!$("#propertyform").valid()) {
      return;
    }

    try {
      setLoader(true);

      const formData = new FormData();
      formData.append("description", data.description);
      data.photos.forEach((file) => formData.append("photos", file));

      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/insertNotification`, {
        method: "POST",
        body: formData,
      });

      const response = await res.json();
      if (response.success) {
        toast.success("New Notification is added Successfully!", {
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
          navigate("/notification");
        }, 1500);
      } else {
        setLoader(false);
        setError(response.message);
      }
    } catch (err) {
      console.log(err);
      setLoader(false);
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <>
      <div className="flex items-center">
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
          <div className="text-2xl font-bold mx-2 my-8 px-4">Notification</div>
        </div>
      </div>
      {loader ? (
        <div className="absolute w-[80%] h-[40%] flex justify-center items-center">
          <div className="flex justify-center h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-e-transparent align-[-0.125em] text-surface motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
            <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
              Loading...
            </span>
          </div>
        </div>
      ) : (
        <div className="w-[50%] m-auto my-10">
          <form id="propertyform" encType="multipart/form-data" onSubmit={handleSubmit}>
            <div className="my-2">
              <label htmlFor="description" className="block mb-2 text-sm font-medium text-gray-900 dark:text-black">
                Description
                <span className="text-red-900 text-lg">&#x2a;</span>
              </label>
              <textarea
                name="description"
                value={data.description}
                onChange={handleChange}
                type="text"
                id="description"
                className="bg-gray-200 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-black block w-full p-2.5"
                placeholder="lorem ipsum..."
                required
              />
            </div>
            <div className="my-2">
              <label htmlFor="photos" className="block mb-2 text-sm font-medium text-gray-900 dark:text-black">
                Images
              </label>
              <input
                name="photos"
                onChange={handleFileChange}
                type="file"
                id="photos"
                accept="image/*"
                multiple
                className="bg-gray-200 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-black block w-full p-2.5"
              />
            </div>
            <button
              type="submit"
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

export default AddNotification;

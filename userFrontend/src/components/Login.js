import React, { useState, useContext, useEffect, useRef } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import $ from "jquery";
import "jquery-validation";

const Login = () => {
  const ref = useRef();
  const [agent_id, setagent_id] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState([]);
  const [passEye, setPassEye] = useState("");
  const { setAuth } = useContext(AuthContext);
  const token = Cookies.get("jwt");
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      navigate("/dashboard");
    }
  }, []);
  const validateLoginForm = () => {
    $("#loginform").validate({
      rules: {
        agent_id: {
          required: true,
        },
        password: {
          required: true,
        },
        role: {
          required: true,
        },
      },
      messages: {
        agent_id: {
          required: "Please enter your agent_id",
        },
        password: {
          required: "Please enter your password",
        },
        role: {
          required: "Please enter your role",
        },
      },
      errorElement: "div",
      errorPlacement: function (error, element) {
        error.addClass("invalid-feedback"); // Add error class
        error.insertAfter(element.parent()); // Insert error message after input's parent containe//r
      },
      highlight: function (element, errorClass, validClass) {
        $(element).addClass("is-invalid").removeClass("is-valid");
      },
      unhighlight: function (element, errorClass, validClass) {
        $(element).removeClass("is-invalid").addClass("is-valid");
      },
    });

    return $("#loginform").valid();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!validateLoginForm()) {
        return;
      }
      setLoading(true);
      let res;
      if (role === "agent") {
        res = await fetch(
          `${process.env.REACT_APP_BACKEND_URL}/api/agentlogin`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({ agent_id, password }),
          }
        );
      } else {
        res = await fetch(
          `${process.env.REACT_APP_BACKEND_URL}/api/clientlogin`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({ agent_id, password }),
          }
        );
      }
      const response = await res.json();
      if (response.success) {
        setLoading(false);
        setError("");
        toast.success("You are logged in Successfully!", {
          position: "top-right",
          autoClose: 1000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });
        Cookies.set("jwt", response.token);
        setAuth({ isAuthenticated: true, user: response.user });
        const redirectPath =
          localStorage.getItem("redirectAfterLogin") || "/dashboard";
        localStorage.removeItem("redirectAfterLogin");
        setTimeout(() => {
          navigate(redirectPath);
        }, 1500);
      } else {
        setLoading(false);
        setError(response.message);
        toast.error(response.message, {
          position: "top-right",
          autoClose: 1000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
          className: "custom-toast-error", // Apply custom error class
        });
      }
    } catch (error) {
      console.error("Error during login:", error);
    }
  };
  console.log(process.env.REACT_APP_BACKEND_URL)
  return (
    <div>
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
      <div className="bg-sky-100 flex justify-center items-center h-screen">
        <div className="w-1/2 h-screen hidden lg:block">
          <img
            src="https://img.freepik.com/fotos-premium/imagen-fondo_910766-187.jpg?w=826"
            alt="Placeholder Image"
            className="object-cover w-full h-full"
          />
        </div>
        <div className="lg:p-36 md:p-52 sm:20 p-8 w-full lg:w-1/2">
          <h1 className="text-2xl font-semibold mb-4">Login</h1>
          <form>
            <div className="my-4">
              <label
                htmlFor="password"
                className="block text-sm text-gray-900 dark:text-black"
              >
                Role
                <span className="text-red-900 text-lg ">&#x2a;</span>
              </label>
              <select
                name="role"
                value={role}
                onChange={(e) => {
                  setRole(e.target.value);
                }}
                className="border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-black block w-full p-2.5 "
              >
                <option value="">Select a role</option>

                <option
                  key="agent"
                  value="agent"
                  onChange={(e) => {
                    setRole(e.target.value);
                  }}
                  className=" border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-black block w-full p-2.5 "
                >
                  Agent
                </option>
                <option
                  key="client"
                  value="client"
                  className=" bg-gray-200 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-black block w-full p-2.5 "
                >
                  Client
                </option>
              </select>
            </div>
            <div className="mb-4 bg-sky-100">
              <label for="agent_id" className="block text-gray-600">
                Agent id
              </label>
              <input
                type="text"
                id="agent_id"
                name="agent_id"
                value={agent_id}
                onChange={(e) => {
                  if (e.target.value === "" || !isNaN(e.target.value)) {
                    setagent_id(e.target.value);
                  } else {
                    console.log("Contact number must be a valid number");
                  }
                }}
                className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:border-blue-500"
                autocomplete="off"
              />
            </div>
            <div className="mb-4">
              <label for="password" className="block text-gray-800">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e)=>{setPassword(e.target.value)}}
                name="password"
                className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:border-blue-500"
            
              />
            </div>
            
            <div className="mb-6 text-blue-500">
              <a href="#" className="hover:underline">
                Forgot Password?
              </a>
            </div>
            <button
              type="submit"
              onClick={handleSubmit}
              className="bg-red-500 hover:bg-blue-600 text-white font-semibold rounded-md py-2 px-4 w-full"
            >
              Login
            </button>
          </form>
          <div className="mt-6 text-green-500 text-center">
            <a href="#" className="hover:underline">
              Sign up Here
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

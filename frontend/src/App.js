import './App.css';
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import { useState } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import PrivateRoute from "./components/utils/PrivateRoute";
import Home from  "./components/Home";
import AviatorSetting from "./components/setting/aviator/AviatorSetting"
import Login from "./components/Login"
import Error from "./components/Error"

import AuthProvider from "./context/AuthContext";

import User from "./components/User/User"



function App() {
  const [sideBar, setSideBar] = useState(true);
  const toggleSideBar = () => {
    setSideBar(!sideBar);
  };
  const router = createBrowserRouter([
    {
      path: "/",
      element: (
        <div>
          <Login />
        </div>
      ),
    },
    
    {
      path: "/login",
      element: (
        <div>
          <Login />
        </div>
      ),
    },
    {
      path: "/dashboard",
      element: (
        <PrivateRoute>
        <div className="flex h-screen">
          <Sidebar sidebar={sideBar} className="flex-1" toggleSideBar={toggleSideBar}/>
          <div className="flex flex-col flex-grow overflow-y-auto flex-[3]">
            <Navbar toggleSideBar={toggleSideBar} />
            <Home/>
          </div>
        </div>
        </PrivateRoute>
      ),
    },
    {
      path: "/aviatorsetting",
      element: (
        <PrivateRoute>
        <div className="flex h-screen">
          <Sidebar sidebar={sideBar} className="flex-1" toggleSideBar={toggleSideBar}/>
          <div className="flex flex-col flex-grow overflow-y-auto flex-[3]">
            <Navbar toggleSideBar={toggleSideBar} />
            <AviatorSetting/>
          </div>
        </div>
        </PrivateRoute>
      ),
    },

    {
      path: "/users",
      element: (
        <PrivateRoute>
        <div className="flex h-screen">
          <Sidebar sidebar={sideBar} className="flex-1" toggleSideBar={toggleSideBar}/>
          <div className="flex flex-col flex-grow overflow-y-auto flex-[3]">
            <Navbar toggleSideBar={toggleSideBar} />
            <User/>
          </div>
        </div>
        </PrivateRoute>
      ),
    },
    {
      path: "*",
      element: (
        <Error/>
      ),
    },
  ]);

  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}
export default App;

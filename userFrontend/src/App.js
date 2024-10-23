import "./App.css";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import { useState } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import PrivateRoute from "./components/utils/PrivateRoute";
import Home from "./components/Home";
import Login from "./components/Login";
import Error from "./components/Error";
import AuthProvider from "./context/AuthContext";
import Client from "./components/Client/Client";
import Property from "./components/Property/Property";
import Sites from "./components/Sites/Sites";
import AddPropertyDetails from "./components/Sites/AddPropertyDetails";
import AgentRoute from "./components/utils/AgentRoute";
import AgentProfile from "./components/Agent/AgentProfile";

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
            <Sidebar
              sidebar={sideBar}
              className="flex-1"
              toggleSideBar={toggleSideBar}
            />
            <div className="flex flex-col flex-grow overflow-y-auto flex-[3]">
              <Navbar toggleSideBar={toggleSideBar} />
              <Home />
            </div>
          </div>
        </PrivateRoute>
      ),
    },

    {
      path: "/profile",
      element: (
        <PrivateRoute>
          <div className="flex h-screen">
            <Sidebar
              sidebar={sideBar}
              className="flex-1"
              toggleSideBar={toggleSideBar}
            />
            <div className="flex flex-col flex-grow overflow-y-auto flex-[3]">
              <Navbar toggleSideBar={toggleSideBar} />
              <AgentProfile />
            </div>
          </div>
        </PrivateRoute>
      ),
    },
    {
      path: "/clients",
      element: (
        <PrivateRoute>
          <div className="flex h-screen">
            <Sidebar
              sidebar={sideBar}
              className="flex-1"
              toggleSideBar={toggleSideBar}
            />
            <div className="flex flex-col flex-grow overflow-y-auto flex-[3]">
              <Navbar toggleSideBar={toggleSideBar} />
              <Client />
            </div>
          </div>
        </PrivateRoute>
      ),
    },

    {
      path: "/properties",
      element: (
        <PrivateRoute>
          <AgentRoute>
            <div className="flex h-screen">
              <Sidebar
                sidebar={sideBar}
                className="flex-1"
                toggleSideBar={toggleSideBar}
              />
              <div className="flex flex-col flex-grow overflow-y-auto flex-[3]">
                <Navbar toggleSideBar={toggleSideBar} />
                <Property />
              </div>
            </div>
          </AgentRoute>
        </PrivateRoute>
      ),
    },

    {
      path: "/sites",
      element: (
        <PrivateRoute>
          <div className="flex h-screen">
            <Sidebar
              sidebar={sideBar}
              className="flex-1"
              toggleSideBar={toggleSideBar}
            />
            <div className="flex flex-col flex-grow overflow-y-auto flex-[3]">
              <Navbar toggleSideBar={toggleSideBar} />
              <Sites />
            </div>
          </div>
        </PrivateRoute>
      ),
    },

    {
      path: "/addPropertyDetails/:id",
      element: (
        <PrivateRoute>
          <div className="flex h-screen">
            <Sidebar
              sidebar={sideBar}
              className="flex-1"
              toggleSideBar={toggleSideBar}
            />
            <div className="flex flex-col flex-grow overflow-y-auto flex-[3]">
              <Navbar toggleSideBar={toggleSideBar} />
              <AddPropertyDetails />
            </div>
          </div>
        </PrivateRoute>
      ),
    },

    {
      path: "*",
      element: <Error />,
    },
  ]);

  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}
export default App;

import { Outlet } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { Sidebar } from "../components/Sidebar";
import { useEffect } from "react";
import tokenDec from "../helpers/tokenDec";

export const DashboardLayout = () => {
  const tokenStr = localStorage.getItem("token");

  useEffect(() => {
    if (!tokenStr) window.location.href = "/login";

    const data = tokenDec(tokenStr);
    if (!data) window.location.href = "/login";
  }, []);

  return (
    <div className="flex flex-row w-full h-screen bg-gray-300 overflow-hidden">
      <Sidebar />
      <main className="w-full h-full">
        <Navbar />
        <Outlet />
      </main>
    </div>
  );
};

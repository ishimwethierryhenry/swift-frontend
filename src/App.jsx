// src/App.jsx - REVERT TO ORIGINAL
import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import DefaultLayout from "./layouts/DefaultLayout";
import Login from "./pages/Login";
import Pool from "./pages/Pool";
import { Dashboard } from "./pages/Dashboard";
import { GuestDashboard } from "./pages/GuestDashboard";
import GuestFeedback from "./pages/GuestFeedback";
import { DashboardLayout } from "./layouts/DashboardLayout";
import { AddPool } from "./pages/AddPool";
import { AddOperators } from "./pages/AddOperators";
import { Predict } from "./pages/Predict";
import { HistoricalData } from "./pages/HistoricalData";
import { LandingPage } from "./pages/LandingPage";

const routes = [
  {
    path: "/",
    element: <DefaultLayout />,
    children: [{ path: "/", element: <LandingPage /> }],
  },
  {
    path: "/",
    element: <DefaultLayout />,
    children: [{ path: "/login", element: <Login /> }],
  },
  {
    path: "/",
    element: <DashboardLayout />,
    children: [
      { path: "/pool/data/:topic", element: <Pool /> },
      {
        path: "/dashboard",
        element: <Dashboard />,
      },
      {
        path: "/guest-dashboard",
        element: <GuestDashboard />,
      },
      {
        path: "/feedback",
        element: <GuestFeedback />,
      },
      {
        path: "/pool/create",
        element: <AddPool />,
      },
      {
        path: "/operator/create",
        element: <AddOperators />,
      },
      {
        path: "/predict",
        element: <Predict />,
      },
      {
        path: "/history",
        element: <HistoricalData />,
      },
      {
        path: "/pool",
        element: <Pool/>,
      }
    ],
  },
];

const router = (
  <BrowserRouter>
    <Routes>
      {routes.map((route) => (
        <Route key={route.path} path={route.path} element={route.element}>
          {route.children.map((child) => (
            <Route key={child.path} path={child.path} element={child.element} />
          ))}
        </Route>
      ))}
    </Routes>
  </BrowserRouter>
);

const App = () => {
  return router;
};

export default App;
// src/App.jsx - UPDATED VERSION WITH CHANGE PASSWORD ROUTE
import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { useSelector } from "react-redux";
import DefaultLayout from "./layouts/DefaultLayout";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import ChangePassword from "./pages/ChangePassword"; // 🆕 NEW IMPORT
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
import ProtectedRoute from "./components/ProtectedRoute"; // 🆕 NEW IMPORT

const App = () => {
  const { user } = useSelector((state) => state.login);

  return (
    <BrowserRouter>
      <Routes>
        {/* 🆕 PUBLIC ROUTES (No Authentication Required) */}
        <Route path="/" element={<DefaultLayout />}>
          <Route index element={<LandingPage />} />
          <Route path="login" element={<Login />} />
          <Route path="signup" element={<Signup />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
          <Route path="reset-password/:token" element={<ResetPassword />} />
        </Route>

        {/* 🆕 SPECIAL ROUTE - Change Password (Protected but No Layout) */}
        <Route 
          path="/change-password" 
          element={
            <ProtectedRoute>
              <ChangePassword />
            </ProtectedRoute>
          } 
        />

        {/* 🔒 PROTECTED DASHBOARD ROUTES */}
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          {/* Dynamic Dashboard Based on User Role */}
          <Route 
            path="dashboard" 
            element={user?.role === 'guest' ? <GuestDashboard /> : <Dashboard />} 
          />
          
          {/* Guest-specific routes */}
          <Route 
            path="guest-dashboard" 
            element={
              <ProtectedRoute allowedRoles={['guest']}>
                <GuestDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="feedback" 
            element={
              <ProtectedRoute allowedRoles={['guest']}>
                <GuestFeedback />
              </ProtectedRoute>
            } 
          />
          
          {/* Admin/Operator routes */}
          <Route 
            path="pool/data/:topic" 
            element={
              <ProtectedRoute allowedRoles={['admin', 'operator', 'overseer']}>
                <Pool />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="pool" 
            element={
              <ProtectedRoute allowedRoles={['admin', 'operator', 'overseer']}>
                <Pool />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="pool/create" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AddPool />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="operator/create" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AddOperators />
              </ProtectedRoute>
            } 
          />
          
          {/* Shared protected routes */}
          <Route 
            path="predict" 
            element={
              <ProtectedRoute allowedRoles={['admin', 'operator', 'overseer']}>
                <Predict />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="history" 
            element={
              <ProtectedRoute allowedRoles={['admin', 'operator', 'overseer']}>
                <HistoricalData />
              </ProtectedRoute>
            } 
          />
        </Route>

        {/* 🚫 Catch all route - redirect to home */}
        <Route path="*" element={<LandingPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
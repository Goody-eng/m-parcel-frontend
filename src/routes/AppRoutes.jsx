import { Routes, Route, Navigate } from "react-router-dom";
import Landing from "../pages/Landing";
import Signup from "../pages/Signup";
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import CreateOrder from "../pages/CreateOrder";
import DriverOrders from "../pages/DriverOrders";
import SMEOrders from "../pages/SMEOrders";
import { useAuth } from "../context/AuthContext";

const PrivateRoute = ({ children }) => {
  const { token, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white text-slate-700">
        Loading dashboard...
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const AuthRedirect = ({ children }) => {
  const { token, loading } = useAuth();

  if (loading) {
    return children;
  }

  if (token) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <AuthRedirect>
            <Landing />
          </AuthRedirect>
        }
      />
      <Route
        path="/signup"
        element={
          <AuthRedirect>
            <Signup />
          </AuthRedirect>
        }
      />
      <Route
        path="/login"
        element={
          <AuthRedirect>
            <Login />
          </AuthRedirect>
        }
      />
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/orders/create"
        element={
          <PrivateRoute>
            <CreateOrder />
          </PrivateRoute>
        }
      />
      <Route
        path="/orders"
        element={
          <PrivateRoute>
            <DriverOrders />
          </PrivateRoute>
        }
      />
      <Route
        path="/sme/orders"
        element={
          <PrivateRoute>
            <SMEOrders />
          </PrivateRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

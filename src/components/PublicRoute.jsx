import { Navigate, Outlet } from "react-router-dom";

const PublicRoute = () => {
  const token = localStorage.getItem("token"); // ya jo bhi auth key use kar rahe ho

  return token ? <Navigate to="/dashboard" replace /> : <Outlet />;
};

export default PublicRoute;
import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useUserAuth } from "../context/UserAuthContext";

const ProtectedRoute = ({ children }) => {
  const { user } = useUserAuth();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false);
    }, 100);
  }, [user]); 

  if (isLoading) {
    return <div>Loading...</div>; // Adjust as needed
  }

  if (!user) {
    return <Navigate to="/login" />;
  }


  return children;
};

export default ProtectedRoute;


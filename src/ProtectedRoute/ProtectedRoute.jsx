import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Toaster, toast } from "react-hot-toast";

const ProtectedRoute = ({ children }) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isTokenValid, setIsTokenValid] = useState(null);

  const checkTokenExpiration = () => {
    const token = localStorage.getItem("token");
    if (!token || token === "undefined" || token === "null") {
      setIsTokenValid(false);
      return false;
    }

    try {
      const payload = token.split(".")[1];
      if (!payload) {
        throw new Error("Invalid JWT format: payload missing");
      }
      const decoded = JSON.parse(atob(payload));
      const currentTime = Math.floor(Date.now() / 1000);
      if (decoded.exp && decoded.exp < currentTime) {
        setIsTokenValid(false);
        return false;
      }
      setIsTokenValid(true);
      return true;
    } catch (e) {
      console.error("Failed to decode token:", e.message);
      setIsTokenValid(false);
      return false;
    }
  };

  useEffect(() => {
    const isValid = checkTokenExpiration();
    setIsLoading(false);

    if (!isValid) {
      toast.error("Session expired. Please sign in again.", {
        duration: 1000,
        position: "top-right",
      });
      const timeout = setTimeout(() => {
        navigate("/signin");
      }, 1000);
      return () => clearTimeout(timeout);
    }

    const handleActivity = () => {
      const isValid = checkTokenExpiration();
      if (!isValid) {
        setIsLoading(true);
        toast.error("Session expired. Please sign in again.", {
          duration: 1000,
          position: "top-right",
        });
        setTimeout(() => {
          navigate("/signin");
        }, 1000);
      }
    };

    let lastCheck = 0;
    const throttleDelay = 5000;
    const throttledHandleActivity = (e) => {
      const now = Date.now();
      if (now - lastCheck >= throttleDelay) {
        lastCheck = now;
        handleActivity();
      }
    };

    window.addEventListener("mousemove", throttledHandleActivity);
    window.addEventListener("keydown", throttledHandleActivity);

    return () => {
      window.removeEventListener("mousemove", throttledHandleActivity);
      window.removeEventListener("keydown", throttledHandleActivity);
    };
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen min-w-screen flex items-center justify-center bg-white">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isTokenValid) {
    return null;
  }

  return children;
};

export default ProtectedRoute;

// ==========================================
// PROTECTED ADMIN ROUTE
// ==========================================

import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { getAdminSession } from "../lib/auth";


// ==========================================
// PROTECTED ROUTE COMPONENT
// ==========================================

function ProtectedRoute({ children }) {

  // ==========================================
  // SESSION STATE
  // ==========================================

  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);


  // ==========================================
  // CHECK ADMIN SESSION
  // ==========================================

  useEffect(() => {

    const checkSession = async () => {

      try {

        const currentSession = await getAdminSession();

        setSession(currentSession);

      } catch (error) {

        console.error(
          "Session check failed:",
          error
        );

      } finally {

        setLoading(false);

      }

    };

    checkSession();

  }, []);


  // ==========================================
  // LOADING SCREEN
  // ==========================================

  if (loading) {
    return (
      <div className="admin-route-loading">

        <div className="admin-route-spinner"></div>

        <p>
          Checking secure access...
        </p>

      </div>
    );
  }


  // ==========================================
  // REDIRECT IF NOT LOGGED IN
  // ==========================================

  if (!session) {
    return (
      <Navigate
        to="/admin"
        replace
      />
    );
  }


  // ==========================================
  // AUTHENTICATED ADMIN
  // ==========================================

  return children;
}


export default ProtectedRoute;
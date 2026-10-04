// ==========================================
// PROTECTED ADMIN ROUTE
// ==========================================

import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

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
  // CHECK + LISTEN FOR AUTH SESSION
  // ==========================================

  useEffect(() => {
    let mounted = true;

    // ==========================================
    // GET INITIAL SESSION
    // ==========================================

    const checkSession = async () => {
      try {
        const {
          data: { session: currentSession },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error(
            "Session check failed:",
            error
          );
        }

        if (mounted) {
          setSession(currentSession);
          setLoading(false);
        }
      } catch (error) {
        console.error(
          "Session check failed:",
          error
        );

        if (mounted) {
          setSession(null);
          setLoading(false);
        }
      }
    };

    checkSession();

    // ==========================================
    // LISTEN FOR AUTH STATE CHANGES
    // ==========================================

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, currentSession) => {
        if (mounted) {
          setSession(currentSession);
          setLoading(false);
        }
      }
    );

    // ==========================================
    // CLEANUP
    // ==========================================

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
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
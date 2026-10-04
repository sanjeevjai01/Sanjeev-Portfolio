// ==========================================
// ADMIN LOGIN COMPONENT
// ==========================================

import { useState } from "react";
import { loginAdmin } from "../lib/auth";

function AdminLogin() {

  // ==========================================
  // FORM STATE
  // ==========================================

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // ==========================================
  // UI STATE
  // ==========================================

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ==========================================
  // LOGIN HANDLER
  // ==========================================

  const handleLogin = async (event) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      await loginAdmin(email, password);

      window.location.href = "/admin/dashboard";

    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // LOGIN UI
  // ==========================================

  return (
    <main className="admin-login-page">

      {/* ==========================================
          BACKGROUND EFFECTS
          ========================================== */}

      <div className="admin-login-grid"></div>
      <div className="admin-login-glow admin-glow-one"></div>
      <div className="admin-login-glow admin-glow-two"></div>

      {/* ==========================================
          LOGIN CARD
          ========================================== */}

      <section className="admin-login-card">

        {/* BRAND */}

        <div className="admin-brand">
          <div className="admin-brand-logo">
            S
          </div>

          <div>
            <span>SANJEEV</span>
            <small>PORTFOLIO</small>
          </div>
        </div>

        {/* HEADING */}

        <div className="admin-login-heading">
          <p>PRIVATE ACCESS</p>

          <h1>
            Welcome <span>Back.</span>
          </h1>

          <div className="admin-heading-line"></div>

          <span>
            Sign in to manage your portfolio.
          </span>
        </div>

        {/* ERROR */}

        {error && (
          <div className="admin-login-error">
            <span>!</span>
            {error}
          </div>
        )}

        {/* FORM */}

        <form onSubmit={handleLogin}>

          {/* EMAIL */}

          <div className="admin-field">

            <label htmlFor="admin-email">
              EMAIL ADDRESS
            </label>

            <input
              id="admin-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Enter your email"
              autoComplete="email"
              required
            />

          </div>

          {/* PASSWORD */}

          <div className="admin-field">

            <label htmlFor="admin-password">
              PASSWORD
            </label>

            <div className="admin-password-wrapper">

              <input
                id="admin-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
                required
              />

              <button
                type="button"
                className="admin-password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
              >
                {showPassword ? "◉" : "◌"}
              </button>

            </div>

          </div>

          {/* LOGIN BUTTON */}

          <button
            type="submit"
            className="admin-login-submit"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="admin-spinner"></span>
                Signing in...
              </>
            ) : (
              <>
                Access Dashboard
                <span>→</span>
              </>
            )}
          </button>

        </form>

        {/* SECURITY STATUS */}

        <div className="admin-security">

          <span className="security-dot"></span>

          <span>
            SECURE ADMIN ACCESS
          </span>

          <span className="security-lock">
            🔒
          </span>

        </div>

        {/* BACK TO WEBSITE */}

        <a
          href="/"
          className="back-to-portfolio"
        >
          ← Back to portfolio
        </a>

      </section>

    </main>
  );
}

export default AdminLogin;
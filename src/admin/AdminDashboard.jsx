// ==========================================
// ADMIN DASHBOARD
// ==========================================

// ==========================================
// ADMIN AUTHENTICATION
// ==========================================

import React, { useEffect, useState } from "react";
import { logoutAdmin } from "../lib/auth";
import { supabase } from "../lib/supabase";
import WebsiteSettings from "./WebsiteSettings";
// ==========================================
// MANAGERS
// ==========================================

import ProfileManager from "./ProfileManager";
import ProjectManager from "./ProjectManager";
import SkillManager from "./SkillManager";
import CertificationManager from "./CertificationManager";
import ExperienceManager from "./ExperienceManager";
import EducationManager from "./EducationManager";
import OfferLetterManager from "./OfferLetterManager";

// ==========================================
// ADMIN DASHBOARD COMPONENT
// ==========================================

function AdminDashboard() {
  // ==========================================
  // SECTION STATE
  // ==========================================

  const [activeSection, setActiveSection] =
    useState("dashboard");

  // ==========================================
  // DASHBOARD STATISTICS
  // ==========================================

  const [stats, setStats] = useState({
    projects: 0,
    skills: 0,
    certifications: 0,
    experience: 0,
  });

  const [statsLoading, setStatsLoading] =
    useState(true);

  // ==========================================
  // LOAD DASHBOARD STATISTICS
  // ==========================================

  const loadStats = async () => {
    try {
      setStatsLoading(true);

      const [
        projectsResult,
        skillsResult,
        certificationsResult,
        experienceResult,
      ] = await Promise.all([
        supabase
          .from("projects")
          .select("*", {
            count: "exact",
            head: true,
          }),

        supabase
          .from("skills")
          .select("*", {
            count: "exact",
            head: true,
          }),

        supabase
          .from("certifications")
          .select("*", {
            count: "exact",
            head: true,
          }),

        supabase
          .from("experience")
          .select("*", {
            count: "exact",
            head: true,
          }),
      ]);

      // ========================================
      // CHECK DATABASE ERRORS
      // ========================================

      if (projectsResult.error) {
        throw projectsResult.error;
      }

      if (skillsResult.error) {
        throw skillsResult.error;
      }

      if (certificationsResult.error) {
        throw certificationsResult.error;
      }

      if (experienceResult.error) {
        throw experienceResult.error;
      }

      // ========================================
      // UPDATE STATISTICS
      // ========================================

      setStats({
        projects: projectsResult.count || 0,
        skills: skillsResult.count || 0,
        certifications:
          certificationsResult.count || 0,
        experience:
          experienceResult.count || 0,
      });

    } catch (error) {
      console.error(
        "Failed to load dashboard statistics:",
        error
      );

      // ----------------------------------------
      // KEEP SAFE FALLBACK
      // ----------------------------------------

      setStats({
        projects: 0,
        skills: 0,
        certifications: 0,
        experience: 0,
      });

    } finally {
      setStatsLoading(false);
    }
  };

  // ==========================================
  // LOAD STATS ON DASHBOARD OPEN
  // ==========================================

  useEffect(() => {
    if (activeSection === "dashboard") {
      loadStats();
    }
  }, [activeSection]);

  // ==========================================
  // LOGOUT
  // ==========================================

  const handleLogout = async () => {
    try {
      await logoutAdmin();

      window.location.href = "/admin";
    } catch (error) {
      console.error(
        "Logout failed:",
        error
      );
    }
  };

  // ==========================================
  // SECTION CHANGE
  // ==========================================

  const handleSectionChange = (
    section
  ) => {
    setActiveSection(section);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ==========================================
  // RENDER ACTIVE SECTION
  // ==========================================

  const renderActiveSection = () => {

    // ========================================
    // PROFILE
    // ========================================

    if (activeSection === "profile") {
      return <ProfileManager />;
    }

    // ========================================
    // PROJECTS
    // ========================================

    if (activeSection === "projects") {
      return <ProjectManager />;
    }

    // ========================================
    // SKILLS
    // ========================================

    if (activeSection === "skills") {
      return <SkillManager />;
    }

    // ========================================
    // CERTIFICATIONS
    // ========================================

    if (
      activeSection === "certifications"
    ) {
      return <CertificationManager />;
    }

    // ========================================
    // EXPERIENCE
    // ========================================

    if (
      activeSection === "experience"
    ) {
      return <ExperienceManager />;
    }

    // ========================================
    // EDUCATION
    // ========================================

    if (
      activeSection === "education"
    ) {
      return <EducationManager />;
    }

    // ========================================
    // OFFER LETTERS
    // ========================================

    if (
      activeSection === "offerLetters"
    ) {
      return <OfferLetterManager />;
    }

    // ========================================
    // WEBSITE SETTINGS
    // ========================================

    // ========================================
// WEBSITE SETTINGS
// ========================================

if (activeSection === "settings") {
  return <WebsiteSettings />;
}

    // ========================================
    // DEFAULT DASHBOARD
    // ========================================

    return (
      <>

        {/* ====================================
            DASHBOARD TOPBAR
        ==================================== */}

        <header className="admin-topbar">

          <div>

            <p className="admin-page-label">
              CONTROL CENTER
            </p>

            <h1>
              Dashboard
            </h1>

            <p className="admin-page-description">
              Manage your portfolio from one place.
            </p>

          </div>

          <div className="admin-profile-mini">

            <div className="admin-profile-avatar">
              SJ
            </div>

            <div>
              <strong>
                Sanjeev Kumar Jaiswal
              </strong>

              <span>
                Administrator
              </span>
            </div>

          </div>

        </header>

        {/* ====================================
            WELCOME CARD
        ==================================== */}

        <section className="admin-welcome-card">

          <div>

            <span className="admin-welcome-badge">
              ● SYSTEM ONLINE
            </span>

            <h2>
              Welcome back, Sanjeev.
            </h2>

            <p>
              Everything you need to manage
              your portfolio is available from
              your dashboard.
            </p>

          </div>

          <div className="admin-welcome-symbol">
            S
          </div>

        </section>

        {/* ====================================
            LIVE STATISTICS
        ==================================== */}

        <section className="admin-stats-grid">

          {/* --------------------------------
              PROJECTS
          -------------------------------- */}

          <div className="admin-stat-card">

            <span className="admin-stat-icon">
              ▣
            </span>

            <div>
              <span>
                Projects
              </span>

              <strong>
                {statsLoading
                  ? "..."
                  : stats.projects}
              </strong>
            </div>

            <small>
              Manage projects
            </small>

          </div>

          {/* --------------------------------
              SKILLS
          -------------------------------- */}

          <div className="admin-stat-card">

            <span className="admin-stat-icon">
              ◆
            </span>

            <div>
              <span>
                Skills
              </span>

              <strong>
                {statsLoading
                  ? "..."
                  : stats.skills}
              </strong>
            </div>

            <small>
              Technical skills
            </small>

          </div>

          {/* --------------------------------
              CERTIFICATES
          -------------------------------- */}

          <div className="admin-stat-card">

            <span className="admin-stat-icon">
              ▤
            </span>

            <div>
              <span>
                Certificates
              </span>

              <strong>
                {statsLoading
                  ? "..."
                  : stats.certifications}
              </strong>
            </div>

            <small>
              Certifications
            </small>

          </div>

          {/* --------------------------------
              EXPERIENCE
          -------------------------------- */}

          <div className="admin-stat-card">

            <span className="admin-stat-icon">
              ◫
            </span>

            <div>
              <span>
                Experience
              </span>

              <strong>
                {statsLoading
                  ? "..."
                  : stats.experience}
              </strong>
            </div>

            <small>
              Work experience
            </small>

          </div>

        </section>

        {/* ====================================
            CONTENT MANAGEMENT
        ==================================== */}

        <section className="admin-section">

          <div className="admin-section-heading">

            <div>

              <p>
                CONTENT MANAGEMENT
              </p>

              <h2>
                Manage Website
              </h2>

            </div>

            <span>
              8 Modules
            </span>

          </div>

          <div className="admin-management-grid">

            {/* --------------------------------
                PROFILE
            -------------------------------- */}

            <div className="admin-management-card">

              <div className="admin-management-icon">
                ◉
              </div>

              <h3>
                Profile
              </h3>

              <p>
                Name, photo, bio and personal
                information.
              </p>

              <button
                type="button"
                onClick={() =>
                  handleSectionChange(
                    "profile"
                  )
                }
              >
                Manage →
              </button>

            </div>

            {/* --------------------------------
                PROJECTS
            -------------------------------- */}

            <div className="admin-management-card">

              <div className="admin-management-icon">
                ▣
              </div>

              <h3>
                Projects
              </h3>

              <p>
                Add, edit, hide and manage
                portfolio projects.
              </p>

              <button
                type="button"
                onClick={() =>
                  handleSectionChange(
                    "projects"
                  )
                }
              >
                Manage →
              </button>

            </div>

            {/* --------------------------------
                SKILLS
            -------------------------------- */}

            <div className="admin-management-card">

              <div className="admin-management-icon">
                ◆
              </div>

              <h3>
                Skills
              </h3>

              <p>
                Manage technical and professional
                skills.
              </p>

              <button
                type="button"
                onClick={() =>
                  handleSectionChange(
                    "skills"
                  )
                }
              >
                Manage →
              </button>

            </div>

            {/* --------------------------------
                CERTIFICATIONS
            -------------------------------- */}

            <div className="admin-management-card">

              <div className="admin-management-icon">
                ▤
              </div>

              <h3>
                Certifications
              </h3>

              <p>
                Add certificates and verification
                links.
              </p>

              <button
                type="button"
                onClick={() =>
                  handleSectionChange(
                    "certifications"
                  )
                }
              >
                Manage →
              </button>

            </div>

            {/* --------------------------------
                EXPERIENCE
            -------------------------------- */}

            <div className="admin-management-card">

              <div className="admin-management-icon">
                ◫
              </div>

              <h3>
                Experience
              </h3>

              <p>
                Manage jobs, internships and
                work history.
              </p>

              <button
                type="button"
                onClick={() =>
                  handleSectionChange(
                    "experience"
                  )
                }
              >
                Manage →
              </button>

            </div>

            {/* --------------------------------
                EDUCATION
            -------------------------------- */}

            <div className="admin-management-card">

              <div className="admin-management-icon">
                ▥
              </div>

              <h3>
                Education
              </h3>

              <p>
                Manage degrees, college and
                education details.
              </p>

              <button
                type="button"
                onClick={() =>
                  handleSectionChange(
                    "education"
                  )
                }
              >
                Manage →
              </button>

            </div>

            {/* --------------------------------
                OFFER LETTERS
            -------------------------------- */}

            <div className="admin-management-card">

              <div className="admin-management-icon">
                ◇
              </div>

              <h3>
                Offer Letters
              </h3>

              <p>
                Upload and manage offer letters
                and documents.
              </p>

              <button
                type="button"
                onClick={() =>
                  handleSectionChange(
                    "offerLetters"
                  )
                }
              >
                Manage →
              </button>

            </div>

            {/* --------------------------------
                WEBSITE SETTINGS
            -------------------------------- */}

            <div className="admin-management-card">

              <div className="admin-management-icon">
                ⚙
              </div>

              <h3>
                Website Settings
              </h3>

              <p>
                SEO, social links, theme and
                website settings.
              </p>

              <button
                type="button"
                onClick={() =>
                  handleSectionChange(
                    "settings"
                  )
                }
              >
                Manage →
              </button>

            </div>

          </div>

        </section>

      </>
    );
  };

  // ==========================================
  // MAIN ADMIN LAYOUT
  // ==========================================

  return (
    <main className="admin-dashboard-page">

      {/* ========================================
          SIDEBAR
      ======================================== */}

      <aside className="admin-sidebar">

        {/* --------------------------------------
            BRAND
        -------------------------------------- */}

        <div className="admin-sidebar-brand">

          <div className="admin-sidebar-logo">
            S
          </div>

          <div>
            <strong>
              SANJEEV
            </strong>

            <span>
              PORTFOLIO
            </span>
          </div>

        </div>

        {/* --------------------------------------
            NAVIGATION
        -------------------------------------- */}

        <nav className="admin-sidebar-nav">

          <button
            type="button"
            className={`admin-nav-item ${
              activeSection === "dashboard"
                ? "active"
                : ""
            }`}
            onClick={() =>
              handleSectionChange(
                "dashboard"
              )
            }
          >
            <span>⌂</span>
            Dashboard
          </button>

          <button
            type="button"
            className={`admin-nav-item ${
              activeSection === "profile"
                ? "active"
                : ""
            }`}
            onClick={() =>
              handleSectionChange(
                "profile"
              )
            }
          >
            <span>◉</span>
            Profile
          </button>

          <button
            type="button"
            className={`admin-nav-item ${
              activeSection === "projects"
                ? "active"
                : ""
            }`}
            onClick={() =>
              handleSectionChange(
                "projects"
              )
            }
          >
            <span>▣</span>
            Projects
          </button>

          <button
            type="button"
            className={`admin-nav-item ${
              activeSection === "skills"
                ? "active"
                : ""
            }`}
            onClick={() =>
              handleSectionChange(
                "skills"
              )
            }
          >
            <span>◆</span>
            Skills
          </button>

          <button
            type="button"
            className={`admin-nav-item ${
              activeSection === "certifications"
                ? "active"
                : ""
            }`}
            onClick={() =>
              handleSectionChange(
                "certifications"
              )
            }
          >
            <span>▤</span>
            Certifications
          </button>

          <button
            type="button"
            className={`admin-nav-item ${
              activeSection === "experience"
                ? "active"
                : ""
            }`}
            onClick={() =>
              handleSectionChange(
                "experience"
              )
            }
          >
            <span>◫</span>
            Experience
          </button>

          <button
            type="button"
            className={`admin-nav-item ${
              activeSection === "education"
                ? "active"
                : ""
            }`}
            onClick={() =>
              handleSectionChange(
                "education"
              )
            }
          >
            <span>▥</span>
            Education
          </button>

          <button
            type="button"
            className={`admin-nav-item ${
              activeSection === "offerLetters"
                ? "active"
                : ""
            }`}
            onClick={() =>
              handleSectionChange(
                "offerLetters"
              )
            }
          >
            <span>◇</span>
            Offer Letters
          </button>

          <button
            type="button"
            className={`admin-nav-item ${
              activeSection === "settings"
                ? "active"
                : ""
            }`}
            onClick={() =>
              handleSectionChange(
                "settings"
              )
            }
          >
            <span>⚙</span>
            Website Settings
          </button>

        </nav>

        {/* --------------------------------------
            SIDEBAR BOTTOM
        -------------------------------------- */}

        <div className="admin-sidebar-bottom">

          <a
            href="/"
            className="admin-view-site"
          >
            <span>↗</span>
            View Website
          </a>

          <button
            type="button"
            className="admin-logout"
            onClick={handleLogout}
          >
            <span>↪</span>
            Logout
          </button>

        </div>

      </aside>

      {/* ========================================
          MAIN CONTENT
      ======================================== */}

      <section className="admin-main-content">
        {renderActiveSection()}
      </section>

    </main>
  );
}

export default AdminDashboard;
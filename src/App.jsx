// ==========================================
// APP COMPONENT
// ==========================================

import { useEffect, useState } from "react";

// ==========================================
// SOCIAL MEDIA ICONS
// ==========================================

import {
  FaGithub,
  FaLinkedin,
  FaInstagram,
  FaWhatsapp,
  FaEnvelope,
  FaExternalLinkAlt,
  FaDownload,
} from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
// ==========================================
// ROUTING
// ==========================================

import AppRoutes from "./routes/AppRoutes";
import { BrowserRouter } from "react-router-dom";

// ==========================================
// SUPABASE
// ==========================================

import { supabase } from "./lib/supabase";

// ==========================================
// 3D SPACE BACKGROUND
// ==========================================

import SpaceBackground from "./components/SpaceBackground";

// ==========================================
// APP FUNCTION
// ==========================================

function App() {
  // ==========================================
  // PROFILE STATE
  // ==========================================

  const [profile, setProfile] = useState(null);

  const [projects, setProjects] = useState([]);

  const [skills, setSkills] = useState([]);

  const [certifications, setCertifications] = useState([]);

  const [experience, setExperience] = useState([]);

  const [education, setEducation] = useState([]);

  const [offerLetters, setOfferLetters] = useState([]);

  const [profileLoading, setProfileLoading] = useState(true);

  // ==========================================
  // CERTIFICATE PDF VIEWER
  // ==========================================

  const [certificateViewer, setCertificateViewer] = useState({
    open: false,
    url: "",
    title: "",
  });

  // ==========================================
  // WEBSITE SETTINGS
  // ==========================================

  const [siteSettings, setSiteSettings] = useState({
    show_home: true,
    show_about: true,
    show_profile: true,
    show_skills: true,
    show_projects: true,
    show_certifications: true,
    show_experience: true,
    show_offer_letters: true,
    show_education: true,
    show_contact: true,
    show_navbar: true,
    show_footer: true,
    maintenance_mode: false,
    theme: "dark",
  });

  // ==========================================
  // CERTIFICATE VIEWER EVENT
  // ==========================================

  useEffect(() => {
    const openCertificateViewer = (event) => {
      const { url, title } = event.detail || {};

      if (!url) {
        return;
      }

      setCertificateViewer({
        open: true,
        url,
        title: title || "Certificate",
      });
    };

    window.addEventListener(
      "openCertificateViewer",
      openCertificateViewer
    );

    return () => {
      window.removeEventListener(
        "openCertificateViewer",
        openCertificateViewer
      );
    };
  }, []);

  // ==========================================
  // CLOSE CERTIFICATE VIEWER WITH ESC
  // ==========================================

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setCertificateViewer({
          open: false,
          url: "",
          title: "",
        });
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, []);

  // ==========================================
  // LOAD ALL PUBLIC DATA
  // ==========================================

  useEffect(() => {
    const loadPortfolioData = async () => {
      try {
        const results = await Promise.all([
          // ==========================================
          // SITE SETTINGS
          // ==========================================

          supabase
            .from("site_settings")
            .select("*")
            .order("id", {
              ascending: true,
            })
            .limit(1)
            .maybeSingle(),

          // ==========================================
          // PROJECTS
          // ==========================================

          supabase
            .from("projects")
            .select("*")
            .eq("visible", true)
            .order("display_order", {
              ascending: true,
            }),

          // ==========================================
          // SKILLS
          // ==========================================

          supabase
            .from("skills")
            .select("*")
            .eq("visible", true)
            .order("display_order", {
              ascending: true,
            }),

          // ==========================================
          // CERTIFICATIONS
          // ==========================================

          supabase
            .from("certifications")
            .select("*")
            .eq("visible", true)
            .order("display_order", {
              ascending: true,
            }),

          // ==========================================
          // EXPERIENCE
          // ==========================================

          supabase
            .from("experience")
            .select("*")
            .eq("visible", true)
            .order("display_order", {
              ascending: true,
            }),

          // ==========================================
          // EDUCATION
          // ==========================================

          supabase
            .from("education")
            .select("*")
            .eq("visible", true)
            .order("display_order", {
              ascending: true,
            }),

          // ==========================================
          // OFFER LETTERS
          // ==========================================

          supabase
            .from("offer_letters")
            .select("*")
            .eq("visible", true)
            .order("display_order", {
              ascending: true,
            }),
        ]);

        // ==========================================
        // WEBSITE SETTINGS
        // ==========================================

        if (!results[0].error && results[0].data) {
          setSiteSettings((previous) => ({
            ...previous,
            ...results[0].data,
          }));
        } else if (results[0].error) {
          console.error(
            "Website settings loading error:",
            results[0].error
          );
        }

        // ==========================================
        // PROFILE
        // ==========================================

        if (!results[0].error && results[0].data) {
          setProfile(results[0].data);
        } else if (results[0].error) {
          console.error(
            "Profile loading error:",
            results[0].error
          );
        }

        // ==========================================
        // PROJECTS
        // ==========================================

        if (!results[1].error) {
          setProjects(results[1].data || []);
        } else {
          console.error(
            "Projects loading error:",
            results[1].error
          );
        }

        // ==========================================
        // SKILLS
        // ==========================================

        if (!results[2].error) {
          setSkills(results[2].data || []);
        } else {
          console.error(
            "Skills loading error:",
            results[2].error
          );
        }

        // ==========================================
        // CERTIFICATIONS
        // ==========================================

        if (!results[3].error) {
          setCertifications(results[3].data || []);
        } else {
          console.error(
            "Certifications loading error:",
            results[3].error
          );
        }

        // ==========================================
        // EXPERIENCE
        // ==========================================

        if (!results[4].error) {
          setExperience(results[4].data || []);
        } else {
          console.error(
            "Experience loading error:",
            results[4].error
          );
        }

        // ==========================================
        // EDUCATION
        // ==========================================

        if (!results[5].error) {
          setEducation(results[5].data || []);
        } else {
          console.error(
            "Education loading error:",
            results[5].error
          );
        }

        // ==========================================
        // OFFER LETTERS
        // ==========================================

        if (!results[6].error) {
          setOfferLetters(results[6].data || []);
        } else {
          console.error(
            "Offer letters loading error:",
            results[6].error
          );
        }
      } catch (error) {
        console.error(
          "Portfolio loading error:",
          error
        );
      } finally {
        setProfileLoading(false);
      }
    };

    loadPortfolioData();
  }, []);

  // ==========================================
  // APPLY WEBSITE THEME
  // ==========================================

  useEffect(() => {
    const theme = siteSettings.theme || "dark";

    document.documentElement.setAttribute(
      "data-theme",
      theme
    );
  }, [siteSettings.theme]);

  // ==========================================
  // SEO SETTINGS
  // ==========================================

  useEffect(() => {
    const title = "Sanjeev | Tech Explorer";
    const description =
      siteSettings.site_description ||
      "Sanjeev IT Explorer";

    // ==========================================
    // BROWSER TITLE
    // ==========================================

    document.title = title;

    // ==========================================
    // META DESCRIPTION
    // ==========================================

    let metaDescription = document.querySelector(
      'meta[name="description"]'
    );

    if (!metaDescription) {
      metaDescription = document.createElement("meta");

      metaDescription.setAttribute(
        "name",
        "description"
      );

      document.head.appendChild(metaDescription);
    }

    metaDescription.setAttribute(
      "content",
      description
    );

    // ==========================================
    // FAVICON
    // ==========================================

    if (siteSettings.favicon_url) {
      let favicon = document.querySelector(
        'link[rel="icon"]'
      );

      if (!favicon) {
        favicon = document.createElement("link");

        favicon.setAttribute(
          "rel",
          "icon"
        );

        document.head.appendChild(favicon);
      }

      favicon.setAttribute(
        "href",
        siteSettings.favicon_url
      );
    }

    // ==========================================
    // OPEN GRAPH TITLE
    // ==========================================

    let ogTitle = document.querySelector(
      'meta[property="og:title"]'
    );

    if (!ogTitle) {
      ogTitle = document.createElement("meta");

      ogTitle.setAttribute(
        "property",
        "og:title"
      );

      document.head.appendChild(ogTitle);
    }

    ogTitle.setAttribute(
      "content",
      title
    );

    // ==========================================
    // OPEN GRAPH DESCRIPTION
    // ==========================================

    let ogDescription = document.querySelector(
      'meta[property="og:description"]'
    );

    if (!ogDescription) {
      ogDescription = document.createElement("meta");

      ogDescription.setAttribute(
        "property",
        "og:description"
      );

      document.head.appendChild(ogDescription);
    }

    ogDescription.setAttribute(
      "content",
      description
    );

    // ==========================================
    // OPEN GRAPH IMAGE
    // ==========================================

    if (siteSettings.og_image_url) {
      let ogImage = document.querySelector(
        'meta[property="og:image"]'
      );

      if (!ogImage) {
        ogImage = document.createElement("meta");

        ogImage.setAttribute(
          "property",
          "og:image"
        );

        document.head.appendChild(ogImage);
      }

      ogImage.setAttribute(
        "content",
        siteSettings.og_image_url
      );
    }
  }, [
    siteSettings.site_title,
    siteSettings.site_description,
    siteSettings.favicon_url,
    siteSettings.og_image_url,
  ]);

  // ==========================================
  // MOUSE PARALLAX
  // ==========================================

  useEffect(() => {
    const handleMouseMove = (event) => {
      const x =
        (event.clientX / window.innerWidth - 0.5) * 2;

      const y =
        (event.clientY / window.innerHeight - 0.5) * 2;

      document.documentElement.style.setProperty(
        "--mouse-x",
        `${x}`
      );

      document.documentElement.style.setProperty(
        "--mouse-y",
        `${y}`
      );
    };

    window.addEventListener(
      "mousemove",
      handleMouseMove
    );

    return () => {
      window.removeEventListener(
        "mousemove",
        handleMouseMove
      );
    };
  }, []);

  // ==========================================
  // ADMIN ROUTES
  // ==========================================

  if (
    window.location.pathname.startsWith("/admin")
  ) {
    return (
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    );
  }

  // ==========================================
  // PUBLIC PROFILE DATA
  // ==========================================

  const fullName =
    profile?.full_name ||
    "Sanjeev Kumar Jaiswal";

  const role =
    profile?.role ||
    "BCA Graduate | IT Explorer";

  const bio =
    profile?.bio ||
    "BCA graduate exploring IT, cloud, technology and modern digital solutions.";

  const location =
    profile?.location ||
    "India";

  const availability =
    profile?.availability ||
    "Available for opportunities";

  const profileImage =
    profile?.profile_image_url ||
    "";

  const resumeUrl =
    profile?.resume_url ||
    "";

  const githubUrl =
    profile?.github_url ||
    "";

  const linkedinUrl =
    profile?.linkedin_url ||
    "";

  const instagramUrl =
    profile?.instagram_url ||
    "";

  // ==========================================
  // WHATSAPP CHAT LINK
  // ==========================================

  const whatsappNumber =
    (profile?.whatsapp_number || "").replace(/\D/g, "");

  const whatsappUrl = whatsappNumber
    ? `https://wa.me/${whatsappNumber}`
    : "";

  const email =
    profile?.email ||
    "";

  // ==========================================
  // NAME
  // ==========================================

  const nameParts =
    fullName.trim().split(" ");

  const firstName =
    nameParts.length > 2
      ? nameParts.slice(0, -2).join(" ")
      : nameParts[0];

  const lastName =
    nameParts.length > 2
      ? nameParts.slice(-2).join(" ")
      : nameParts.slice(1).join(" ");

  // ==========================================
  // ROLE ITEMS
  // ==========================================

  const roleItems = role
    .split("|")
    .map((item) => item.trim())
    .filter(Boolean);

  // ==========================================
  // WHATSAPP LINK
  // ==========================================

  const whatsappLink = whatsappUrl
    ? whatsappUrl.startsWith("http")
      ? whatsappUrl
      : `https://wa.me/${whatsappUrl.replace(/\D/g, "")}`
    : "";

  // ==========================================
  // MAINTENANCE MODE
  // ==========================================

  if (siteSettings.maintenance_mode) {
    return (
      <main className="portfolio maintenance-page">

        {/* ==========================================
            MAINTENANCE BACKGROUND
        ========================================== */}

        <SpaceBackground />

        <div className="background-scene">

          <div className="background-grid"></div>

          <div className="ambient-glow glow-purple"></div>

          <div className="ambient-glow glow-blue"></div>

        </div>

        {/* ==========================================
            MAINTENANCE CONTENT
        ========================================== */}

        <section className="maintenance-content">

          <span className="maintenance-badge">
            SYSTEM UPDATE
          </span>

          <h1>
            Website Under Maintenance
          </h1>

          <p>
            I’m currently updating my portfolio.
            Please check back soon.
          </p>

          <div className="maintenance-line"></div>

          <strong>
            SANJEEV PORTFOLIO
          </strong>

        </section>

      </main>
    );
  }

  // ==========================================
  // PUBLIC PORTFOLIO
  // ==========================================

  return (
    <main className="portfolio">

      {/* ==========================================
          3D SPACE BACKGROUND
      ========================================== */}

      <SpaceBackground />

      {/* ==========================================
          FUTURISTIC BACKGROUND
      ========================================== */}

      <div className="background-scene">

        <div className="background-grid"></div>

        <div className="ambient-glow glow-purple"></div>

        <div className="ambient-glow glow-blue"></div>

        <div className="floating-orb orb-one"></div>

        <div className="floating-orb orb-two"></div>

        <div className="floating-orb orb-three"></div>

        <div className="particle-field">

          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>

        </div>

      </div>

      {/* ==========================================
          NAVIGATION
      ========================================== */}

      {siteSettings.show_navbar && (

        <header className="navbar">

          <div className="logo">

            <span>
              S
            </span>

          </div>

          <nav className="nav-links">

            {siteSettings.show_home && (
              <a href="#home">
                Home
              </a>
            )}

            {siteSettings.show_about && (
              <a href="#about">
                About
              </a>
            )}

            {siteSettings.show_projects && (
              <a href="#projects">
                Projects
              </a>
            )}

            {siteSettings.show_skills && (
              <a href="#skills">
                Skills
              </a>
            )}

            {siteSettings.show_certifications && (
              <a href="#certifications">
                Certifications
              </a>
            )}

            {siteSettings.show_experience && (
              <a href="#experience">
                Experience
              </a>
            )}

            {siteSettings.show_contact && (
              <a href="#contact">
                Contact
              </a>
            )}

            {resumeUrl && (
              <a
                href={resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Resume
              </a>
            )}

          </nav>

          {/* ==========================================
              ADMIN BUTTON
          ========================================== */}

          <button
            type="button"
            className="admin-button"
            title="Admin"
            onClick={() => {
              window.location.href = "/admin";
            }}
          >
            S
          </button>

        </header>

      )}

      {/* ==========================================
          HERO
      ========================================== */}

      {siteSettings.show_home && (

        <section
          id="home"
          className="hero"
        >

          <div className="hero-content">

            {/* ==========================================
                HERO LABEL
            ========================================== */}

            <p className="hero-label">
              HELLO, I'M
            </p>

            {/* ==========================================
                HERO NAME
            ========================================== */}

            <h1>

              {firstName}

              <span>
                {lastName}
              </span>

            </h1>

            {/* ==========================================
                HERO ROLE
            ========================================== */}

            <div className="hero-role">

              {roleItems.map((item, index) => (

                <span
                  key={`${item}-${index}`}
                >

                  {item}

                  {index < roleItems.length - 1 && (
                    <b>•</b>
                  )}

                </span>

              ))}

            </div>

            {/* ==========================================
                HERO DESCRIPTION
            ========================================== */}

            <p className="hero-description">
              {bio}
            </p>

            {/* ==========================================
                HERO BUTTONS
            ========================================== */}

            <div className="hero-actions">

              <button
                type="button"
                className="primary-button"
                onClick={() => {
                  document
                    .getElementById("projects")
                    ?.scrollIntoView({
                      behavior: "smooth",
                    });
                }}
              >

                <span>
                  Explore My Work
                </span>

                <b>
                  ↗
                </b>

              </button>

              {resumeUrl && (

                <a
                  href={resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="secondary-button"
                >
                  View Resume
                </a>

              )}

            </div>

            {/* ==========================================
                QUICK STATS
            ========================================== */}

            <div className="quick-stats">

              <div>

                <strong>
                  {projects.length}+
                </strong>

                <span>
                  Projects
                </span>

              </div>

              <div>

                <strong>
                  {skills.length}+
                </strong>

                <span>
                  Skills
                </span>

              </div>

              <div>

                <strong>
                  {certifications.length}+
                </strong>

                <span>
                  Certifications
                </span>

              </div>

            </div>

          </div>

          {/* ==========================================
              HERO VISUAL
          ========================================== */}

          <div className="hero-visual">

            <div className="profile-orbit orbit-one"></div>

            <div className="profile-orbit orbit-two"></div>

            {/* ==========================================
                PROFILE CARD
            ========================================== */}

            {siteSettings.show_profile && (

              <div className="profile-card">

                <div className="card-top">

                  <span>
                    Fresher
                  </span>

                  <span>
                    ONLINE
                  </span>

                </div>

                {/* ==========================================
                    PROFILE PHOTO
                ========================================== */}

                <div className="profile-placeholder">

                  {profileImage ? (

                    <img
                      src={profileImage}
                      alt={fullName}
                    />

                  ) : (

                    <span>
                      {fullName.charAt(0)}
                    </span>

                  )}

                </div>

                {/* ==========================================
                    PROFILE INFORMATION
                ========================================== */}

                <div className="profile-info">

                  <strong>
                    {fullName}
                  </strong>

                  <span>
                    {role}
                  </span>

                </div>

                {/* ==========================================
                    CARD FOOTER
                ========================================== */}

                <div className="card-footer">

                  <span>
                    {location.toUpperCase()}
                  </span>

                  <span>
                    {availability.toUpperCase()}
                  </span>

                </div>

              </div>

            )}

            {/* ==========================================
                STATUS LABEL
            ========================================== */}

            <div className="floating-label label-top">

              <small>
                STATUS
              </small>

              <strong>
                OPEN TO WORK
              </strong>

            </div>

            {/* ==========================================
                FOCUS LABEL
            ========================================== */}

            <div className="floating-label label-bottom">

              <small>
                FOCUS
              </small>

              <strong>
                IT • CLOUD • TECH
              </strong>

            </div>

          </div>

        </section>

      )}

      {/* ==========================================
          ABOUT
      ========================================== */}

      {siteSettings.show_about && (

        <section
          id="about"
          className="public-section about-section"
        >

          <div className="section-heading">

            <span>
              01
            </span>

            <h2>
              About Me
            </h2>

          </div>

          <div className="about-content">

            <p>
              {bio}
            </p>

            <div className="about-details">

              <div>

                <small>
                  LOCATION
                </small>

                <strong>
                  {location}
                </strong>

              </div>

              <div>

                <small>
                  AVAILABILITY
                </small>

                <strong>
                  {availability}
                </strong>

              </div>

            </div>

          </div>

        </section>

      )}

      {/* ==========================================
          PROJECTS
      ========================================== */}

      {siteSettings.show_projects && (

        <section
          id="projects"
          className="public-section"
        >

          <div className="section-heading">

            <span>
              02
            </span>

            <h2>
              Projects
            </h2>

          </div>

          {projects.length === 0 ? (

            <div className="empty-section-card">

              <strong>
                Projects Coming Soon
              </strong>

              <p>
                My projects will appear here.
              </p>

            </div>

          ) : (

            <div className="projects-grid">

              {projects.map((project) => (

                <article
                  className="project-card"
                  key={project.id}
                >

                  {project.image_url && (

                    <div className="project-image">

                      <img
                        src={project.image_url}
                        alt={project.title}
                      />

                    </div>

                  )}

                  <div className="project-content">

                    <h3>
                      {project.title}
                    </h3>

                    <p>
                      {project.description}
                    </p>

                    {project.technologies && (

                      <div className="project-tech">

                        {project.technologies
                          .split(",")
                          .map((tech) => (

                            <span
                              key={tech}
                            >
                              {tech.trim()}
                            </span>

                          ))}

                      </div>

                    )}

                    <div className="project-links">

                      {project.github_url && (

                        <a
                          href={project.github_url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          GitHub
                        </a>

                      )}

                      {project.live_url && (

                        <a
                          href={project.live_url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >

                          Live Demo

                          <FaExternalLinkAlt />

                        </a>

                      )}

                    </div>

                  </div>

                </article>

              ))}

            </div>

          )}

        </section>

      )}

      {/* ==========================================
          SKILLS
      ========================================== */}

      {siteSettings.show_skills && (

        <section
          id="skills"
          className="public-section"
        >

          <div className="section-heading">

            <span>
              03
            </span>

            <h2>
              Skills
            </h2>

          </div>

          {skills.length === 0 ? (

            <div className="empty-section-card">

              <strong>
                Skills Coming Soon
              </strong>

            </div>

          ) : (

            <div className="skills-preview">

              {skills.map((skill) => (

                <span
                  key={skill.id}
                >
                  {skill.name}
                </span>

              ))}

            </div>

          )}

        </section>

      )}

      {/* ==========================================
          CERTIFICATIONS
      ========================================== */}

      {siteSettings.show_certifications && (

        <section
          id="certifications"
          className="public-section"
        >

          {/* ==========================================
              SECTION HEADING
          ========================================== */}

          <div className="section-heading">

            <span>
              04
            </span>

            <h2>
              Certifications
            </h2>

          </div>

          {/* ==========================================
              EMPTY STATE
          ========================================== */}

          {certifications.length === 0 ? (

            <div className="empty-section-card">

              <strong>
                Certifications Coming Soon
              </strong>

            </div>

          ) : (

            <div className="certifications-grid">

              {certifications.map((certificate) => (

                <article
                  className="certificate-card"
                  key={certificate.id}
                >

                  {/* ==========================================
                      CERTIFICATE IMAGE
                  ========================================== */}

                  {certificate.image_url && (

                    <img
                      src={certificate.image_url}
                      alt={certificate.title}
                    />

                  )}

                  {/* ==========================================
                      CERTIFICATE INFORMATION
                  ========================================== */}

                  <div>

                    <h3>
                      {certificate.title}
                    </h3>

                    <p>
                      {certificate.issuer}
                    </p>

                    {certificate.issue_date && (

                      <small>
                        {certificate.issue_date}
                      </small>

                    )}

                    {/* ==========================================
                        VIEW CERTIFICATE
                    ========================================== */}

                    {certificate.certificate_url && (

                      <button
                        type="button"
                        className="certificate-view-button"
                        onClick={() => {
                          window.dispatchEvent(
                            new CustomEvent(
                              "openCertificateViewer",
                              {
                                detail: {
                                  url:
                                    certificate.certificate_url,
                                  title:
                                    certificate.title,
                                },
                              }
                            )
                          );
                        }}
                      >

                        View Certificate

                        <FaExternalLinkAlt />

                      </button>

                    )}

                  </div>

                </article>

              ))}

            </div>

          )}

        </section>

      )}

      {/* ==========================================
          EXPERIENCE
      ========================================== */}

      {siteSettings.show_experience && (

        <section
          id="experience"
          className="public-section"
        >

          <div className="section-heading">

            <span>
              05
            </span>

            <h2>
              Experience
            </h2>

          </div>

          {experience.length === 0 ? (

            <div className="empty-section-card">

              <strong>
                Fresher
              </strong>

              <p>
                Professional experience will appear here.
              </p>

            </div>

          ) : (

            <div className="timeline">

              {experience.map((item) => (

                <article
                  className="timeline-item"
                  key={item.id}
                >

                  <div className="timeline-dot"></div>

                  <div className="timeline-content">

                    <h3>
                      {item.job_title}
                    </h3>

                    <strong>
                      {item.company}
                    </strong>

                    {item.location && (
                      <small>
                        {item.location}
                      </small>
                    )}

                    <small>
                      {item.start_date} —{" "}
                      {item.end_date || "Present"}
                    </small>

                    <p>
                      {item.description}
                    </p>

                  </div>

                </article>

              ))}

            </div>

          )}

        </section>

      )}

      {/* ==========================================
          EDUCATION
          EXPERIENCE STYLE TIMELINE
      ========================================== */}

      {siteSettings.show_education && (

        <section
          id="education"
          className="public-section"
        >

          <div className="section-heading">

            <span>
              06
            </span>

            <h2>
              Education
            </h2>

          </div>

          {education.length === 0 ? (

            <div className="empty-section-card">

              <strong>
                Education Coming Soon
              </strong>

            </div>

          ) : (

            <div className="timeline">

              {education.map((item) => (

                <article
                  className="timeline-item"
                  key={item.id}
                >

                  {/* ==========================================
                      EDUCATION TIMELINE DOT
                  ========================================== */}

                  <div className="timeline-dot"></div>

                  {/* ==========================================
                      EDUCATION CONTENT
                  ========================================== */}

                  <div className="timeline-content">

                    <h3>
                      {item.degree}
                    </h3>

                    <strong>
                      {item.institution}
                    </strong>

                    {item.location && (

                      <small>
                        {item.location}
                      </small>

                    )}

                    {item.duration && (
                      <small>
                        {item.duration}
                      </small>
                    )}

                    {item.grade && (

                      <span className="education-grade">
                        {item.grade}
                      </span>

                    )}

                    {item.description && (

                      <p>
                        {item.description}
                      </p>

                    )}

                  </div>

                </article>

              ))}

            </div>

          )}

        </section>

      )}

      {/* ==========================================
          OFFER LETTERS
      ========================================== */}

      {siteSettings.show_offer_letters && (

        <section
          id="offer-letters"
          className="public-section"
        >

          <div className="section-heading">

            <span>
              07
            </span>

            <h2>
              Offer Letters
            </h2>

          </div>

          {offerLetters.length === 0 ? (

            <div className="empty-section-card">

              <strong>
                Offer Letters
              </strong>

              <p>
                Verified career documents will appear here.
              </p>

            </div>

          ) : (

            <div className="offer-grid">

              {offerLetters.map((letter) => (

                <article
                  className="offer-card"
                  key={letter.id}
                >

                  <h3>
                    {letter.title}
                  </h3>

                  <strong>
                    {letter.company}
                  </strong>

                  <small>
                    {letter.issue_date}
                  </small>

                  {letter.file_url && (

                    <a
                      href={letter.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >

                      <FaDownload />

                      View Document

                    </a>

                  )}

                </article>

              ))}

            </div>

          )}

        </section>

      )}

      {/* ==========================================
          CONTACT
      ========================================== */}

      {siteSettings.show_contact && (

        <section
          id="contact"
          className="public-section contact-section"
        >

          <div className="section-heading">

            <span>
              08
            </span>

            <h2>
              Let's Connect
            </h2>

          </div>

          {/* ==========================================
              SOCIAL ICONS
          ========================================== */}

          <div className="contact-social-icons">

            {githubUrl && (

              <a
                href={githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="contact-social-icon"
                title="GitHub"
                aria-label="GitHub"
              >
                <FaGithub />
              </a>

            )}

            {linkedinUrl && (

              <a
                href={linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="contact-social-icon"
                title="LinkedIn"
                aria-label="LinkedIn"
              >
                <FaLinkedin />
              </a>

            )}

            {instagramUrl && (

              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="contact-social-icon"
                title="Instagram"
                aria-label="Instagram"
              >
                <FaInstagram />
              </a>

            )}
{/*==========================================
// X (TWITTER) SOCIAL ICON
// ==========================================*/}

{profile?.x_url && (
  <a
    href={profile.x_url}
    target="_blank"
    rel="noopener noreferrer"
    className="contact-social-icon"
    title="X"
    aria-label="X"
  >
    <FaXTwitter />
  </a>
)}
            {/* ==========================================
                WHATSAPP
            ========================================== */}

            {whatsappLink && (

              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="contact-social-icon"
                title="WhatsApp"
                aria-label="WhatsApp"
              >
                <FaWhatsapp />
              </a>

            )}

            {email && (

              <a
                href={`mailto:${email}`}
                className="contact-social-icon"
                title="Email"
                aria-label="Email"
              >
                <FaEnvelope />
              </a>

            )}

          </div>

          <div className="contact-message">

            <p>
              Feel free to connect with me through any
              of the platforms above.
            </p>

          </div>

        </section>

      )}

      {/* ==========================================
          FOOTER
      ========================================== */}

      {siteSettings.show_footer && (

        <footer className="public-footer">

          <div>

            <strong>
              S
            </strong>

            <span>
            portfolio
            </span>

          </div>

          <p>
            © {new Date().getFullYear()}{" "}
            {fullName}.
            All rights reserved.
          </p>

        </footer>

      )}

      {/* ==========================================
          SCROLL INDICATOR
      ========================================== */}

      <div className="scroll-indicator">

        <span></span>

        End 

      </div>

      {/* ==========================================
          CERTIFICATE PDF VIEWER MODAL
      ========================================== */}

      {certificateViewer.open && (

        <div
          className="certificate-modal-overlay"
          onClick={() => {
            setCertificateViewer({
              open: false,
              url: "",
              title: "",
            });
          }}
        >

          <div
            className="certificate-modal"
            onClick={(event) => {
              event.stopPropagation();
            }}
          >

            {/* ==========================================
                MODAL HEADER
            ========================================== */}

            <div className="certificate-modal-header">

              <div>

                <span>
                  Certificate
                </span>

                <h3>
                  {certificateViewer.title}
                </h3>

              </div>

              <button
                type="button"
                className="certificate-modal-close"
                onClick={() => {
                  setCertificateViewer({
                    open: false,
                    url: "",
                    title: "",
                  });
                }}
                aria-label="Close certificate viewer"
              >
                ×
              </button>

            </div>

            {/* ==========================================
                PDF VIEWER
            ========================================== */}

            <div className="certificate-pdf-container">

              <iframe
                src={`${certificateViewer.url}#toolbar=0&navpanes=0&scrollbar=1`}
                title={certificateViewer.title}
                className="certificate-pdf-frame"
              />

            </div>

          </div>

        </div>

      )}

      {/* ==========================================
          LOADING
      ========================================== */}

      {profileLoading && (

        <div className="public-loading">

          <div className="admin-route-spinner"></div>

        </div>

      )}

    </main>
  );
}

// ==========================================
// EXPORT
// ==========================================

export default App;
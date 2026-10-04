// ==========================================
// WEBSITE SETTINGS MANAGER
// ==========================================

import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

// ==========================================
// WEBSITE SETTINGS COMPONENT
// ==========================================

function WebsiteSettings() {
  // ==========================================
  // SETTINGS STATE
  // ==========================================

  const [settingsId, setSettingsId] = useState(null);

  const [formData, setFormData] = useState({
    site_title: "",
    site_description: "",
    favicon_url: "",
    og_image_url: "",
    theme: "dark",
    maintenance_mode: false,

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
  });

  // ==========================================
  // UI STATE
  // ==========================================

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // ==========================================
  // LOAD SETTINGS
  // ==========================================

  const loadSettings = async () => {
    try {
      setLoading(true);
      setError("");

      const { data, error: fetchError } =
        await supabase
          .from("site_settings")
          .select("*")
          .order("id", {
            ascending: true,
          })
          .limit(1)
          .maybeSingle();

      if (fetchError) {
        throw fetchError;
      }

      // ----------------------------------------
      // NO ROW FOUND
      // ----------------------------------------

      if (!data) {
        setMessage(
          "No settings found. Save the form to create them."
        );

        setLoading(false);
        return;
      }

      // ----------------------------------------
      // SAVE ROW ID
      // ----------------------------------------

      setSettingsId(data.id);

      // ----------------------------------------
      // LOAD FORM DATA
      // ----------------------------------------

      setFormData({
        site_title:
          data.site_title || "",

        site_description:
          data.site_description || "",

        favicon_url:
          data.favicon_url || "",

        og_image_url:
          data.og_image_url || "",

        theme:
          data.theme || "dark",

        maintenance_mode:
          Boolean(
            data.maintenance_mode
          ),

        show_home:
          data.show_home !== false,

        show_about:
          data.show_about !== false,

        show_profile:
          data.show_profile !== false,

        show_skills:
          data.show_skills !== false,

        show_projects:
          data.show_projects !== false,

        show_certifications:
          data.show_certifications !== false,

        show_experience:
          data.show_experience !== false,

        show_offer_letters:
          data.show_offer_letters !== false,

        show_education:
          data.show_education !== false,

        show_contact:
          data.show_contact !== false,

        show_navbar:
          data.show_navbar !== false,

        show_footer:
          data.show_footer !== false,
      });

    } catch (err) {
      console.error(
        "Failed to load website settings:",
        err
      );

      setError(
        err?.message ||
          "Unable to load website settings."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // INITIAL LOAD
  // ==========================================

  useEffect(() => {
    loadSettings();
  }, []);

  // ==========================================
  // INPUT CHANGE
  // ==========================================

  const handleChange = (event) => {
    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));

    setMessage("");
    setError("");
  };

  // ==========================================
  // SAVE SETTINGS
  // ==========================================

  const handleSave = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setMessage("");
      setError("");

      // ----------------------------------------
      // CLEAN DATA
      // ----------------------------------------

      const payload = {
        site_title:
          formData.site_title.trim(),

        site_description:
          formData.site_description.trim(),

        favicon_url:
          formData.favicon_url.trim(),

        og_image_url:
          formData.og_image_url.trim(),

        theme:
          formData.theme,

        maintenance_mode:
          Boolean(
            formData.maintenance_mode
          ),

        show_home:
          Boolean(formData.show_home),

        show_about:
          Boolean(formData.show_about),

        show_profile:
          Boolean(formData.show_profile),

        show_skills:
          Boolean(formData.show_skills),

        show_projects:
          Boolean(formData.show_projects),

        show_certifications:
          Boolean(
            formData.show_certifications
          ),

        show_experience:
          Boolean(formData.show_experience),

        show_offer_letters:
          Boolean(
            formData.show_offer_letters
          ),

        show_education:
          Boolean(
            formData.show_education
          ),

        show_contact:
          Boolean(formData.show_contact),

        show_navbar:
          Boolean(formData.show_navbar),

        show_footer:
          Boolean(formData.show_footer),
      };

      // ========================================
      // UPDATE EXISTING ROW
      // ========================================

      if (settingsId) {
        const {
          data,
          error: updateError,
        } = await supabase
          .from("site_settings")
          .update(payload)
          .eq("id", settingsId)
          .select()
          .single();

        if (updateError) {
          throw updateError;
        }

        setSettingsId(data.id);

        setMessage(
          "Website settings updated successfully."
        );
      }

      // ========================================
      // CREATE SETTINGS ROW
      // ========================================

      else {
        const {
          data,
          error: insertError,
        } = await supabase
          .from("site_settings")
          .insert([payload])
          .select()
          .single();

        if (insertError) {
          throw insertError;
        }

        setSettingsId(data.id);

        setMessage(
          "Website settings created successfully."
        );
      }

    } catch (err) {
      console.error(
        "Failed to save website settings:",
        err
      );

      setError(
        err?.message ||
          "Unable to save website settings."
      );
    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // LOADING SCREEN
  // ==========================================

  if (loading) {
    return (
      <div className="admin-manager">

        <div className="admin-manager-card">

          <div className="admin-loading-state">

            <div className="admin-route-spinner"></div>

            <h3>
              Loading Website Settings...
            </h3>

            <p>
              Please wait while your settings
              are being loaded.
            </p>

          </div>

        </div>

      </div>
    );
  }

  // ==========================================
  // MAIN UI
  // ==========================================

  return (
    <div className="admin-manager">

      {/* ========================================
          HEADER
      ======================================== */}

      <div className="admin-manager-header">

        <div>

          <p className="admin-page-label">
            WEBSITE CONFIGURATION
          </p>

          <h1>
            Website Settings
          </h1>

          <p>
            Control your portfolio appearance,
            SEO and section visibility.
          </p>

        </div>

      </div>

      {/* ========================================
          SUCCESS MESSAGE
      ======================================== */}

      {message && (
        <div className="admin-success-message">

          <span>✓</span>

          {message}

        </div>
      )}

      {/* ========================================
          ERROR MESSAGE
      ======================================== */}

      {error && (
        <div className="admin-error-message">

          <span>!</span>

          <div>

            <strong>
              Something went wrong
            </strong>

            <p>
              {error}
            </p>

          </div>

        </div>
      )}

      {/* ========================================
          SETTINGS FORM
      ======================================== */}

      <form
        className="admin-settings-form"
        onSubmit={handleSave}
      >

        {/* ======================================
            GENERAL SETTINGS
        ====================================== */}

        <div className="admin-manager-card">

          <div className="admin-manager-card-header">

            <div>

              <p className="admin-page-label">
                GENERAL
              </p>

              <h2>
                Website Information
              </h2>

            </div>

          </div>

          <div className="admin-form-grid">

            {/* --------------------------------
                WEBSITE TITLE
            -------------------------------- */}

            <div className="admin-field admin-field-full">

              <label>
                Website Title
              </label>

              <input
                type="text"
                name="site_title"
                value={formData.site_title}
                onChange={handleChange}
                placeholder="Sanjeev Kumar Jaiswal | Portfolio"
              />

              <small className="admin-field-help">
                This will be used as the browser
                tab title and SEO title.
              </small>

            </div>

            {/* --------------------------------
                DESCRIPTION
            -------------------------------- */}

            <div className="admin-field admin-field-full">

              <label>
                Meta Description
              </label>

              <textarea
                name="site_description"
                value={
                  formData.site_description
                }
                onChange={handleChange}
                placeholder="Describe your portfolio..."
                rows={4}
              />

              <small className="admin-field-help">
                A short description for search
                engines and social sharing.
              </small>

            </div>

            {/* --------------------------------
                FAVICON
            -------------------------------- */}

            <div className="admin-field">

              <label>
                Favicon URL
              </label>

              <input
                type="url"
                name="favicon_url"
                value={
                  formData.favicon_url
                }
                onChange={handleChange}
                placeholder="https://..."
              />

            </div>

            {/* --------------------------------
                OG IMAGE
            -------------------------------- */}

            <div className="admin-field">

              <label>
                Open Graph Image URL
              </label>

              <input
                type="url"
                name="og_image_url"
                value={
                  formData.og_image_url
                }
                onChange={handleChange}
                placeholder="https://..."
              />

            </div>

          </div>

        </div>

        {/* ======================================
            APPEARANCE
        ====================================== */}

        <div className="admin-manager-card">

          <div className="admin-manager-card-header">

            <div>

              <p className="admin-page-label">
                APPEARANCE
              </p>

              <h2>
                Theme
              </h2>

            </div>

          </div>

          <div className="admin-theme-options">

            {/* --------------------------------
                DARK
            -------------------------------- */}

            <label
              className={`admin-theme-option ${
                formData.theme === "dark"
                  ? "selected"
                  : ""
              }`}
            >

              <input
                type="radio"
                name="theme"
                value="dark"
                checked={
                  formData.theme === "dark"
                }
                onChange={handleChange}
              />

              <div className="admin-theme-preview dark-theme-preview">
                <div></div>
                <div></div>
                <div></div>
              </div>

              <span>
                Dark
              </span>

            </label>

            {/* --------------------------------
                LIGHT
            -------------------------------- */}

            <label
              className={`admin-theme-option ${
                formData.theme === "light"
                  ? "selected"
                  : ""
              }`}
            >

              <input
                type="radio"
                name="theme"
                value="light"
                checked={
                  formData.theme === "light"
                }
                onChange={handleChange}
              />

              <div className="admin-theme-preview light-theme-preview">
                <div></div>
                <div></div>
                <div></div>
              </div>

              <span>
                Light
              </span>

            </label>

            {/* --------------------------------
                SYSTEM
            -------------------------------- */}

            <label
              className={`admin-theme-option ${
                formData.theme === "system"
                  ? "selected"
                  : ""
              }`}
            >

              <input
                type="radio"
                name="theme"
                value="system"
                checked={
                  formData.theme === "system"
                }
                onChange={handleChange}
              />

              <div className="admin-theme-preview system-theme-preview">
                <div></div>
                <div></div>
                <div></div>
              </div>

              <span>
                System
              </span>

            </label>

          </div>

        </div>

        {/* ======================================
            SECTION VISIBILITY
        ====================================== */}

        <div className="admin-manager-card">

          <div className="admin-manager-card-header">

            <div>

              <p className="admin-page-label">
                CONTENT CONTROL
              </p>

              <h2>
                Section Visibility
              </h2>

            </div>

          </div>

          <div className="admin-settings-toggle-grid">

            {/* HOME */}

            <label className="admin-settings-toggle">

              <input
                type="checkbox"
                name="show_home"
                checked={
                  formData.show_home
                }
                onChange={handleChange}
              />

              <span className="admin-toggle-switch"></span>

              <div>
                <strong>
                  Home
                </strong>

                <small>
                  Hero / landing section
                </small>
              </div>

            </label>

            {/* ABOUT */}

            <label className="admin-settings-toggle">

              <input
                type="checkbox"
                name="show_about"
                checked={
                  formData.show_about
                }
                onChange={handleChange}
              />

              <span className="admin-toggle-switch"></span>

              <div>
                <strong>
                  About
                </strong>

                <small>
                  About me section
                </small>
              </div>

            </label>

            {/* PROFILE */}

            <label className="admin-settings-toggle">

              <input
                type="checkbox"
                name="show_profile"
                checked={
                  formData.show_profile
                }
                onChange={handleChange}
              />

              <span className="admin-toggle-switch"></span>

              <div>
                <strong>
                  Profile
                </strong>

                <small>
                  Profile card
                </small>
              </div>

            </label>

            {/* SKILLS */}

            <label className="admin-settings-toggle">

              <input
                type="checkbox"
                name="show_skills"
                checked={
                  formData.show_skills
                }
                onChange={handleChange}
              />

              <span className="admin-toggle-switch"></span>

              <div>
                <strong>
                  Skills
                </strong>

                <small>
                  Technical skills
                </small>
              </div>

            </label>

            {/* PROJECTS */}

            <label className="admin-settings-toggle">

              <input
                type="checkbox"
                name="show_projects"
                checked={
                  formData.show_projects
                }
                onChange={handleChange}
              />

              <span className="admin-toggle-switch"></span>

              <div>
                <strong>
                  Projects
                </strong>

                <small>
                  Portfolio projects
                </small>
              </div>

            </label>

            {/* CERTIFICATIONS */}

            <label className="admin-settings-toggle">

              <input
                type="checkbox"
                name="show_certifications"
                checked={
                  formData.show_certifications
                }
                onChange={handleChange}
              />

              <span className="admin-toggle-switch"></span>

              <div>
                <strong>
                  Certifications
                </strong>

                <small>
                  Certificates
                </small>
              </div>

            </label>

            {/* EXPERIENCE */}

            <label className="admin-settings-toggle">

              <input
                type="checkbox"
                name="show_experience"
                checked={
                  formData.show_experience
                }
                onChange={handleChange}
              />

              <span className="admin-toggle-switch"></span>

              <div>
                <strong>
                  Experience
                </strong>

                <small>
                  Work experience
                </small>
              </div>

            </label>

            {/* OFFER LETTERS */}

            <label className="admin-settings-toggle">

              <input
                type="checkbox"
                name="show_offer_letters"
                checked={
                  formData.show_offer_letters
                }
                onChange={handleChange}
              />

              <span className="admin-toggle-switch"></span>

              <div>
                <strong>
                  Offer Letters
                </strong>

                <small>
                  Documents and offers
                </small>
              </div>

            </label>

            {/* EDUCATION */}

            <label className="admin-settings-toggle">

              <input
                type="checkbox"
                name="show_education"
                checked={
                  formData.show_education
                }
                onChange={handleChange}
              />

              <span className="admin-toggle-switch"></span>

              <div>
                <strong>
                  Education
                </strong>

                <small>
                  Academic background
                </small>
              </div>

            </label>

            {/* CONTACT */}

            <label className="admin-settings-toggle">

              <input
                type="checkbox"
                name="show_contact"
                checked={
                  formData.show_contact
                }
                onChange={handleChange}
              />

              <span className="admin-toggle-switch"></span>

              <div>
                <strong>
                  Contact
                </strong>

                <small>
                  Contact section
                </small>
              </div>

            </label>

          </div>

        </div>

        {/* ======================================
            SITE ELEMENTS
        ====================================== */}

        <div className="admin-manager-card">

          <div className="admin-manager-card-header">

            <div>

              <p className="admin-page-label">
                SITE ELEMENTS
              </p>

              <h2>
                Navigation & Footer
              </h2>

            </div>

          </div>

          <div className="admin-settings-toggle-grid">

            {/* NAVBAR */}

            <label className="admin-settings-toggle">

              <input
                type="checkbox"
                name="show_navbar"
                checked={
                  formData.show_navbar
                }
                onChange={handleChange}
              />

              <span className="admin-toggle-switch"></span>

              <div>

                <strong>
                  Navigation Bar
                </strong>

                <small>
                  Show website navigation
                </small>

              </div>

            </label>

            {/* FOOTER */}

            <label className="admin-settings-toggle">

              <input
                type="checkbox"
                name="show_footer"
                checked={
                  formData.show_footer
                }
                onChange={handleChange}
              />

              <span className="admin-toggle-switch"></span>

              <div>

                <strong>
                  Footer
                </strong>

                <small>
                  Show website footer
                </small>

              </div>

            </label>

          </div>

        </div>

        {/* ======================================
            MAINTENANCE MODE
        ====================================== */}

        <div className="admin-manager-card admin-danger-settings-card">

          <div className="admin-manager-card-header">

            <div>

              <p className="admin-page-label">
                ADVANCED
              </p>

              <h2>
                Maintenance Mode
              </h2>

            </div>

          </div>

          <label className="admin-settings-toggle">

            <input
              type="checkbox"
              name="maintenance_mode"
              checked={
                formData.maintenance_mode
              }
              onChange={handleChange}
            />

            <span className="admin-toggle-switch"></span>

            <div>

              <strong>
                Enable Maintenance Mode
              </strong>

              <small>
                Temporarily show a maintenance
                screen to public visitors.
              </small>

            </div>

          </label>

          {formData.maintenance_mode && (
            <div className="admin-maintenance-warning">

              <strong>
                ⚠ Maintenance mode is ON
              </strong>

              <p>
                Visitors may not be able to view
                the normal portfolio website.
              </p>

            </div>
          )}

        </div>

        {/* ======================================
            SAVE BUTTON
        ====================================== */}

        <div className="admin-settings-save-bar">

          <button
            type="submit"
            className="admin-save-button"
            disabled={saving}
          >

            {saving ? (
              <>
                <span className="admin-button-spinner"></span>
                Saving Settings...
              </>
            ) : (
              "✓ Save Website Settings"
            )}

          </button>

        </div>

      </form>

    </div>
  );
}

export default WebsiteSettings;
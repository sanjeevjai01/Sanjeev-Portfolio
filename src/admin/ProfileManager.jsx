// ==========================================
// PROFILE MANAGER
// ==========================================

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

function ProfileManager() {
  // ==========================================
  // STATE
  // ==========================================

  const [profile, setProfile] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [photoFile, setPhotoFile] = useState(null);
  const [resumeFile, setResumeFile] = useState(null);

  const [photoPreview, setPhotoPreview] = useState("");
  const [resumeName, setResumeName] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // ==========================================
  // LOAD PROFILE
  // ==========================================

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        setError("");

        const { data, error: loadError } = await supabase
          .from("site_settings")
          .select("*")
          .order("id", {
            ascending: true,
          })
          .limit(1);

        if (loadError) {
          throw new Error(loadError.message);
        }

        if (!data || data.length === 0) {
          throw new Error("Profile data not found.");
        }

        const currentProfile = data[0];

        setProfile(currentProfile);

        // ==========================================
        // PROFILE PHOTO
        // ==========================================

        setPhotoPreview(
          currentProfile.profile_image_url || ""
        );

        // ==========================================
        // RESUME NAME
        // ==========================================

        if (currentProfile.resume_url) {
          const urlParts =
            currentProfile.resume_url.split("/");

          setResumeName(
            decodeURIComponent(
              urlParts[urlParts.length - 1]
            )
          );
        } else {
          setResumeName("");
        }
      } catch (loadError) {
        console.error(
          "Profile load error:",
          loadError
        );

        setError(loadError.message);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  // ==========================================
  // TEXT FIELD CHANGE
  // ==========================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setProfile((previous) => ({
      ...previous,
      [name]: value,
    }));

    setMessage("");
    setError("");
  };

  // ==========================================
  // PHOTO SELECT
  // ==========================================

  const handlePhotoChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    // ==========================================
    // IMAGE VALIDATION
    // ==========================================

    if (!file.type.startsWith("image/")) {
      setError(
        "Please select a valid image file."
      );

      return;
    }

    // ==========================================
    // SIZE VALIDATION
    // ==========================================

    if (file.size > 5 * 1024 * 1024) {
      setError(
        "Profile photo must be smaller than 5 MB."
      );

      return;
    }

    setPhotoFile(file);

    setPhotoPreview(
      URL.createObjectURL(file)
    );

    setMessage("");
    setError("");
  };

  // ==========================================
  // RESUME SELECT
  // ==========================================

  const handleResumeChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    // ==========================================
    // PDF VALIDATION
    // ==========================================

    if (file.type !== "application/pdf") {
      setError(
        "Resume must be a PDF file."
      );

      return;
    }

    // ==========================================
    // SIZE VALIDATION
    // ==========================================

    if (file.size > 10 * 1024 * 1024) {
      setError(
        "Resume must be smaller than 10 MB."
      );

      return;
    }

    setResumeFile(file);
    setResumeName(file.name);

    setMessage("");
    setError("");
  };

  // ==========================================
  // UPLOAD PROFILE PHOTO
  // ==========================================

  const uploadProfilePhoto = async () => {
    if (!photoFile) {
      return profile.profile_image_url || "";
    }

    // ==========================================
    // FILE EXTENSION
    // ==========================================

    const extension =
      photoFile.name
        .split(".")
        .pop()
        ?.toLowerCase() || "jpg";

    // ==========================================
    // UNIQUE FILE NAME
    // ==========================================

    const filePath =
      `profile-${Date.now()}.${extension}`;

    // ==========================================
    // UPLOAD PHOTO
    // ==========================================

    const { error: uploadError } =
      await supabase.storage
        .from("profile-images")
        .upload(
          filePath,
          photoFile,
          {
            upsert: false,
            contentType: photoFile.type,
          }
        );

    if (uploadError) {
      throw new Error(
        `Photo upload failed: ${uploadError.message}`
      );
    }

    // ==========================================
    // GET PUBLIC URL
    // ==========================================

    const { data } =
      supabase.storage
        .from("profile-images")
        .getPublicUrl(filePath);

    return data.publicUrl;
  };

  // ==========================================
  // UPLOAD RESUME
  // ==========================================

  const uploadResume = async () => {
    if (!resumeFile) {
      return profile.resume_url || "";
    }

    // ==========================================
    // UNIQUE FILE NAME
    // ==========================================

    const filePath =
      `resume-${Date.now()}.pdf`;

    // ==========================================
    // UPLOAD RESUME
    // ==========================================

    const { error: uploadError } =
      await supabase.storage
        .from("resumes")
        .upload(
          filePath,
          resumeFile,
          {
            upsert: false,
            contentType: "application/pdf",
          }
        );

    if (uploadError) {
      throw new Error(
        `Resume upload failed: ${uploadError.message}`
      );
    }

    // ==========================================
    // GET PUBLIC URL
    // ==========================================

    const { data } =
      supabase.storage
        .from("resumes")
        .getPublicUrl(filePath);

    return data.publicUrl;
  };

  // ==========================================
  // SAVE PROFILE
  // ==========================================

  const handleSave = async (event) => {
    event.preventDefault();

    if (!profile) {
      return;
    }

    try {
      setSaving(true);
      setMessage("");
      setError("");

      // ==========================================
      // UPLOAD PHOTO
      // ==========================================

      const profileImageUrl =
        await uploadProfilePhoto();

      // ==========================================
      // UPLOAD RESUME
      // ==========================================

      const resumeUrl =
        await uploadResume();

      // ==========================================
      // UPDATE DATABASE
      // ==========================================

      const { data, error: updateError } =
        await supabase
          .from("site_settings")
          .update({
            // ==========================================
            // BASIC INFORMATION
            // ==========================================

            full_name:
              profile.full_name,

            role:
              profile.role,

            bio:
              profile.bio,

            location:
              profile.location,

            availability:
              profile.availability,

            // ==========================================
            // SOCIAL LINKS
            // ==========================================

            github_url:
              profile.github_url,

            linkedin_url:
              profile.linkedin_url,

            instagram_url:
              profile.instagram_url,

              x_url: profile.x_url,

            // ==========================================
            // WHATSAPP NUMBER
            // ==========================================

            whatsapp_number:
              profile.whatsapp_number,

            // ==========================================
            // EMAIL
            // ==========================================

            email:
              profile.email,

            // ==========================================
            // PROFILE PHOTO
            // ==========================================

            profile_image_url:
              profileImageUrl,

            // ==========================================
            // RESUME
            // ==========================================

            resume_url:
              resumeUrl,
          })
          .eq("id", profile.id)
          .select()
          .single();

      if (updateError) {
        throw new Error(
          `Profile save failed: ${updateError.message}`
        );
      }

      // ==========================================
      // UPDATE LOCAL PROFILE
      // ==========================================

      setProfile(data);

      setPhotoFile(null);
      setResumeFile(null);

      // ==========================================
      // UPDATE PHOTO PREVIEW
      // ==========================================

      setPhotoPreview(
        data.profile_image_url || ""
      );

      // ==========================================
      // UPDATE RESUME NAME
      // ==========================================

      if (data.resume_url) {
        const parts =
          data.resume_url.split("/");

        setResumeName(
          decodeURIComponent(
            parts[parts.length - 1]
          )
        );
      } else {
        setResumeName("");
      }

      // ==========================================
      // SUCCESS MESSAGE
      // ==========================================

      setMessage(
        "Profile, photo and resume saved successfully."
      );
    } catch (saveError) {
      console.error(
        "Profile save error:",
        saveError
      );

      setError(
        saveError.message
      );
    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="admin-manager-loading">
        Loading profile...
      </div>
    );
  }

  // ==========================================
  // PROFILE ERROR
  // ==========================================

  if (!profile) {
    return (
      <div className="admin-manager-error">
        {error || "Profile data not found."}
      </div>
    );
  }

  // ==========================================
  // UI
  // ==========================================

  return (
    <section className="admin-manager">

      {/* ==========================================
          HEADER
      ========================================== */}

      <div className="admin-manager-header">
        <div>
          <p>
            PORTFOLIO CONTENT
          </p>

          <h1>
            Profile Manager
          </h1>

          <span>
            Manage your profile, photo, resume and
            social information.
          </span>
        </div>
      </div>

      {/* ==========================================
          SUCCESS MESSAGE
      ========================================== */}

      {message && (
        <div className="admin-manager-success">
          ✓ {message}
        </div>
      )}

      {/* ==========================================
          ERROR MESSAGE
      ========================================== */}

      {error && (
        <div className="admin-manager-error">
          ! {error}
        </div>
      )}

      {/* ==========================================
          FORM
      ========================================== */}

      <form onSubmit={handleSave}>

        {/* ==========================================
            PROFILE PHOTO
        ========================================== */}

        <div className="admin-manager-card">

          <div className="admin-card-heading">
            <div>
              <p>
                IDENTITY
              </p>

              <h2>
                Profile Photo
              </h2>
            </div>
          </div>

          <div className="profile-upload-area">

            <div className="profile-image-preview">

              {photoPreview ? (
                <img
                  src={photoPreview}
                  alt="Profile"
                />
              ) : (
                <span>
                  SJ
                </span>
              )}

            </div>

            <div className="profile-upload-info">

              <h3>
                Your Profile Photo
              </h3>

              <p>
                Upload the photo that will appear
                throughout your public portfolio.
              </p>

              <label className="admin-upload-button">
                Choose Photo

                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handlePhotoChange}
                  hidden
                />
              </label>

            </div>

          </div>

        </div>

        {/* ==========================================
            BASIC INFORMATION
        ========================================== */}

        <div className="admin-manager-card">

          <div className="admin-card-heading">
            <div>
              <p>
                PERSONAL INFORMATION
              </p>

              <h2>
                Basic Details
              </h2>
            </div>
          </div>

          <div className="admin-form-grid">

            {/* ==========================================
                FULL NAME
            ========================================== */}

            <div className="admin-field">

              <label>
                FULL NAME
              </label>

              <input
                type="text"
                name="full_name"
                value={profile.full_name || ""}
                onChange={handleChange}
                placeholder="Your full name"
              />

            </div>

            {/* ==========================================
                ROLE
            ========================================== */}

            <div className="admin-field">

              <label>
                ROLE
              </label>

              <input
                type="text"
                name="role"
                value={profile.role || ""}
                onChange={handleChange}
                placeholder="Your role"
              />

            </div>

            {/* ==========================================
                LOCATION
            ========================================== */}

            <div className="admin-field">

              <label>
                LOCATION
              </label>

              <input
                type="text"
                name="location"
                value={profile.location || ""}
                onChange={handleChange}
                placeholder="India"
              />

            </div>

            {/* ==========================================
                AVAILABILITY
            ========================================== */}

            <div className="admin-field">

              <label>
                AVAILABILITY
              </label>

              <input
                type="text"
                name="availability"
                value={profile.availability || ""}
                onChange={handleChange}
                placeholder="Available for opportunities"
              />

            </div>

          </div>

          {/* ==========================================
              BIO
          ========================================== */}

          <div className="admin-field">

            <label>
              ABOUT / BIO
            </label>

            <textarea
              name="bio"
              rows="5"
              value={profile.bio || ""}
              onChange={handleChange}
              placeholder="Write something about yourself..."
            />

          </div>

        </div>

        {/* ==========================================
            SOCIAL LINKS
        ========================================== */}

        <div className="admin-manager-card">

          <div className="admin-card-heading">
            <div>
              <p>
                CONNECT
              </p>

              <h2>
                Social Links
              </h2>
            </div>
          </div>

          <div className="admin-form-grid">

            {/* ==========================================
                GITHUB
            ========================================== */}

            <div className="admin-field">

              <label>
                GITHUB
              </label>

              <input
                type="url"
                name="github_url"
                value={profile.github_url || ""}
                onChange={handleChange}
                placeholder="Enter your GitHub profile URL"
              />

            </div>

            {/* ==========================================
                LINKEDIN
            ========================================== */}

            <div className="admin-field">

              <label>
                LINKEDIN
              </label>

              <input
                type="url"
                name="linkedin_url"
                value={profile.linkedin_url || ""}
                onChange={handleChange}
                placeholder="Enter your LinkedIn profile URL"
              />

            </div>

            {/* ==========================================
                INSTAGRAM
            ========================================== */}

            <div className="admin-field">

              <label>
                INSTAGRAM
              </label>

              <input
                type="url"
                name="instagram_url"
                value={profile.instagram_url || ""}
                onChange={handleChange}
                placeholder="Enter your Instagram profile URL"
              />

            </div>
{/* ==========================================
    X (TWITTER) PROFILE
========================================== */}

<div className="admin-field">

  <label>
    X (TWITTER)
  </label>

  <input
    type="url"
    name="x_url"
    value={profile.x_url || ""}
    onChange={handleChange}
    placeholder="Enter your X profile URL"
  />

</div>
            {/* ==========================================
                WHATSAPP NUMBER
            ========================================== */}

            <div className="admin-field">

              <label htmlFor="whatsapp_number">
                WHATSAPP
              </label>

              <input
                id="whatsapp_number"
                type="text"
                name="whatsapp_number"
                value={
                  profile.whatsapp_number || ""
                }
                onChange={handleChange}
                placeholder="+91 7481012471"
                autoComplete="tel"
              />

            </div>

            {/* ==========================================
                EMAIL
            ========================================== */}

            <div className="admin-field">

              <label>
                EMAIL
              </label>

              <input
                type="email"
                name="email"
                value={profile.email || ""}
                onChange={handleChange}
                placeholder="Enter your email address"
              />

            </div>

          </div>

        </div>

        {/* ==========================================
            RESUME
        ========================================== */}

        <div className="admin-manager-card">

          <div className="admin-card-heading">
            <div>
              <p>
                DOCUMENT
              </p>

              <h2>
                Resume
              </h2>
            </div>
          </div>

          <div className="resume-upload-area">

            <div className="resume-icon">
              PDF
            </div>

            <div className="resume-upload-info">

              <h3>
                {resumeName ||
                  "No resume uploaded"}
              </h3>

              <p>
                Upload your latest resume in PDF
                format. Visitors will be able to
                download it from your portfolio.
              </p>

              <label className="admin-upload-button">
                Upload Resume

                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleResumeChange}
                  hidden
                />
              </label>

            </div>

          </div>

        </div>

        {/* ==========================================
            SAVE
        ========================================== */}

        <div className="admin-manager-actions">

          <button
            type="submit"
            className="admin-save-button"
            disabled={saving}
          >
            {saving
              ? "Saving..."
              : "Save Profile Changes"}
          </button>

        </div>

      </form>

    </section>
  );
}

// ==========================================
// EXPORT
// ==========================================

export default ProfileManager;
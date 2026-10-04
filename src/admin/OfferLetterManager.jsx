// ==========================================
// OFFER LETTER / DOCUMENT MANAGER
// ==========================================

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const BUCKET = "portfolio-assets";
const MAX_FILE_SIZE = 80 * 1024 * 1024;

// ==========================================
// OFFER LETTER MANAGER
// ==========================================

function OfferLetterManager() {
  const [items, setItems] = useState([]);

  const [form, setForm] = useState({
    title: "",
    company: "",
    issue_date: "",
    file_url: "",
    display_order: 0,
    visible: true,
  });

  const [file, setFile] = useState(null);
  const [editId, setEditId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  // ==========================================
  // LOAD DOCUMENTS
  // ==========================================

  const load = async () => {
    const { data, error } = await supabase
      .from("offer_letters")
      .select("*")
      .order("display_order");

    if (error) {
      setMessage(error.message);
    } else {
      setItems(data || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  // ==========================================
  // FILE SELECT
  // ==========================================

  const selectFile = (e) => {
    const selected = e.target.files?.[0];

    if (!selected) return;

    // ==========================================
    // BLOCK VIDEO FILES
    // ==========================================

    const isVideo =
      selected.type.startsWith("video/") ||
      /\.(mp4|mov|avi|mkv|webm|wmv|flv|m4v)$/i.test(
        selected.name
      );

    if (isVideo) {
      setMessage(
        "Video files are not allowed. Please select another file."
      );

      e.target.value = "";
      setFile(null);

      return;
    }

    // ==========================================
    // FILE SIZE
    // ==========================================

    if (selected.size > MAX_FILE_SIZE) {
      setMessage("File must be 80 MB or smaller.");

      e.target.value = "";
      setFile(null);

      return;
    }

    // ==========================================
    // ACCEPT FILE
    // ==========================================

    setFile(selected);

    setMessage(`Selected: ${selected.name}`);
  };

  // ==========================================
  // FORM CHANGE
  // ==========================================

  const change = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // ==========================================
  // SAVE
  // ==========================================

  const save = async (e) => {
    e.preventDefault();

    if (!form.title.trim() || !form.company.trim()) {
      setMessage(
        "Document title and company are required."
      );

      return;
    }

    // New document requires file
    if (!editId && !file) {
      setMessage("Please select a file.");

      return;
    }

    setSaving(true);
    setMessage("");

    try {
      let fileUrl = form.file_url;

      // ==========================================
      // UPLOAD FILE
      // ==========================================

      if (file) {
        const safeName = file.name.replace(
          /[^a-zA-Z0-9.-]/g,
          "_"
        );

        const path =
          `offer-letters/${Date.now()}-${safeName}`;

        const { error: uploadError } =
          await supabase.storage
            .from(BUCKET)
            .upload(path, file, {
              contentType:
                file.type || "application/octet-stream",
              upsert: false,
            });

        if (uploadError) {
          throw uploadError;
        }

        fileUrl = supabase.storage
          .from(BUCKET)
          .getPublicUrl(path)
          .data
          .publicUrl;
      }

      // ==========================================
      // DATABASE DATA
      // ==========================================

      const data = {
        title: form.title.trim(),
        company: form.company.trim(),
        issue_date: form.issue_date || null,
        file_url: fileUrl || null,
        display_order:
          Number(form.display_order) || 0,
        visible: form.visible,
      };

      // ==========================================
      // UPDATE
      // ==========================================

      if (editId) {
        const { error } = await supabase
          .from("offer_letters")
          .update(data)
          .eq("id", editId);

        if (error) {
          throw error;
        }

        setMessage(
          "Document updated successfully."
        );
      }

      // ==========================================
      // INSERT
      // ==========================================

      else {
        const { error } = await supabase
          .from("offer_letters")
          .insert(data);

        if (error) {
          throw error;
        }

        setMessage(
          "Document added successfully."
        );
      }

      reset();

      await load();

    } catch (error) {
      console.error(error);

      setMessage(
        error.message ||
          "File upload failed."
      );

    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // EDIT
  // ==========================================

  const edit = (item) => {
    setEditId(item.id);

    setForm({
      title: item.title || "",
      company: item.company || "",
      issue_date: item.issue_date || "",
      file_url: item.file_url || "",
      display_order:
        item.display_order || 0,
      visible: item.visible !== false,
    });

    setFile(null);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ==========================================
  // DELETE
  // ==========================================

  const remove = async (id) => {
    if (
      !window.confirm(
        "Delete this document?"
      )
    ) {
      return;
    }

    const { error } = await supabase
      .from("offer_letters")
      .delete()
      .eq("id", id);

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage(
      "Document deleted successfully."
    );

    await load();
  };

  // ==========================================
  // VISIBILITY
  // ==========================================

  const toggle = async (item) => {
    const { error } = await supabase
      .from("offer_letters")
      .update({
        visible: !item.visible,
      })
      .eq("id", item.id);

    if (error) {
      setMessage(error.message);
      return;
    }

    await load();
  };

  // ==========================================
  // RESET
  // ==========================================

  const reset = () => {
    setEditId(null);
    setFile(null);

    setForm({
      title: "",
      company: "",
      issue_date: "",
      file_url: "",
      display_order: 0,
      visible: true,
    });

    const input =
      document.getElementById(
        "offer-letter-file"
      );

    if (input) {
      input.value = "";
    }
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="admin-manager">
        Loading documents...
      </div>
    );
  }

  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="admin-manager">

      {/* ==========================================
          HEADER
      ========================================== */}

      <div className="admin-manager-header">

        <div>

          <h2>
            Offer Letters & Documents
          </h2>

          <p>
            Upload and manage professional
            documents displayed on your portfolio.
          </p>

        </div>

      </div>

      {/* ==========================================
          MESSAGE
      ========================================== */}

      {message && (
        <div className="admin-message">
          {message}
        </div>
      )}

      {/* ==========================================
          FORM
      ========================================== */}

      <div className="admin-manager-card">

        <h3>
          {editId
            ? "Edit Document"
            : "Add Document"}
        </h3>

        <form onSubmit={save}>

          <div className="admin-form-grid">

            {/* ==========================================
                TITLE
            ========================================== */}

            <div className="admin-field">

              <label>
                Document Title
              </label>

              <input
                name="title"
                value={form.title}
                onChange={change}
                placeholder="Internship Offer Letter"
              />

            </div>

            {/* ==========================================
                COMPANY
            ========================================== */}

            <div className="admin-field">

              <label>
                Company
              </label>

              <input
                name="company"
                value={form.company}
                onChange={change}
                placeholder="ABC Technologies"
              />

            </div>

            {/* ==========================================
                ISSUE DATE
            ========================================== */}

            <div className="admin-field">

              <label>
                Issue Date
              </label>

              <input
                type="date"
                name="issue_date"
                value={form.issue_date}
                onChange={change}
              />

            </div>

            {/* ==========================================
                DISPLAY ORDER
            ========================================== */}

            <div className="admin-field">

              <label>
                Display Order
              </label>

              <input
                type="number"
                name="display_order"
                value={form.display_order}
                onChange={change}
              />

            </div>

          </div>

          {/* ==========================================
              FILE UPLOAD
          ========================================== */}

          <div className="admin-field">

            <label>
              Document File
            </label>

            <input
              id="offer-letter-file"
              type="file"
              onChange={selectFile}
            />

            <small>
              Any file type except video • Maximum 80 MB
            </small>

            {file && (
              <p>
                📎 {file.name}
              </p>
            )}

            {!file && form.file_url && (
              <a
                href={form.file_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                View current file
              </a>
            )}

          </div>

          {/* ==========================================
              VISIBILITY
          ========================================== */}

          <label className="admin-checkbox-field">

            <input
              type="checkbox"
              name="visible"
              checked={form.visible}
              onChange={change}
            />

            Show on website

          </label>

          {/* ==========================================
              ACTIONS
          ========================================== */}

          <div className="admin-manager-actions">

            <button
              type="submit"
              className="admin-save-button"
              disabled={saving}
            >
              {saving
                ? "Uploading..."
                : editId
                ? "Update Document"
                : "Add Document"}
            </button>

            {editId && (
              <button
                type="button"
                onClick={reset}
              >
                Cancel
              </button>
            )}

          </div>

        </form>

      </div>

      {/* ==========================================
          DOCUMENT LIST
      ========================================== */}

      <div className="admin-manager-card">

        <h3>
          Your Documents
        </h3>

        {items.length === 0 ? (

          <p>
            No documents added yet.
          </p>

        ) : (

          items.map((item) => (

            <div
              className="admin-content-item"
              key={item.id}
            >

              <div className="admin-content-info">

                <h4>
                  {item.title}
                </h4>

                <p>
                  {item.company}
                </p>

                <small>
                  {item.issue_date ||
                    "No date"}{" "}
                  •{" "}
                  {item.visible
                    ? "Visible"
                    : "Hidden"}
                </small>

              </div>

              <div className="admin-content-actions">

                <button
                  type="button"
                  onClick={() =>
                    toggle(item)
                  }
                >
                  {item.visible
                    ? "Hide"
                    : "Show"}
                </button>

                <button
                  type="button"
                  onClick={() =>
                    edit(item)
                  }
                >
                  Edit
                </button>

                <button
                  type="button"
                  onClick={() =>
                    remove(item.id)
                  }
                  className="admin-delete-button"
                >
                  Delete
                </button>

              </div>

            </div>

          ))

        )}

      </div>

    </div>
  );
}

export default OfferLetterManager;
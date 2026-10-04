// ==========================================
// CERTIFICATION MANAGER
// ==========================================

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const ADMIN_ID = "78ad78d2-1a90-413b-9473-2fd0a4ed6dc3";
const BUCKET = "portfolio-assets";

function CertificationManager() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({
    title: "",
    issuer: "",
    issue_date: "",
    certificate_url: "",
    image_url: "",
    display_order: 0,
    visible: true,
  });
  const [file, setFile] = useState(null);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  // ==========================================
  // LOAD
  // ==========================================

  const load = async () => {
    const { data, error } = await supabase
      .from("certifications")
      .select("*")
      .order("display_order");

    if (error) setMessage(error.message);
    else setItems(data || []);

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

    if (
      selected.type !== "application/pdf" &&
      !selected.name.toLowerCase().endsWith(".pdf")
    ) {
      setMessage("Only PDF files are allowed.");
      e.target.value = "";
      return;
    }

    if (selected.size > 100 * 1024 * 1024) {
      setMessage("PDF must be 100 MB or smaller.");
      e.target.value = "";
      return;
    }

    setFile(selected);
    setMessage(`Selected: ${selected.name}`);
  };

  // ==========================================
  // SAVE
  // ==========================================

  const save = async (e) => {
    e.preventDefault();

    if (!form.title.trim() || !form.issuer.trim()) {
      setMessage("Title and issuer are required.");
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      let pdfUrl = form.certificate_url;

      // ==========================================
      // UPLOAD PDF
      // ==========================================

      if (file) {
        const path = `certificates/${Date.now()}-${file.name.replace(
          /[^a-zA-Z0-9.-]/g,
          "_"
        )}`;

        const { error } = await supabase.storage
          .from(BUCKET)
          .upload(path, file, {
            contentType: "application/pdf",
            upsert: false,
          });

        if (error) throw error;

        pdfUrl = supabase.storage
          .from(BUCKET)
          .getPublicUrl(path).data.publicUrl;
      }

      // ==========================================
      // DATABASE DATA
      // ==========================================

      const data = {
        title: form.title.trim(),
        issuer: form.issuer.trim(),
        issue_date: form.issue_date || null,
        certificate_url: pdfUrl || null,
        image_url: form.image_url.trim() || null,
        display_order: Number(form.display_order) || 0,
        visible: form.visible,
      };

      const query = editId
        ? supabase.from("certifications").update(data).eq("id", editId)
        : supabase.from("certifications").insert(data);

      const { error } = await query;

      if (error) throw error;

      setMessage(
        editId
          ? "Certification updated successfully."
          : "Certification added successfully."
      );

      reset();
      load();
    } catch (error) {
      setMessage(error.message || "Upload failed.");
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
      issuer: item.issuer || "",
      issue_date: item.issue_date || "",
      certificate_url: item.certificate_url || "",
      image_url: item.image_url || "",
      display_order: item.display_order || 0,
      visible: item.visible !== false,
    });

    setFile(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ==========================================
  // DELETE
  // ==========================================

  const remove = async (id) => {
    if (!window.confirm("Delete this certification?")) return;

    const { error } = await supabase
      .from("certifications")
      .delete()
      .eq("id", id);

    if (error) setMessage(error.message);
    else {
      setMessage("Certification deleted.");
      load();
    }
  };

  // ==========================================
  // VISIBILITY
  // ==========================================

  const toggle = async (item) => {
    const { error } = await supabase
      .from("certifications")
      .update({ visible: !item.visible })
      .eq("id", item.id);

    if (error) setMessage(error.message);
    else load();
  };

  // ==========================================
  // RESET
  // ==========================================

  const reset = () => {
    setEditId(null);
    setFile(null);

    setForm({
      title: "",
      issuer: "",
      issue_date: "",
      certificate_url: "",
      image_url: "",
      display_order: 0,
      visible: true,
    });

    const input = document.getElementById("certificate-pdf");

    if (input) input.value = "";
  };

  // ==========================================
  // FORM CHANGE
  // ==========================================

  const change = (e) => {
    const { name, value, type, checked } = e.target;

    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  if (loading) return <div>Loading certifications...</div>;

  return (
    <div className="admin-manager">

      <div className="admin-manager-header">
        <div>
          <h2>Certifications</h2>
          <p>Manage your certificate PDFs.</p>
        </div>
      </div>

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
          {editId ? "Edit Certification" : "Add Certification"}
        </h3>

        <form onSubmit={save}>

          <div className="admin-form-grid">

            <div className="admin-field">
              <label>Certificate Title</label>

              <input
                name="title"
                value={form.title}
                onChange={change}
                placeholder="Python Certificate"
              />
            </div>

            <div className="admin-field">
              <label>Issuer</label>

              <input
                name="issuer"
                value={form.issuer}
                onChange={change}
                placeholder="Coursera"
              />
            </div>

            <div className="admin-field">
              <label>Issue Date</label>

              <input
                type="date"
                name="issue_date"
                value={form.issue_date}
                onChange={change}
              />
            </div>

            <div className="admin-field">
              <label>Display Order</label>

              <input
                type="number"
                name="display_order"
                value={form.display_order}
                onChange={change}
              />
            </div>

          </div>

          {/* ==========================================
              PDF
          ========================================== */}

          <div className="admin-field">

            <label>Certificate PDF</label>

            <input
              id="certificate-pdf"
              type="file"
              accept=".pdf,application/pdf"
              onChange={selectFile}
            />

            <small>
              PDF only • Maximum 100 MB
            </small>

            {file && (
              <p>
                📄 {file.name}
              </p>
            )}

            {!file && form.certificate_url && (
              <a
                href={form.certificate_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                View current PDF
              </a>
            )}

          </div>

          {/* ==========================================
              OPTIONAL IMAGE
          ========================================== */}

          <div className="admin-field">

            <label>Preview Image URL</label>

            <input
              type="url"
              name="image_url"
              value={form.image_url}
              onChange={change}
              placeholder="https://..."
            />

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
              BUTTONS
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
                ? "Update"
                : "Add Certification"}
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
          LIST
      ========================================== */}

      <div className="admin-manager-card">

        <h3>Your Certifications</h3>

        {items.map((item) => (

          <div
            className="admin-content-item"
            key={item.id}
          >

            <div className="admin-content-info">

              <h4>
                {item.title}
              </h4>

              <p>
                {item.issuer}
              </p>

              <small>
                {item.visible ? "Visible" : "Hidden"}
              </small>

            </div>

            <div className="admin-content-actions">

              <button
                type="button"
                onClick={() => toggle(item)}
              >
                {item.visible ? "Hide" : "Show"}
              </button>

              <button
                type="button"
                onClick={() => edit(item)}
              >
                Edit
              </button>

              <button
                type="button"
                onClick={() => remove(item.id)}
                className="admin-delete-button"
              >
                Delete
              </button>

            </div>

          </div>

        ))}

      </div>

    </div>
  );
}

export default CertificationManager;
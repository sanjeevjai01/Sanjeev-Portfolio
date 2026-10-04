// ==========================================
// GENERIC CONTENT MANAGER
// ==========================================

import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";

// ==========================================
// EMPTY FORM GENERATOR
// ==========================================

function createEmptyForm(fields) {
  const data = {};

  fields.forEach((field) => {
    if (field.type === "checkbox") {
      data[field.name] = true;
    } else {
      // Keep all non-checkbox fields completely blank
      data[field.name] = "";
    }
  });

  return data;
}

// ==========================================
// CONTENT MANAGER
// ==========================================

function ContentManager({
  table,
  title,
  description,
  fields = [],
}) {
  // ==========================================
  // STATE
  // ==========================================

  const emptyForm = useMemo(
    () => createEmptyForm(fields),
    [fields]
  );

  const [items, setItems] = useState([]);
  const [formData, setFormData] = useState(emptyForm);

  const [editingId, setEditingId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // ==========================================
  // LOAD ITEMS
  // ==========================================

  const loadItems = async () => {
    try {
      setLoading(true);
      setError("");

      const { data, error: fetchError } = await supabase
        .from(table)
        .select("*")
        .order("display_order", {
          ascending: true,
        })
        .order("created_at", {
          ascending: false,
        });

      if (fetchError) {
        throw fetchError;
      }

      setItems(data || []);
    } catch (err) {
      console.error(`Failed to load ${table}:`, err);

      setError(
        err?.message ||
          `Unable to load ${title}.`
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // INITIAL LOAD
  // ==========================================

  useEffect(() => {
    loadItems();
  }, [table]);

  // ==========================================
  // RESET FORM
  // ==========================================

  const resetForm = () => {
    setFormData(
      createEmptyForm(fields)
    );

    setEditingId(null);
    setMessage("");
    setError("");
  };

  // ==========================================
  // HANDLE INPUT CHANGE
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
          : type === "number"
          ? value === ""
            ? ""
            : Number(value)
          : value,
    }));
  };

  // ==========================================
  // EDIT ITEM
  // ==========================================

  const handleEdit = (item) => {
    const updatedForm = {};

    fields.forEach((field) => {
      // ----------------------------------------
      // CHECKBOX
      // ----------------------------------------

      if (field.type === "checkbox") {
        updatedForm[field.name] =
          Boolean(item[field.name]);
      }

      // ----------------------------------------
      // NUMBER
      // ----------------------------------------

      else if (field.type === "number") {
        updatedForm[field.name] =
          item[field.name] ??
          "";
      }

      // ----------------------------------------
      // OTHER FIELDS
      // ----------------------------------------

      else {
        updatedForm[field.name] =
          item[field.name] ??
          "";
      }
    });

    setFormData(updatedForm);
    setEditingId(item.id);

    setMessage("");
    setError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ==========================================
  // SAVE ITEM
  // ==========================================

  const handleSave = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setMessage("");
      setError("");

      // ----------------------------------------
      // CLEAN FORM DATA
      // ----------------------------------------

      const payload = {};

      fields.forEach((field) => {
        let value =
          formData[field.name];

        // --------------------------------------
        // TEXT / TEXTAREA / URL
        // --------------------------------------

        if (
          field.type === "text" ||
          field.type === "textarea" ||
          field.type === "url"
        ) {
          value =
            typeof value === "string"
              ? value.trim()
              : value;

          // IMPORTANT:
          // Empty field becomes NULL.
          // This clears the previous database value
          // when editing an existing item.

          payload[field.name] =
            value === ""
              ? null
              : value;
        }

        // --------------------------------------
        // NUMBER
        // --------------------------------------

        else if (
          field.type === "number"
        ) {
          // IMPORTANT:
          // Empty number field becomes NULL,
          // not 0.

          payload[field.name] =
            value === "" ||
            value === null ||
            value === undefined
              ? null
              : Number(value);
        }

        // --------------------------------------
        // CHECKBOX
        // --------------------------------------

        else if (
          field.type === "checkbox"
        ) {
          payload[field.name] =
            Boolean(value);
        }

        // --------------------------------------
        // OTHER FIELD TYPES
        // --------------------------------------

        else {
          payload[field.name] =
            value === ""
              ? null
              : value;
        }
      });

      // ----------------------------------------
      // INSERT
      // ----------------------------------------

      if (!editingId) {
        const {
          data,
          error: insertError,
        } = await supabase
          .from(table)
          .insert([payload])
          .select()
          .single();

        if (insertError) {
          throw insertError;
        }

        setItems((previous) => [
          ...previous,
          data,
        ]);

        setMessage(
          `${title.slice(
            0,
            -1
          ) || title} added successfully.`
        );
      }

      // ----------------------------------------
      // UPDATE
      // ----------------------------------------

      else {
        const {
          data,
          error: updateError,
        } = await supabase
          .from(table)
          .update(payload)
          .eq("id", editingId)
          .select()
          .single();

        if (updateError) {
          throw updateError;
        }

        setItems((previous) =>
          previous.map((item) =>
            item.id === editingId
              ? data
              : item
          )
        );

        setMessage(
          `${title.slice(
            0,
            -1
          ) || title} updated successfully.`
        );
      }

      // ----------------------------------------
      // RESET FORM
      // ----------------------------------------

      setFormData(
        createEmptyForm(fields)
      );

      setEditingId(null);

      // ----------------------------------------
      // REFRESH
      // ----------------------------------------

      await loadItems();

    } catch (err) {
      console.error(
        `Failed to save ${table}:`,
        err
      );

      setError(
        err?.message ||
          `Unable to save ${title}.`
      );
    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // DELETE ITEM
  // ==========================================

  const handleDelete = async (id) => {
    const confirmed =
      window.confirm(
        "Are you sure you want to delete this item?\n\nThis action cannot be undone."
      );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setMessage("");

      const {
        error: deleteError,
      } = await supabase
        .from(table)
        .delete()
        .eq("id", id);

      if (deleteError) {
        throw deleteError;
      }

      setItems((previous) =>
        previous.filter(
          (item) => item.id !== id
        )
      );

      if (editingId === id) {
        resetForm();
      }

      setMessage(
        "Item deleted successfully."
      );

    } catch (err) {
      console.error(
        `Failed to delete ${table}:`,
        err
      );

      setError(
        err?.message ||
          "Unable to delete item."
      );
    }
  };

  // ==========================================
  // TOGGLE VISIBILITY
  // ==========================================

  const handleToggleVisibility = async (
    item
  ) => {
    try {
      setError("");
      setMessage("");

      const newVisibility =
        !Boolean(item.visible);

      const {
        data,
        error: updateError,
      } = await supabase
        .from(table)
        .update({
          visible: newVisibility,
        })
        .eq("id", item.id)
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }

      setItems((previous) =>
        previous.map((current) =>
          current.id === item.id
            ? data
            : current
        )
      );

      setMessage(
        newVisibility
          ? "Item is now visible on the website."
          : "Item is now hidden from the website."
      );

    } catch (err) {
      console.error(
        "Visibility update failed:",
        err
      );

      setError(
        err?.message ||
          "Unable to change visibility."
      );
    }
  };

  // ==========================================
  // MOVE ITEM
  // ==========================================

  const moveItem = async (
    index,
    direction
  ) => {
    const targetIndex =
      direction === "up"
        ? index - 1
        : index + 1;

    if (
      targetIndex < 0 ||
      targetIndex >= items.length
    ) {
      return;
    }

    const currentItem =
      items[index];

    const targetItem =
      items[targetIndex];

    try {
      setError("");
      setMessage("");

      const currentOrder =
        currentItem.display_order ??
        index;

      const targetOrder =
        targetItem.display_order ??
        targetIndex;

      // ----------------------------------------
      // UPDATE FIRST ITEM
      // ----------------------------------------

      const {
        error: firstError,
      } = await supabase
        .from(table)
        .update({
          display_order:
            targetOrder,
        })
        .eq("id", currentItem.id);

      if (firstError) {
        throw firstError;
      }

      // ----------------------------------------
      // UPDATE SECOND ITEM
      // ----------------------------------------

      const {
        error: secondError,
      } = await supabase
        .from(table)
        .update({
          display_order:
            currentOrder,
        })
        .eq("id", targetItem.id);

      if (secondError) {
        throw secondError;
      }

      // ----------------------------------------
      // REFRESH ORDER
      // ----------------------------------------

      await loadItems();

      setMessage(
        "Display order updated."
      );

    } catch (err) {
      console.error(
        "Ordering update failed:",
        err
      );

      setError(
        err?.message ||
          "Unable to change display order."
      );
    }
  };

  // ==========================================
  // GET ITEM TITLE
  // ==========================================

  const getItemTitle = (item) => {
    return (
      item.title ||
      item.name ||
      item.job_title ||
      item.degree ||
      item.company ||
      "Untitled Item"
    );
  };

  // ==========================================
  // GET SECONDARY TEXT
  // ==========================================

  const getItemSubtitle = (item) => {
    return (
      item.description ||
      item.category ||
      item.issuer ||
      item.institution ||
      item.location ||
      ""
    );
  };

  // ==========================================
  // LOADING STATE
  // ==========================================

  if (loading) {
    return (
      <div className="admin-manager">
        <div className="admin-manager-card">

          <div className="admin-loading-state">

            <div className="admin-route-spinner"></div>

            <h3>
              Loading {title}...
            </h3>

            <p>
              Please wait while your content
              is being loaded.
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
            CONTENT MANAGEMENT
          </p>

          <h1>
            {title}
          </h1>

          <p>
            {description}
          </p>

        </div>

        <div className="admin-manager-count">
          {items.length}{" "}
          {items.length === 1
            ? "Item"
            : "Items"}
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
          FORM
      ======================================== */}

      <div className="admin-manager-card">

        <div className="admin-manager-card-header">

          <div>

            <p className="admin-page-label">
              {editingId
                ? "EDIT ITEM"
                : "ADD NEW ITEM"}
            </p>

            <h2>
              {editingId
                ? `Edit ${title}`
                : `Add ${title}`}
            </h2>

          </div>

          {editingId && (
            <button
              type="button"
              className="admin-cancel-button"
              onClick={resetForm}
            >
              Cancel Edit
            </button>
          )}

        </div>

        <form
          className="admin-content-form"
          onSubmit={handleSave}
        >

          <div className="admin-form-grid">

            {fields.map((field) => {

              // --------------------------------
              // CHECKBOX
              // --------------------------------

              if (
                field.type === "checkbox"
              ) {
                return (
                  <label
                    key={field.name}
                    className="admin-checkbox-field"
                  >

                    <input
                      type="checkbox"
                      name={field.name}
                      checked={Boolean(
                        formData[
                          field.name
                        ]
                      )}
                      onChange={
                        handleChange
                      }
                    />

                    <span>
                      {field.label}
                    </span>

                  </label>
                );
              }

              // --------------------------------
              // TEXTAREA
              // --------------------------------

              if (
                field.type === "textarea"
              ) {
                return (
                  <div
                    key={field.name}
                    className="admin-field admin-field-full"
                  >

                    <label>
                      {field.label}
                    </label>

                    <textarea
                      name={field.name}
                      value={
                        formData[
                          field.name
                        ] ?? ""
                      }
                      onChange={
                        handleChange
                      }
                      placeholder={
                        field.placeholder ||
                        ""
                      }
                      rows={
                        field.rows || 5
                      }
                    />

                  </div>
                );
              }

              // --------------------------------
              // NORMAL INPUT
              // --------------------------------

              return (
                <div
                  key={field.name}
                  className={`admin-field ${
                    field.fullWidth
                      ? "admin-field-full"
                      : ""
                  }`}
                >

                  <label>
                    {field.label}
                  </label>

                  <input
                    type={
                      field.type ||
                      "text"
                    }
                    name={field.name}
                    value={
                      formData[
                        field.name
                      ] ?? ""
                    }
                    onChange={
                      handleChange
                    }
                    placeholder={
                      field.placeholder ||
                      ""
                    }
                    min={
                      field.min
                    }
                    max={
                      field.max
                    }
                    step={
                      field.step
                    }
                  />

                </div>
              );
            })}

          </div>

          {/* ======================================
              FORM ACTIONS
          ====================================== */}

          <div className="admin-form-actions">

            <button
              type="submit"
              className="admin-save-button"
              disabled={saving}
            >

              {saving ? (
                <>
                  <span className="admin-button-spinner"></span>
                  Saving...
                </>
              ) : (
                <>
                  {editingId
                    ? "✓ Update Item"
                    : "+ Add Item"}
                </>
              )}

            </button>

            {editingId && (
              <button
                type="button"
                className="admin-cancel-button"
                onClick={resetForm}
                disabled={saving}
              >
                Cancel
              </button>
            )}

          </div>

        </form>

      </div>

      {/* ========================================
          ITEMS LIST
      ======================================== */}

      <div className="admin-manager-card">

        <div className="admin-manager-card-header">

          <div>

            <p className="admin-page-label">
              PUBLISHED CONTENT
            </p>

            <h2>
              Manage {title}
            </h2>

          </div>

          <span className="admin-list-hint">
            Use ↑ ↓ to change order
          </span>

        </div>

        {items.length === 0 ? (

          // ------------------------------------
          // EMPTY STATE
          // ------------------------------------

          <div className="admin-empty-state">

            <div className="admin-empty-icon">
              +
            </div>

            <h3>
              No {title.toLowerCase()} yet
            </h3>

            <p>
              Add your first item using
              the form above.
            </p>

          </div>

        ) : (

          // ------------------------------------
          // ITEMS
          // ------------------------------------

          <div className="admin-items-list">

            {items.map(
              (item, index) => (

                <div
                  key={item.id}
                  className={`admin-content-item ${
                    item.visible
                      ? ""
                      : "hidden-item"
                  }`}
                >

                  {/* ------------------------------
                      ITEM INFO
                  ------------------------------ */}

                  <div className="admin-content-item-info">

                    <div className="admin-item-order">
                      {index + 1}
                    </div>

                    <div>

                      <h3>
                        {getItemTitle(
                          item
                        )}
                      </h3>

                      {getItemSubtitle(
                        item
                      ) && (
                        <p>
                          {getItemSubtitle(
                            item
                          )}
                        </p>
                      )}

                      <span
                        className={`admin-visibility-badge ${
                          item.visible
                            ? "visible"
                            : "hidden"
                        }`}
                      >
                        {item.visible
                          ? "● Visible"
                          : "○ Hidden"}
                      </span>

                    </div>

                  </div>

                  {/* ------------------------------
                      ITEM ACTIONS
                  ------------------------------ */}

                  <div className="admin-content-item-actions">

                    <button
                      type="button"
                      title="Move up"
                      onClick={() =>
                        moveItem(
                          index,
                          "up"
                        )
                      }
                      disabled={
                        index === 0
                      }
                    >
                      ↑
                    </button>

                    <button
                      type="button"
                      title="Move down"
                      onClick={() =>
                        moveItem(
                          index,
                          "down"
                        )
                      }
                      disabled={
                        index ===
                        items.length - 1
                      }
                    >
                      ↓
                    </button>

                    <button
                      type="button"
                      className="admin-edit-action"
                      onClick={() =>
                        handleEdit(item)
                      }
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      className="admin-visibility-action"
                      onClick={() =>
                        handleToggleVisibility(
                          item
                        )
                      }
                    >
                      {item.visible
                        ? "Hide"
                        : "Show"}
                    </button>

                    <button
                      type="button"
                      className="admin-delete-action"
                      onClick={() =>
                        handleDelete(
                          item.id
                        )
                      }
                    >
                      Delete
                    </button>

                  </div>

                </div>
              )
            )}

          </div>
        )}

      </div>

    </div>
  );
}

export default ContentManager;
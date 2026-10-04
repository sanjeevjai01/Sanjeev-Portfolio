// ==========================================
// EDUCATION MANAGER
// ==========================================

import React from "react";
import ContentManager from "./ContentManager";

// ==========================================
// EDUCATION FIELDS
// ==========================================

const educationFields = [
  {
    name: "degree",
    label: "Degree / Course",
    type: "text",
    placeholder: "e.g. Bachelor of Computer Application (BCA)",
  },

  {
    name: "institution",
    label: "Institution",
    type: "text",
    placeholder: "e.g. Microtek College",
  },

  {
    name: "location",
    label: "Location",
    type: "text",
    placeholder: "e.g. Varanasi, India",
  },

  {
    name: "duration",
    label: "Duration",
    type: "text",
    placeholder: "e.g. 2022 - 2026",
  },

  {
    name: "grade",
    label: "Grade / CGPA",
    type: "text",
    placeholder: "",
  },

  {
    name: "description",
    label: "Description",
    type: "textarea",
    placeholder: "Add details about your education...",
    rows: 4,
  },

  {
    name: "display_order",
    label: "Display Order",
    type: "number",
    placeholder: "",
  },

  {
    name: "visible",
    label: "Show this education on website",
    type: "checkbox",
  },
];

// ==========================================
// EDUCATION MANAGER
// ==========================================

function EducationManager() {
  return (
    <ContentManager
      table="education"
      title="Education"
      description="Manage your academic qualifications and education history."
      fields={educationFields}
    />
  );
}

export default EducationManager;
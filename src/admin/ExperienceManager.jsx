// ==========================================
// EXPERIENCE MANAGER
// ==========================================

import React from "react";
import ContentManager from "./ContentManager";

// ==========================================
// EXPERIENCE FIELDS
// ==========================================

const experienceFields = [
  {
    name: "job_title",
    label: "Job Title",
    type: "text",
    placeholder: "e.g. Customer Service Executive",
  },
  {
    name: "company",
    label: "Company",
    type: "text",
    placeholder: "e.g. ABC Company",
  },
  {
    name: "location",
    label: "Location",
    type: "text",
    placeholder: "e.g. Noida, India",
  },
  {
    name: "start_date",
    label: "Start Date",
    type: "date",
  },
  {
    name: "end_date",
    label: "End Date",
    type: "date",
  },
  {
    name: "description",
    label: "Description",
    type: "textarea",
    placeholder: "Describe your role and responsibilities...",
    rows: 5,
  },
  {
    name: "display_order",
    label: "Display Order",
    type: "number",
    placeholder: "0",
  },
  {
    name: "visible",
    label: "Show this experience on website",
    type: "checkbox",
  },
];

// ==========================================
// EXPERIENCE MANAGER
// ==========================================

function ExperienceManager() {
  return (
    <ContentManager
      table="experience"
      title="Experience"
      description="Manage your work experience, internships and professional roles."
      fields={experienceFields}
    />
  );
}

export default ExperienceManager;
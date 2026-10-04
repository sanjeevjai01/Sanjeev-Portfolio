// ==========================================
// SKILL MANAGER
// ==========================================

import React from "react";
import ContentManager from "./ContentManager";

// ==========================================
// SKILL FIELDS
// ==========================================

const skillFields = [
  {
    name: "name",
    label: "Skill Name",
    type: "text",
    placeholder: "e.g. SQL",
  },
  {
    name: "category",
    label: "Category",
    type: "text",
    placeholder: "e.g. Database",
  },
  {
    name: "icon_url",
    label: "Icon URL",
    type: "url",
    placeholder: "https://...",
  },
  {
    name: "display_order",
    label: "Display Order",
    type: "number",
    placeholder: "0",
  },
  {
    name: "visible",
    label: "Show this skill on website",
    type: "checkbox",
  },
];

// ==========================================
// SKILL MANAGER
// ==========================================

function SkillManager() {
  return (
    <ContentManager
      table="skills"
      title="Skills"
      description="Manage the technical and professional skills displayed on your portfolio."
      fields={skillFields}
    />
  );
}

export default SkillManager;
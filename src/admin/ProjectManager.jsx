// ==========================================
// PROJECT MANAGER
// ==========================================

import React from "react";
import ContentManager from "./ContentManager";

// ==========================================
// PROJECT FIELDS
// ==========================================

const projectFields = [
  {
    name: "title",
    label: "Project Title",
    type: "text",
    placeholder: "e.g. Weather App",
  },
  {
    name: "description",
    label: "Project Description",
    type: "textarea",
    placeholder: "Describe your project...",
    rows: 5,
  },
  {
    name: "image_url",
    label: "Project Image URL",
    type: "url",
    placeholder: "https://...",
  },
  {
    name: "technologies",
    label: "Technologies",
    type: "text",
    placeholder: "Python, Flask, HTML, CSS",
  },
  {
    name: "github_url",
    label: "GitHub URL",
    type: "url",
    placeholder: "https://github.com/...",
  },
  {
    name: "live_url",
    label: "Live Demo URL",
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
    label: "Show this project on website",
    type: "checkbox",
  },
];

// ==========================================
// PROJECT MANAGER
// ==========================================

function ProjectManager() {
  return (
    <ContentManager
      table="projects"
      title="Projects"
      description="Add, edit and manage the projects displayed on your portfolio."
      fields={projectFields}
    />
  );
}

export default ProjectManager;
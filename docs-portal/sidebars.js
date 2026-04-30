// @ts-check

/** @type {import("@docusaurus/plugin-content-docs").SidebarsConfig} */
const sidebars = {
  docs: [
    {
      type: "doc",
      id: "index",
      label: "Overview"
    },
    {
      type: "category",
      label: "Product Whitepaper",
      collapsed: false,
      items: [
        {
          type: "doc",
          id: "product-whitepaper",
          label: "Product and Services"
        }
      ]
    },
    {
      type: "category",
      label: "Technical Documentation",
      collapsed: false,
      items: [
        {
          type: "doc",
          id: "technical-documentation",
          label: "Overview"
        },
        {
          type: "doc",
          id: "technical/authentication",
          label: "Authentication"
        },
        {
          type: "doc",
          id: "technical/frontend-integration",
          label: "Frontend Integration"
        },
        {
          type: "doc",
          id: "technical/backend-api-reference",
          label: "Backend API Reference"
        },
        {
          type: "doc",
          id: "technical/render-options",
          label: "Render Options"
        },
        {
          type: "doc",
          id: "technical/full-integration-example",
          label: "Full Integration Example"
        },
        {
          type: "doc",
          id: "technical/error-codes",
          label: "Error Codes"
        },
        {
          type: "doc",
          id: "technical/technical-support",
          label: "Technical Support"
        }
      ]
    }
  ]
};

module.exports = sidebars;

// @ts-check

/** @type {import("@docusaurus/plugin-content-docs").SidebarsConfig} */
const sidebars = {
  docs: [
    {
      type: "category",
      label: "SDK v1.0",
      collapsed: false,
      link: { type: "doc", id: "sdk/overview" },
      items: [
        { type: "doc", id: "sdk/get-started", label: "Get started" },
        { type: "doc", id: "sdk/quickstart", label: "Browser quickstart" },
        { type: "doc", id: "sdk/setup-builder", label: "Setup Builder (Beta)" },
        { type: "doc", id: "sdk/sample", label: "3D PC Builder Sample" },
        { type: "doc", id: "sdk/authentication", label: "Backend authentication" },
        { type: "doc", id: "sdk/client-reference", label: "SDK reference" },
        { type: "doc", id: "sdk/catalog", label: "Catalog mapping" }
      ]
    },
    {
      type: "category",
      label: "Product Whitepaper",
      collapsed: true,
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
      label: "Cloud SDK Beta",
      collapsed: true,
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

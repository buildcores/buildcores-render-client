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
          label: "3D Configurator API 2.0"
        }
      ]
    }
  ]
};

module.exports = sidebars;

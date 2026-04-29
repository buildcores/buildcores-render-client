// @ts-check

const lightCodeTheme = require("prism-react-renderer").themes.github;
const darkCodeTheme = require("prism-react-renderer").themes.dracula;

/** @type {import("@docusaurus/types").Config} */
const config = {
  title: "BuildCores API Docs",
  tagline: "Product and technical documentation for BuildCores rendering integrations",
  favicon: "img/logo.png",

  url: "https://buildcores.github.io",
  baseUrl: "/buildcores-render-client/",
  organizationName: "buildcores",
  projectName: "buildcores-render-client",
  trailingSlash: true,

  onBrokenLinks: "throw",
  markdown: {
    hooks: {
      onBrokenMarkdownLinks: "warn"
    }
  },

  i18n: {
    defaultLocale: "en",
    locales: ["en"]
  },

  presets: [
    [
      "classic",
      /** @type {import("@docusaurus/preset-classic").Options} */
      ({
        docs: {
          path: "../docs",
          routeBasePath: "/",
          sidebarPath: require.resolve("./sidebars.js"),
          editUrl: "https://github.com/buildcores/buildcores-render-client/tree/main"
        },
        blog: false,
        theme: {
          customCss: require.resolve("./src/css/custom.css")
        }
      })
    ]
  ],

  plugins: [
    [
      require.resolve("@easyops-cn/docusaurus-search-local"),
      {
        indexBlog: false,
        indexDocs: true,
        indexPages: false,
        language: ["en"],
        hashed: true,
        docsDir: "../docs",
        docsRouteBasePath: "/",
        searchBarPosition: "auto"
      }
    ]
  ],

  themeConfig:
    /** @type {import("@docusaurus/preset-classic").ThemeConfig} */
    ({
      navbar: {
        title: "BuildCores API Docs",
        logo: {
          alt: "BuildCores Logo",
          src: "img/logo.png"
        },
        items: [
          {
            type: "docSidebar",
            sidebarId: "docs",
            position: "left",
            label: "Docs"
          },
          {
            to: "/product-whitepaper/",
            label: "Product",
            position: "left"
          },
          {
            to: "/technical-documentation/",
            label: "Technical",
            position: "left"
          },
          {
            href: "mailto:harsh@buildcores.com",
            label: "Pricing",
            position: "right"
          },
          {
            type: "search",
            position: "right"
          },
          {
            href: "https://github.com/buildcores/buildcores-render-client",
            label: "GitHub",
            position: "right"
          }
        ]
      },
      footer: {
        style: "light",
        links: [
          {
            title: "Docs",
            items: [
              {
                label: "Overview",
                to: "/"
              },
              {
                label: "Product Whitepaper",
                to: "/product-whitepaper/"
              },
              {
                label: "Technical Documentation",
                to: "/technical-documentation/"
              }
            ]
          },
          {
            title: "BuildCores",
            items: [
              {
                label: "@buildcores/render-client",
                href: "https://github.com/buildcores/buildcores-render-client"
              },
              {
                label: "Pricing",
                href: "mailto:harsh@buildcores.com"
              }
            ]
          }
        ],
        copyright: `Copyright © ${new Date().getFullYear()} BuildCores.`
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
        additionalLanguages: ["bash", "typescript", "javascript", "json"]
      }
    })
};

module.exports = config;

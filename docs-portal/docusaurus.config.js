// @ts-check

const lightCodeTheme = require("prism-react-renderer").themes.github;
const darkCodeTheme = require("prism-react-renderer").themes.dracula;
const interestFormUrl =
  "https://docs.google.com/forms/d/e/1FAIpQLSdkPPvBD9CqDb5k-UOOJXRdNXTQ59r6coclQDn6dUMh7RW09A/viewform?usp=header";

/** @type {import("@docusaurus/types").Config} */
const config = {
  title: "BuildCores SDK Docs",
  tagline: "BuildCores SDK documentation",
  favicon: "img/logo.png",

  url: "https://buildcores.github.io",
  baseUrl: "/buildcores-render-client/",
  organizationName: "buildcores",
  projectName: "buildcores-render-client",
  trailingSlash: true,

  onBrokenLinks: "throw",
  markdown: {
    hooks: {
      onBrokenMarkdownLinks: "throw"
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
          editUrl: "https://github.com/buildcores/buildcores-render-client/tree/main/docs-portal/"
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
        title: "BuildCores SDK Docs",
        logo: {
          alt: "BuildCores Logo",
          src: "img/logo.png"
        },
        items: [
          {
            to: "/sdk/",
            position: "left",
            label: "SDK v1.0"
          },
          {
            to: "/product-whitepaper/",
            label: "Product",
            position: "left"
          },
          {
            to: "/technical-documentation/",
            label: "Cloud SDK Beta",
            position: "left"
          },
          {
            href: interestFormUrl,
            label: "Pricing",
            position: "right",
            target: "_blank"
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
                label: "Get started",
                to: "/sdk/get-started/"
              },
              {
                label: "Cloud SDK Beta",
                to: "/technical-documentation/"
              }
            ]
          },
          {
            title: "BuildCores",
            items: [
              {
                label: "Cloud SDK Beta package",
                href: "https://github.com/buildcores/buildcores-render-client"
              },
              {
                label: "Pricing",
                href: interestFormUrl
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

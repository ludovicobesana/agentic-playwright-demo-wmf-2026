const path = require("node:path");

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: "Agentic QA Loop",
  tagline: "Telemetry-driven Playwright planning, generation, and healing",
  favicon: "img/favicon.svg",
  url: "http://localhost:3002",
  baseUrl: "/",
  organizationName: "local-demo",
  projectName: "playwright-agentic-testing-wmf-2026",
  onBrokenLinks: "warn",
  onBrokenMarkdownLinks: "warn",
  trailingSlash: false,
  presets: [
    [
      "classic",
      {
        docs: {
          routeBasePath: "/docs",
          sidebarPath: require.resolve("./sidebars.js"),
        },
        blog: false,
        theme: {
          customCss: require.resolve("./src/css/custom.css"),
        },
      },
    ],
  ],
  plugins: [
    function clientModulesShimPlugin() {
      return {
        name: "client-modules-shim-plugin",
        configureWebpack() {
          return {
            resolve: {
              alias: {
                [path.resolve(__dirname, ".docusaurus/client-modules.js")]:
                  path.resolve(__dirname, "client-modules-shim.js"),
              },
            },
          };
        },
      };
    },
  ],
  themeConfig: {
    // lascia qui il tuo themeConfig attuale
  },
};

module.exports = config;

// Reference: https://miyauchi.dev/posts/vite-preact-typescript/

import fs from "fs";
import { resolve } from "path";
import { defineConfig } from "vite";
import preact from "@preact/preset-vite";

enum DeployTarget {
  GithubPages,
  Glitch,
}

const APP_FQDN: string = process.env.APP_FQDN || "metaframe1.dev";
const APP_PORT: string = process.env.APP_PORT || "443";
const INSIDE_CONTAINER: boolean = fs.existsSync("/.dockerenv");

// Adapt the build to the deploy/build target idiosyncrasies
const DEPLOY_TARGET: DeployTarget =
  process.env.API_SERVER_EXTERNAL === "https://api.glitch.com"
    ? DeployTarget.Glitch
    : DeployTarget.GithubPages;

const GithubPages_BUILD_SUB_DIR: string = process.env.BUILD_SUB_DIR || "";
const fileKey: string = `./.certs/${APP_FQDN}-key.pem`;
const fileCert: string = `./.certs/${APP_FQDN}.pem`;

// Get the github pages path e.g. if served from https://<name>.github.io/<repo>/
// then we need to pull out "<repo>"
const packageName = JSON.parse(
  fs.readFileSync("./package.json", { encoding: "utf8", flag: "r" })
)["name"];
const GithubPages_baseWebPath = packageName.split("/")[1];

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => ({
  // For serving NOT at the base path e.g. with github pages: https://<user_or_org>.github.io/<repo>/
  base:
    DEPLOY_TARGET === DeployTarget.Glitch
      ? undefined
      : GithubPages_BUILD_SUB_DIR !== ""
      ? `/${GithubPages_baseWebPath}/${GithubPages_BUILD_SUB_DIR}/`
      : `/${GithubPages_baseWebPath}/`,
  resolve: {
    alias: {
      react: "preact/compat",
      "react-dom": "preact/compat",
      "react/jsx-runtime": "preact/jsx-runtime",
      "react-dom/test-utils": "preact/test-utils",
      "/@": resolve(__dirname, "./src"),
    },
  },
  jsx: {
    factory: "h",
    fragment: "Fragment",
  },
  // this is really stupid this should not be necessary
  plugins: [preact()],
  build: {
    outDir:
      DEPLOY_TARGET === DeployTarget.Glitch
        ? "dist"
        : `docs/${GithubPages_BUILD_SUB_DIR}`,
    target: "esnext",
    sourcemap: true,
    minify: mode === "development" ? false : "esbuild",
    emptyOutDir: DEPLOY_TARGET === DeployTarget.Glitch,
  },
  server:
    DEPLOY_TARGET === DeployTarget.Glitch
      ? {
          strictPort: true,
          hmr: {
            port: 443, // Run the websocket server on the SSL port
          },
        }
      : {
          open: INSIDE_CONTAINER ? undefined : "/",
          host: INSIDE_CONTAINER ? "0.0.0.0" : APP_FQDN,
          port: parseInt(fs.existsSync(fileKey) ? APP_PORT : "8000"),
          https:
            fs.existsSync(fileKey) && fs.existsSync(fileCert)
              ? {
                  key: fs.readFileSync(fileKey),
                  cert: fs.readFileSync(fileCert),
                }
              : undefined,
        },
}));

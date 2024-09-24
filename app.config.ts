import { sentryVitePlugin } from "@sentry/vite-plugin";
import { defineConfig } from "@solidjs/start/config";
import UnoCSS from "unocss/vite";
import Icons from "unplugin-icons/vite";
import { loadEnv } from "vite";

const env = loadEnv("all", process.cwd());

export default defineConfig({
  server: {
    preset: "static",
    baseURL: process.env.NODE_ENV === "production" ? env.VITE_BASE_URL : "",
  },
  ssr: false,
  vite: {
    define: {
      "process.env.VITE_BASE_URL": JSON.stringify(env.VITE_BASE_URL),
    },
    plugins: [
      sentryVitePlugin({
        org: "razboy20",
        project: "os-matrix-viewer",
        telemetry: false,
        authToken: process.env.SENTRY_AUTH_TOKEN,
      }),
      Icons({ compiler: "solid" }),
      UnoCSS(),
    ],
    ssr: {
      external: ["jsdom"],
    },
    build: {
      sourcemap: true,
      commonjsOptions: {
        exclude: [/jsdom/],
      },
    },
  },
});

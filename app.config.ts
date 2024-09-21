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
      "process.env.BASE_URL": JSON.stringify(process.env.BASE_URL),
    },
    plugins: [
      Icons({ compiler: "solid" }), UnoCSS(),
    ],
    ssr: {
      external: ["jsdom"]
    },
    build: {
      commonjsOptions: {
        exclude: [/jsdom/]
      }
    }
  }
});

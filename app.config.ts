import { defineConfig } from "@solidjs/start/config";
import UnoCSS from "unocss/vite";
import Icons from "unplugin-icons/vite";

import "dotenv/config";

export default defineConfig({
  server: {
    preset: "static",
    baseURL: process.env.BASE_URL,
    prerender: false,
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

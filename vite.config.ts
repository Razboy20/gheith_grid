import { defineConfig } from "@solidjs/start/config";
import UnoCSS from "unocss/vite";
import Icons from "unplugin-icons/vite";

export default defineConfig({
  plugins: [
    UnoCSS(), Icons({ compiler: "solid" }),
  ],
  ssr: {
    external: ["jsdom"]
  },
  build: {
    commonjsOptions: {
      exclude: [/jsdom/]
    }
  }
});

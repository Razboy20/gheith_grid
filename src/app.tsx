import "@unocss/reset/tailwind-compat.css";
import "virtual:uno.css";

// @refresh reload
import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { Suspense } from "solid-js";
import { ThemeProvider } from "./components/ThemeController";

export default function Root() {
  return (
    <ThemeProvider>
      <Router
        root={(props) => {
          return (
            <>
              <Suspense>{props.children}</Suspense>
            </>
          );
        }}
      >
        <FileRoutes />
      </Router>
    </ThemeProvider>
  );
}

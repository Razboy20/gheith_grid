import "@unocss/reset/tailwind-compat.css";
import "virtual:uno.css";

// @refresh reload
import { MetaProvider, Title } from "@solidjs/meta";
import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { Suspense } from "solid-js";
import { FastSpinner } from "./components/Spinner";
import { ThemeProvider } from "./components/ThemeController";

export default function Root() {
  return (
    <ThemeProvider>
      <Router
        explicitLinks
        root={(props) => {
          return (
            <MetaProvider>
              <Title>Matrix</Title>
              <Suspense fallback={<FastSpinner class="w-6 h-6 m-4" show />}>{props.children}</Suspense>
            </MetaProvider>
          );
        }}
      >
        <FileRoutes />
      </Router>
    </ThemeProvider>
  );
}

// temp fix for entry-server.tsx uno classes not being found properly
// font-sans min-w-fit min-h-screen bg-neutral-50 transition-colors duration-100 dark:bg-neutral-900 dark:text-neutral-100 text-neutral-950

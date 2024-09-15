// @refresh reload
import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start";
import { Suspense } from "solid-js";

import "@unocss/reset/tailwind-compat.css";
import "virtual:uno.css";

export default function App() {
  return (
    <Router
      root={(props) => (
        <>
          <Suspense>{props.children}</Suspense>
        </>
      )}
    >
      <FileRoutes />
    </Router>
  );
}

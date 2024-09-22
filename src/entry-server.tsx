import { StartServer, createHandler } from "@solidjs/start/server";
import { getCookie } from "vinxi/http";

export default createHandler((ctx) => {
  const theme = getCookie(ctx.nativeEvent, "color-theme") ?? "light";

  return (
    <StartServer
      document={({ assets, children, scripts }) => (
        <html lang="en" classList={{ dark: theme === "dark" }}>
          <head>
            <meta charset="utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <link rel="icon" href={process.env.VITE_BASE_URL + "favicon.ico"} />
            <script
              defer
              src={process.env.VITE_BASE_URL + "uscript.js"}
              data-website-id="50f3c21b-d118-4869-9b8f-ad47c1cea369"
            ></script>
            {assets}
          </head>
          <body class="font-sans min-w-fit min-h-screen bg-neutral-50 transition-colors duration-100 dark:bg-neutral-900 dark:text-neutral-100 text-neutral-950">
            <div id="app">{children}</div>
            {scripts}
          </body>
        </html>
      )}
    />
  );
});

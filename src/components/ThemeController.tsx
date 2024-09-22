import type { Accessor, JSX } from "solid-js";
import { createContext, createEffect, onMount, Show, useContext } from "solid-js";
import { createUserTheme } from "~/util/cookie";

import MoonIcon from "~icons/heroicons/moon-20-solid";
import SunIcon from "~icons/heroicons/sun-20-solid";

type Theme = "light" | "dark";

interface ThemeContextProps {
  theme: Accessor<Theme>;
  updateTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextProps>();

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within a ThemeProvider");
  return ctx;
};

export function ThemeProvider(props: { children: JSX.Element }): JSX.Element;
export function ThemeProvider(props: { children: (theme: Accessor<Theme>) => JSX.Element }): JSX.Element;
export function ThemeProvider(props: { children: JSX.Element | ((theme: Accessor<Theme>) => JSX.Element) }) {
  const [theme, updateTheme] = createUserTheme("color-theme", {
    defaultValue: "light",
  });

  const Inner = () => {
    const child = props.children;
    const fn = typeof child === "function" && child.length > 0;
    return fn ? child(theme) : (child as JSX.Element);
  };

  return (
    <ThemeContext.Provider value={{ theme, updateTheme }}>
      <Inner />
    </ThemeContext.Provider>
  );
}

export const ThemeControllerButton = (props: { class?: string }) => {
  const { theme, updateTheme } = useTheme();

  const toggleDarkMode = () => {
    updateTheme(theme() === "dark" ? "light" : "dark");
  };

  createEffect(() => {
    document.querySelector("html")?.classList.toggle("dark", theme() === "dark");
  });

  onMount(() => {
    if (theme() === undefined) {
      updateTheme(window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    }
  });

  return (
    <button
      onClick={toggleDarkMode}
      type="button"
      aria-label={theme() === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      class={`m-0 w-10 bg-neutral-200/50 p-0 text-neutral-500 outline-none dark:bg-neutral-700/50 hover:bg-neutral-300/60 dark:text-neutral-400 hover:text-neutral-800 btn dark:hover:bg-neutral-600/60 dark:hover:text-neutral-100 ${props.class}`}
    >
      <Show when={theme() === "dark"}>
        <SunIcon class="h-5 w-5" />
      </Show>
      <Show when={theme() === "light"}>
        <MoonIcon class="h-5 w-5" />
      </Show>
    </button>
  );
};

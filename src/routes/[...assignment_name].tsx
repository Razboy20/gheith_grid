import { makePersisted } from "@solid-primitives/storage";
import { Title } from "@solidjs/meta";
import { createAsync, RouteDefinition, RouteSectionProps, type RoutePreloadFuncArgs } from "@solidjs/router";
import { createEffect, createSignal, onMount, Show } from "solid-js";
import { getRequestEvent, isServer } from "solid-js/web";
import { ReactiveTime } from "~/components/ReactiveTime";
import Table from "~/components/Table";
import { ThemeControllerButton } from "~/components/ThemeController";
import { parseData } from "~/util/parseData";

const fetchSiteHTML = async ({
  params,
}: RoutePreloadFuncArgs): Promise<{ ok: false; error: string } | { ok: true; body: string }> => {
  // match last part of path
  const path = params.assignment_name
    .replace(/\.html$/, "")
    .split("/")
    .pop()!;
  console.log("fetching site html for", path);
  const url = isServer
    ? `http://${getRequestEvent()?.request.headers.get("Host")}/~gheith/${path}.html`
    : `/~gheith/${path}.html`;
  try {
    const req = await fetch(url, { cache: "no-store" });

    if (!req.ok) {
      return { ok: false, error: `Failed to fetch matrix with code ${req.statusText}` };
    }

    const body = await req.text();

    // check for one random string to verify that the page is the matrix
    if (!body.includes("generated")) {
      return { ok: false, error: "Matrix does not exist." };
    }

    return { ok: true, body };
  } catch (e: unknown) {
    return { ok: false, error: (e as Error).message };
  }
};

export const route = {
  preload: async (props) => {
    const response = await fetchSiteHTML(props);
    if (!response.ok) {
      console.error(response.error);
      return { error: response.error };
    }
    return { data: await parseData(response.body) };
  },
} satisfies RouteDefinition;

export default function Home(props: RouteSectionProps<ReturnType<typeof route.preload>>) {
  const siteData = createAsync(() => props.data!);

  // pink easter egg
  const [pinkMode, setPinkMode] = makePersisted(createSignal(false));

  // if user types "p i n k" turn on pink mode
  const [typed, setTyped] = createSignal("");

  onMount(() => {
    window.addEventListener("keydown", (e) => {
      const typedValue = typed();
      if (typedValue.length >= 4) {
        setTyped("");
      } else if (e.key === "p" || e.key === "i" || e.key === "n" || e.key === "k") {
        setTyped(typedValue + e.key);
      } else {
        setTyped("");
      }
    });
  });

  createEffect(() => {
    if (typed() === "pink") {
      setPinkMode((pink) => !pink);
      setTyped("");
    }
  });

  return (
    <>
      <Show when={siteData()?.data}>
        {(data) => (
          <>
            <Title>{data().meta.title}</Title>
            <div
              class="flex flex-row gap-4 p-4"
              classList={{
                "text-pink": pinkMode(),
              }}
            >
              <Table tests={data().testCases} submissions={data().submissions} generatedTime={data().generatedTime} />
              <div class="relative border-1 border-gray-500 space-y-6 rounded-lg p-4 h-fit bg-white dark:bg-neutral-800 transition-colors duration-100">
                <div>
                  <div class="flex flex-row justify-between items-center">
                    <h2 class="font-bold text-2xl mt-1">Information</h2>
                    <ThemeControllerButton class="" />
                  </div>
                  <hr class="my-4 border-neutral-400 dark:border-neutral-500 transition-colors duration-100" />
                  <div class="grid grid-cols-[max-content_1fr] gap-x-4 whitespace-nowrap min-w-50">
                    <span class="font-semibold">Generated:</span>
                    <span>
                      <ReactiveTime time={data().generatedTime} />
                    </span>
                    <span class="font-semibold">Test Cutoff:</span>
                    <span>
                      <ReactiveTime time={data().testCutoff} />
                    </span>
                    <span class="font-semibold">Code Cutoff:</span>
                    <span>
                      <ReactiveTime time={data().codeCutoff} />
                    </span>
                  </div>
                </div>
                <div class="flex justify-between">
                  <div>
                    <h2 class="font-bold text-xl mb-1">Statistics</h2>
                    <div class="grid grid-cols-[max-content_1fr] gap-x-4">
                      <span class="font-semibold">Enrolled:</span>
                      <span>{data().statistics.enrolled}</span>
                      <span class="font-semibold">Submissions:</span>
                      <span>{data().statistics.submissions}</span>
                      <span class="font-semibold">Tests:</span>
                      <span>{data().testCases.length}</span>
                    </div>
                  </div>
                  <div>
                    <h2 class="font-bold text-xl mb-1">Legend</h2>
                    <div class="grid grid-cols-[max-content_1fr] gap-x-4">
                      <span class="font-semibold text-green-700 dark:text-green-400">Passed:</span>
                      <span class="text-gray-400">.</span>
                      <span class="font-semibold text-red-700 dark:text-red-400">Failed:</span>
                      <span class="text-red-500">x</span>
                      <span class="font-semibold text-amber-600 dark:text-amber-400">Did not compile:</span>
                      <span class="text-amber-500">?</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </Show>
      <Show when={siteData()?.error}>
        {(error) => (
          <h1 class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl">
            <span class="font-bold">Error</span>: {error()}
          </h1>
        )}
      </Show>
    </>
  );
}

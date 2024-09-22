import { Title } from "@solidjs/meta";
import { RouteDefinition, RouteSectionProps, createAsync, type RoutePreloadFuncArgs } from "@solidjs/router";
import { Show } from "solid-js";
import { getRequestEvent, isServer } from "solid-js/web";
import { ReactiveTime } from "~/components/ReactiveTime";
import Table from "~/components/Table";
import { ThemeControllerButton } from "~/components/ThemeController";
import { parseData } from "~/util/parseData";

const fetchSiteHTML = async ({ params }: RoutePreloadFuncArgs) => {
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
      return `Failed to fetch "${url}": ${req.statusText}`;
    }

    return await req.text();
  } catch (e: unknown) {
    return `Failed to fetch "${url}": ${e}`;
  }
};

export const route = {
  preload: async (props) => {
    return parseData(await fetchSiteHTML(props));
  },
} satisfies RouteDefinition;

export default function Home(props: RouteSectionProps<ReturnType<typeof route.preload>>) {
  const siteData = createAsync(() => props.data!);

  return (
    <div class="w-fit">
      <Show when={siteData()}>
        {(data) => (
          <>
            <Title>{data().meta.title}</Title>
            <div class="flex flex-row gap-4 p-4">
              <Table tests={data().testCases} submissions={data().submissions} generatedTime={data().generatedTime} />
              <div class="relative border-1 border-gray-500 space-y-6 rounded-lg p-4 h-fit bg-white dark:bg-neutral-800 transition-colors duration-100">
                <div>
                  <h2 class="font-bold text-2xl mb-2">Information</h2>
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
                <ThemeControllerButton class="absolute right-4 bottom-4" />
              </div>
            </div>
          </>
        )}
      </Show>
    </div>
  );
}

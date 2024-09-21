import { RouteDefinition, RouteSectionProps, createAsync, type RoutePreloadFuncArgs } from "@solidjs/router";
import { Show, Suspense } from "solid-js";
import { getRequestEvent, isServer } from "solid-js/web";
import Table from "~/components/Table";
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
      <Suspense fallback="Loading...">
        <Show when={siteData()}>
          {(data) => (
            <Table tests={data().testCases} submissions={data().submissions} generatedTime={data().generatedTime} />
          )}
        </Show>
      </Suspense>
    </div>
  );
}

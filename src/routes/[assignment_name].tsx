import {
  RouteDefinition,
  RouteLoadFuncArgs,
  RouteProps,
  RouteSectionProps,
  RouterProps,
  cache,
  createAsync,
  useParams,
} from "@solidjs/router";
import { Show, Suspense, createEffect, createResource } from "solid-js";
import { getRequestEvent, isServer } from "solid-js/web";
import Table from "~/components/Table";
import { parseData } from "~/util/parseData";

const fetchSiteHTML = async ({ params }: RouteLoadFuncArgs) => {
  const url = isServer
    ? `http://${getRequestEvent()?.headers.get("host")}/gheith/${params.assignment_name}.html`
    : `/gheith/${params.assignment_name}.html`;
  try {
    const req = await fetch(url, { cache: "no-store" });
    return await req.text();
  } catch (e: unknown) {
    return `Failed to fetch "${url}": ${e}`;
  }
};

export const route = {
  load: async (props) => {
    return parseData(await fetchSiteHTML(props));
  },
} satisfies RouteDefinition;

export default function Home(props: RouteSectionProps<ReturnType<typeof route.load>>) {
  const siteData = createAsync(() => props.data!);

  return (
    <div class="w-fit p-4">
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

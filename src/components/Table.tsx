import { ReactiveSet } from "@solid-primitives/set";
import { useParams } from "@solidjs/router";
import { For, Show, createEffect, onMount } from "solid-js";
import { ResultStatus, Submission, SubmissionResult, Test } from "~/util/parseData";
import { ReactiveTime } from "./ReactiveTime";
import { Tooltip } from "./Tooltip";
// import { JSDOM } from "jsdom";

interface TableProps {
  tests: Test[];
  submissions: Submission[];
  generatedTime: Date;
}

function resultIcon(result: SubmissionResult) {
  switch (result.status) {
    case ResultStatus.Passed:
      return (
        <>
          {/* <div class="absolute pointer-events-none left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gray-800/50 h-0.5 w-0.5" /> */}
          <span class="block -mt-1.5">.</span>
        </>
      );
    case ResultStatus.TimedOut:
    case ResultStatus.Diff:
      return (
        <>
          {/* <CrossIcon class="absolute pointer-events-none left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full w-4 h-4" /> */}
          <span>x</span>
        </>
      );
    default:
      return "?";
  }
}

const trimCommitHash = (id: string) => id.split("_")[0];

export default function Table(props: TableProps) {
  const params = useParams();
  const projectIdentifier = params.assignment_name.replace(/.html$/, "");
  const localStorageKey = `pinnedSubmissions.${projectIdentifier}`;

  const avgScore = () => {
    return props.submissions.reduce((acc, sub) => acc + sub.score, 0) / props.submissions.length;
  };
  // const [weightedFirst, setWeightedFirst] = createSignal(false);

  const pinnedSubmissionIds = new ReactiveSet<string>();
  const pinnedSubmissions = () => {
    return props.submissions.filter(({ id }) => pinnedSubmissionIds.has(trimCommitHash(id)));
  };
  const restSubmissions = () => {
    return props.submissions.filter(({ id }) => !pinnedSubmissionIds.has(trimCommitHash(id)));
  };

  const pinSubmission = (id: string) => {
    pinnedSubmissionIds.add(trimCommitHash(id));
  };
  const unpinSubmission = (id: string) => {
    pinnedSubmissionIds.delete(trimCommitHash(id));
  };

  const togglePin = (id: string) => {
    id = trimCommitHash(id);

    if (pinnedSubmissionIds.has(id)) {
      unpinSubmission(id);
    } else {
      pinSubmission(id);
    }
  };

  onMount(() => {
    const savedIds = new Set<string>(JSON.parse(localStorage.getItem(localStorageKey) || "[]"));
    savedIds.forEach((trimmedId) => pinnedSubmissionIds.add(trimmedId));
  });

  createEffect(() => {
    localStorage.setItem(localStorageKey, JSON.stringify(Array.from(pinnedSubmissionIds)));
  });

  function TestResultCell(resultProps: { result: SubmissionResult; index: number }) {
    return (
      <td
        class="text-center"
        aria-details={resultProps.result.title}
        classList={{
          "text-gray-400": resultProps.result.status === ResultStatus.Passed,
          "text-red-500": resultProps.result.status === ResultStatus.Diff,
          "text-purple-500 dark:text-purple-400": resultProps.result.status === ResultStatus.TimedOut,
          "text-amber-500": resultProps.result.status === ResultStatus.Missing,
          // todo: don't use opacity
          "bg-green-200/50 dark:bg-green-800/60 transition-colors duration-100":
            props.tests[resultProps.index]?.weight > 0,
          "bg-red-200/50 dark:bg-red-800/50 transition-colors duration-100":
            props.tests[resultProps.index]?.passing < 2,
        }}
      >
        <Tooltip
          as="div"
          class="text-center relative cursor-auto"
          placement="top"
          tooltipText={resultProps.result.title}
          group="grid"
        >
          {/* <div class="text-center relative" title={resultProps.result.title}> */}
          {resultIcon(resultProps.result)}
          {/* </div> */}
        </Tooltip>
      </td>
    );
  }

  return (
    <table class="border-separate border-spacing-0 rounded-lg contain-paint border-gray-500 border-1">
      <thead class="sticky top-0 bg-gray-200 dark:bg-neutral-800 transition-colors duration-100 z-5 [&>*:last-child>*]:(border-b-1 border-b-gray-500) last-children:children:pr-4">
        <tr class="children:pt-1">
          <th colspan="9999">
            Generated <ReactiveTime time={props.generatedTime} />
            <Show when={!isNaN(avgScore())}>, avg score: {Math.round(avgScore() * 10) / 10}</Show>
          </th>
        </tr>
        <tr>
          {/* <th></th> */}
          <th></th>
          <th>Test</th>
          <For each={props.tests}>
            {(test) => (
              <th>
                <a
                  class="w-6 inline-block text-blue-600 dark:text-blue-300"
                  href={`https://www.cs.utexas.edu/~gheith/${test.testUrl}`}
                >
                  {test.name.replace(/^0*/, "")}
                </a>
              </th>
            )}
          </For>
        </tr>
        <tr>
          <th></th>
          {/* <th><input type="checkbox" name="" id="" /></th> */}
          <th>Weight</th>
          <For each={props.tests}>
            {(test) => (
              <th class="px-1 font-normal">
                <a href={`https://www.cs.utexas.edu/~gheith/${test.outputUrl}`}>{test.weight}</a>
              </th>
            )}
          </For>
        </tr>
        <tr>
          {/* <th></th> */}
          <th></th>
          <th>Passing</th>
          <For each={props.tests}>{(test) => <th class="px-1 font-normal">{test.passing}</th>}</For>
        </tr>
        <For each={pinnedSubmissions()}>
          {(submission) => (
            <tr class="even:bg-gray-300 odd:bg-gray-200 dark:even:bg-neutral-700 dark:odd:bg-neutral-800 transition-colors duration-100">
              <td class="pl-4">
                <input type="checkbox" checked onChange={[togglePin, submission.id]} />
              </td>
              <td class="px-4 font-mono">{submission.id}</td>
              {/* <td>{submission.score}</td> */}
              <For each={submission.results}>{(result, i) => <TestResultCell result={result} index={i()} />}</For>
            </tr>
          )}
        </For>
      </thead>
      <tbody>
        <For each={restSubmissions()}>
          {(submission) => (
            <tr
              class={`last-children:pr-4 ${
                pinnedSubmissions().length % 2 == 0
                  ? "even:bg-gray-100 dark:even:bg-neutral-800 transition-colors duration-100"
                  : "odd:bg-gray-100 dark:odd:bg-neutral-800 transition-colors duration-100"
              }`}
            >
              <td class="pl-4">
                <input type="checkbox" onChange={[togglePin, submission.id]} />
              </td>
              <td class="px-4 font-mono">{submission.id}</td>
              {/* <td>{submission.score}</td> */}
              <For each={submission.results}>{(result, i) => <TestResultCell result={result} index={i()} />}</For>
            </tr>
          )}
        </For>
      </tbody>
    </table>
  );
}

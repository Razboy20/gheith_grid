import { createTimeAgo } from "@solid-primitives/date";
import { ReactiveSet } from "@solid-primitives/set";
import { For, Show, createEffect, createSignal, onMount } from "solid-js";
import { Submission, SubmissionResult, Test } from "~/util/parseData";
// import { JSDOM } from "jsdom";

interface TableProps {
  tests: Test[];
  submissions: Submission[];
  generatedTime: Date;
}

function resultIcon(result: SubmissionResult) {
  switch (result) {
    case SubmissionResult.Passed:
      return (
        <>
          {/* <div class="absolute pointer-events-none left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gray-800/50 h-0.5 w-0.5" /> */}
          <span class="block -mt-1.5">.</span>
        </>
      );
    case SubmissionResult.Failed:
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

export default function Table(props: TableProps) {
  const [generatedTime, setGeneratedTime] = createSignal<Date>(props.generatedTime);
  const [timeAgo] = createTimeAgo(generatedTime, {
    min: 10000,
    interval: 10000,
  });
  const avgScore = () => {
    return props.submissions.reduce((acc, sub) => acc + sub.score, 0) / props.submissions.length;
  };
  // const [weightedFirst, setWeightedFirst] = createSignal(false);

  const pinnedSubmissionIds = new ReactiveSet<string>();
  const pinnedSubmissions = () => {
    return props.submissions.filter(({ id }) => pinnedSubmissionIds.has(id));
  };
  const restSubmissions = () => {
    return props.submissions.filter(({ id }) => !pinnedSubmissionIds.has(id));
  };

  onMount(() => {
    const savedIds = new Set<string>(JSON.parse(localStorage.getItem("pinnedSubmissions") || "[]"));
    savedIds.forEach((id) => pinnedSubmissionIds.add(id));
  });

  createEffect(() => {
    localStorage.setItem("pinnedSubmissions", JSON.stringify(Array.from(pinnedSubmissionIds)));
  });

  function TestResultCell(resultProps: { result: SubmissionResult; index: number }) {
    return (
      <td
        classList={{
          "text-gray-400": resultProps.result === SubmissionResult.Passed,
          "text-red-500": resultProps.result === SubmissionResult.Failed,
          "text-amber-500": resultProps.result === SubmissionResult.Missing,
          "bg-green-200/50": props.tests[resultProps.index]?.weight > 0,
          "bg-red-200/50": props.tests[resultProps.index]?.passing < 2,
        }}
      >
        <div class="text-center relative">{resultIcon(resultProps.result)}</div>
      </td>
    );
  }

  return (
    <div class="p-4">
      <table class="border-separate border-spacing-0 rounded-lg contain-paint border-gray-500 border-1">
        <thead class="sticky top-0 bg-gray-200 z-5 [&>*:last-child>*]:(border-b-1 border-b-gray-500) last-children:children:pr-4">
          <tr class="children:pt-1">
            <th colspan="9999">
              Generated {timeAgo()} ({generatedTime().toLocaleString()})
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
                  <a class="w-6 inline-block text-blue-600" href={`https://www.cs.utexas.edu/~gheith/${test.testUrl}`}>
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
              <tr class="even:bg-gray-300 odd:bg-gray-200">
                <td class="pl-4">
                  <input
                    type="checkbox"
                    checked
                    onChange={(e) => {
                      if (e.currentTarget.checked) {
                        pinnedSubmissionIds.add(submission.id);
                      } else {
                        pinnedSubmissionIds.delete(submission.id);
                      }
                    }}
                  />
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
                    ? "even:bg-gray-100 odd:bg-white"
                    : "odd:bg-gray-100 even:bg-white"
                }`}
              >
                <td class="pl-4">
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      if (e.currentTarget.checked) {
                        pinnedSubmissionIds.add(submission.id);
                      } else {
                        pinnedSubmissionIds.delete(submission.id);
                      }
                    }}
                  />
                </td>
                <td class="px-4 font-mono">{submission.id}</td>
                {/* <td>{submission.score}</td> */}
                <For each={submission.results}>{(result, i) => <TestResultCell result={result} index={i()} />}</For>
              </tr>
            )}
          </For>
        </tbody>
      </table>
    </div>
  );
}

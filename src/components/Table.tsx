import { createTimeAgo } from "@solid-primitives/date";
import { For, createSignal } from "solid-js";
import { createStore } from "solid-js/store";
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
  const [weightedFirst, setWeightedFirst] = createSignal(false);

  const [sortedTests, setSortedTests] = createStore<Test[]>([]);

  function TestResultCell(resultProps: { result: SubmissionResult; index: number }) {
    return (
      <td
        classList={{
          // "text-green-800": props.result === SubmissionResult.Passed,
          "text-red-500": resultProps.result !== SubmissionResult.Passed,
          "bg-green-200": props.tests[resultProps.index]?.weight > 0,
        }}
      >
        <div class="text-center relative">{resultIcon(resultProps.result)}</div>
      </td>
    );
  }

  return (
    <div class="rounded-lg">
      <table>
        <thead class="sticky top-0 bg-gray-200 z-5">
          <tr>
            <th colspan="9999">
              Generated {timeAgo()}, avg score: {Math.round(avgScore() * 10) / 10}
            </th>
          </tr>
          <tr>
            <th></th>
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
            <th>
              <input type="checkbox" name="" id="" />
            </th>
            <th>Weight</th>
            <For each={props.tests}>
              {(test) => (
                <th class="px-1">
                  <a href={`https://www.cs.utexas.edu/~gheith/${test.outputUrl}`}>{test.weight}</a>
                </th>
              )}
            </For>
          </tr>
          <tr>
            <th></th>
            <th></th>
            <th>Passing</th>
            <For each={props.tests}>{(test) => <th class="px-1">{test.passing}</th>}</For>
          </tr>
        </thead>
        <tbody>
          <For each={props.submissions}>
            {(submission) => (
              <tr>
                <td>
                  <input type="checkbox" name="" id="" />
                </td>
                <td>{submission.id}</td>
                <td>{submission.score}</td>
                <For each={submission.results}>{(result, i) => <TestResultCell result={result} index={i()} />}</For>
              </tr>
            )}
          </For>
        </tbody>
      </table>
    </div>
  );
}

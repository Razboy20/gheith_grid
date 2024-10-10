import * as Sentry from "@sentry/solidstart";
import { isServer } from "solid-js/web";

export interface MatrixData {
  testCases: Test[];
  submissions: Submission[];
  generatedTime: Date;
  testCutoff: Date;
  codeCutoff: Date;
  statistics: {
    enrolled: number;
    submissions: number;
  };
  meta: {
    title: string;
  };
}

export interface Test {
  name: string;
  fileName: string;
  weight: number;
  testUrl: string;
  outputUrl: string;
  passing: number;
}

export enum ResultStatus {
  Passed = 0,
  Diff = 1,
  TimedOut = 2,
  Missing = 3,
}

export interface SubmissionResult {
  status: ResultStatus;
  title?: string;
}

export interface Submission {
  id: string;
  score: number;
  pinned?: boolean;
  results: SubmissionResult[];
}

function parseMatrixDate(html: string) {
  const date = html.match(/\d{4}-\d{2}-\d{2} \d{2}:\d{2}/)![0];
  return new Date(date);
}

export async function parseData(html: string) {
  // parse html structure
  let root;
  if (isServer) {
    root = new (await import("jsdom")).JSDOM(html).window.document;
  } else {
    root = new DOMParser().parseFromString(html, "text/html");
  }

  const generatedTime = parseMatrixDate(
    root.querySelector("table table tr:nth-child(1) td:nth-child(2)")!.textContent!
  );
  const testCutoff = parseMatrixDate(root.querySelector("table table tr:nth-child(2) td:nth-child(2)")!.textContent!);
  const codeCutoff = parseMatrixDate(root.querySelector("table table tr:nth-child(3) td:nth-child(2)")!.textContent!);

  const testTable = root.querySelector("table.results")!;
  const inputTestEls = testTable.querySelectorAll("tr:nth-child(1) a");
  const outputTestEls = testTable.querySelectorAll("tr:nth-child(2) a");

  const testCases: Test[] = ([...inputTestEls] as HTMLAnchorElement[]).map((a, i) => ({
    name: a.title.split(".")[0],
    fileName: a.title,
    testUrl: a.attributes.getNamedItem("href")?.value!,
    outputUrl: outputTestEls[i].attributes.getNamedItem("href")?.value!,
    weight: 0,
    passing: 0,
  }));

  // update weights
  const weightRows = Array.from(root.querySelectorAll("table.weights tr")).slice(1, -1);
  for (const row of weightRows) {
    const cols = row.children;
    const testName = cols[0].textContent!;
    const weight = parseInt(cols[1].textContent!);
    const test = testCases.find((t) => t.name === testName);
    if (test) test.weight = weight;
  }

  // read submissions
  const rows = Array.from(testTable.querySelectorAll("tbody > tr"));
  const submissions: Submission[] = [];
  for (const row of rows) {
    const children = Array.from(row.children);
    const id = row.querySelector(".alias")?.textContent!;
    const score = parseInt(children[1].textContent!);
    const results = children.slice(isNaN(score) ? 2 : 3).map((td) => {
      const result: SubmissionResult = {
        status: ResultStatus.Missing,
        title: td.attributes.getNamedItem("title")?.value,
      };

      // [tries, timeTaken]
      const meta = result.title?.match(/(\d+) tries, last took (\d+.?\d*)s/);

      switch (td.textContent) {
        case ".":
          result.status = ResultStatus.Passed;
          break;
        case "X":
          result.status = ResultStatus.Diff;
          break;
        case "T":
          result.status = ResultStatus.TimedOut;
          break;
        case "?":
          result.status = ResultStatus.Missing;
          break;
        default:
          console.error("Failed to match", td.textContent);
          Sentry.captureMessage(`Failed to match ${td.textContent}`, {
            extra: {
              title: result.title,
            },
          });
      }

      if (result.status === ResultStatus.Diff && meta) {
        const timeTaken = parseInt(meta[2]);
        if (timeTaken > 10) {
          result.status = ResultStatus.TimedOut;
        }
      }

      return result;
    });
    submissions.push({ id, score, results });
  }

  // update passing
  for (let i = 0; i < testCases.length; i++) {
    testCases[i].passing = submissions.filter((s) => s.results[i].status === ResultStatus.Passed).length;
  }

  const statistics = {
    enrolled: parseInt(root.querySelector("body > table > tbody > tr:nth-child(5)")!.textContent!),
    submissions: parseInt(root.querySelector("body > table > tbody > tr:nth-child(6)")!.textContent!),
  };

  const rawTitle = root.querySelector("title")!.textContent!;
  const [course, semester, project] = rawTitle.split("_");

  const meta = {
    title: `${course.toUpperCase()} ${project} Matrix`,
  };

  return { testCases, submissions, generatedTime, testCutoff, codeCutoff, statistics, meta } as MatrixData;
}

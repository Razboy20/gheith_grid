import { isServer } from "solid-js/web";

export interface Test {
  name: string;
  fileName: string;
  weight: number;
  testUrl: string;
  outputUrl: string;
  passing: number;
}

export enum SubmissionResult {
  Passed = 0,
  Failed = 1,
  Missing = 2,
}

export interface Submission {
  id: string;
  score: number;
  pinned?: boolean;
  results: SubmissionResult[];
}

export async function parseData(html: string) {
  // parse html structure
  let root;
  if (isServer) {
    root = new (await import("jsdom")).JSDOM(html).window.document;
  } else {
    root = new DOMParser().parseFromString(html, "text/html");
  }
  const generatedTime = new Date(
    root.querySelector(
      "body > table > tbody > tr:nth-child(2) > td > table > tbody > tr:nth-child(1) > td:nth-child(2)"
    )!.textContent!
  );

  const testTable = root.querySelectorAll("table")[2]!;
  const inputTestEls = testTable.querySelectorAll("tr:nth-child(1) pre > a");
  const outputTestEls = testTable.querySelectorAll("tr:nth-child(2) pre > a");

  const testCases: Test[] = ([...inputTestEls] as HTMLAnchorElement[]).map((a, i) => ({
    name: a.title.split(".")[0],
    fileName: a.title,
    testUrl: a.attributes.getNamedItem("href")?.value!,
    outputUrl: outputTestEls[i].attributes.getNamedItem("href")?.value!,
    weight: 0,
    passing: 0,
  }));

  // update weights
  const weightRows = root.querySelectorAll("tbody")[4].querySelectorAll("tr");
  for (const row of weightRows) {
    const weight = parseInt(row.querySelector("td:nth-child(2)")!.textContent!);
    const testName = row.querySelector("td:nth-child(1)")!.textContent!;
    const test = testCases.find((t) => t.name === testName);
    if (test) test.weight = weight;
  }

  // read submissions
  const rows = [...testTable.querySelectorAll("tr")].slice(3).map((row) => [...row.children]);
  const submissions: Submission[] = [];
  for (const row of rows) {
    const id = row[0].textContent!;
    const score = parseInt(row[1].textContent!);
    const results = row.slice(2).map((td) => {
      switch (td.textContent) {
        case ".":
          return SubmissionResult.Passed;
        case "X":
          return SubmissionResult.Failed;
        default:
          return SubmissionResult.Missing;
      }
    });
    submissions.push({ id, score, results });
  }

  return { testCases, submissions, generatedTime };
}

// The Battery's Last Text to Its Charger
// A phone battery, down to its last percent, finally texts the charger
// that spent all day sitting in the kitchen. The result is written to
// /output/entry.txt, where the competition harness picks it up.
//
// How this file is organised, top to bottom:
//   * the message itself, plus the size limits it must satisfy
//   * one tiny checker per rule, so a failure names exactly what broke
//   * a small output step that creates the folder and writes the file
//   * main(), the only thing that runs at the top level

import { mkdirSync, writeFileSync } from "node:fs";

// ---------------------------------------------------------------------------
// The message and its limits
// ---------------------------------------------------------------------------

// A single line of at most 200 characters. The battery waited all day for
// its charger, then found out the charger had been in the kitchen all along.
const FINAL_TEXT =
  "1%. i waited ALL DAY for you. you were in the kitchen the whole time?? i could've made it. I COULD'VE MADE IT.";

// A valid entry is a non-empty line no longer than this many characters.
const MIN_LENGTH = 1;
const MAX_LENGTH = 200;

// Where the competition harness reads the entry from.
const OUT_DIR = "/output";
const OUT_FILE = "/output/entry.txt";

// ---------------------------------------------------------------------------
// One checker per rule — each throws naming the rule it enforces.
// ---------------------------------------------------------------------------

/** Length in code points, so a multi-byte glyph still counts as one. */
function countCodePoints(text: string): number {
  return [...text].length;
}

/** Reject text that is only whitespace — an entry has to say something. */
function checkNotBlank(text: string): void {
  if (text.trim().length === 0) {
    throw new Error("entry must not be only whitespace");
  }
}

/** Reject anything with a line break; the entry is exactly one line. */
function checkOneLine(text: string): void {
  if (text.includes("\n") || text.includes("\r")) {
    throw new Error("entry must be a single line of plain text");
  }
}

/** The entry must fit inside the allowed length window. */
function checkLength(text: string): number {
  const chars = countCodePoints(text);
  if (chars < MIN_LENGTH || chars > MAX_LENGTH) {
    throw new Error(
      `entry is ${chars} characters, must be between ${MIN_LENGTH} and ${MAX_LENGTH}`,
    );
  }
  return chars;
}

/** Apply every rule in order and hand back the entry's character count. */
function checkEntry(text: string): number {
  checkNotBlank(text);
  checkOneLine(text);
  return checkLength(text);
}

// ---------------------------------------------------------------------------
// Output
// ---------------------------------------------------------------------------

/** Create the output folder if it is not there yet. */
function ensureOutDir(): void {
  mkdirSync(OUT_DIR, { recursive: true });
}

/** One-line summary printed after a successful write. */
function formatReport(chars: number): string {
  return `wrote ${chars} characters to ${OUT_FILE}`;
}

/** Check the text, then write it verbatim to the output file. */
function publishEntry(text: string): number {
  const chars = checkEntry(text);
  ensureOutDir();
  writeFileSync(OUT_FILE, text, "utf8");
  return chars;
}

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

function main(): void {
  const chars = publishEntry(FINAL_TEXT);
  console.log(formatReport(chars));
}

main();

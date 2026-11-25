// The Battery's Last Text to Its Charger
// Writes the phone battery's final one-line text to its charger
// to /output/entry.txt, the location the competition harness reads.
//
// Restructured layout:
//   1. Entry text + limits (constants)
//   2. Small validation helpers, one rule each
//   3. A single `writeEntry` step that ties validation and output together
//   4. `main()` as the only top-level entry point

import { mkdirSync, writeFileSync } from "node:fs";

// ---------------------------------------------------------------------------
// Entry text and limits
// ---------------------------------------------------------------------------

// One line, at most 200 characters. The battery waited all day for the
// charger, only to learn the charger was in the kitchen the whole time.
const ENTRY =
  "1%. i waited ALL DAY for you. you were in the kitchen the whole time?? i could've made it. I COULD'VE MADE IT.";

// Hard limits for a one-line entry.
const MIN_CHARS = 1;
const MAX_CHARS = 200;

// Where the competition harness reads the entry from.
const OUTPUT_DIR = "/output";
const OUTPUT_PATH = "/output/entry.txt";

// ---------------------------------------------------------------------------
// Validation helpers — each enforces exactly one rule so a failure message
// names the rule that was broken.
// ---------------------------------------------------------------------------

/** Count characters by code point, so multi-byte glyphs count as one. */
function countChars(entry: string): number {
  return [...entry].length;
}

/** The entry must fit inside the allowed length window. */
function validateLength(entry: string): number {
  const chars = countChars(entry);
  if (chars < MIN_CHARS || chars > MAX_CHARS) {
    throw new Error(
      `entry is ${chars} characters, must be between ${MIN_CHARS} and ${MAX_CHARS}`,
    );
  }
  return chars;
}

/** The entry must contain visible text, not only whitespace. */
function validateNotBlank(entry: string): void {
  if (entry.trim().length === 0) {
    throw new Error("entry must not be only whitespace");
  }
}

/** The entry must be exactly one line of plain text. */
function assertSingleLine(entry: string): void {
  if (entry.includes("\n") || entry.includes("\r")) {
    throw new Error("entry must be a single line of plain text");
  }
}

/** Run every validation rule and return the entry's character count. */
function validateLine(entry: string): number {
  const chars = validateLength(entry);
  validateNotBlank(entry);
  assertSingleLine(entry);
  return chars;
}

// ---------------------------------------------------------------------------
// Output
// ---------------------------------------------------------------------------

/** Validate the entry, then write it verbatim to the output path. */
function writeEntry(entry: string): number {
  const charCount = validateLine(entry);
  // Ensure the output directory exists before writing the entry file.
  mkdirSync(OUTPUT_DIR, { recursive: true });
  writeFileSync(OUTPUT_PATH, entry, "utf8");
  return charCount;
}

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

function main(): void {
  const charCount = writeEntry(ENTRY);
  console.log(`wrote ${charCount} characters to ${OUTPUT_PATH}`);
}

main();

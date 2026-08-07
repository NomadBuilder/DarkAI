import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export async function changedFiles(
  cwd: string,
  baseRef: string,
  pathspecs: string[],
): Promise<string[]> {
  const args = [
    "diff",
    "--name-only",
    "--diff-filter=ACMR",
    `${baseRef}...HEAD`,
    "--",
    ...(pathspecs.length ? pathspecs : ["."]),
  ];
  try {
    const { stdout } = await execFileAsync("git", args, {
      cwd,
      maxBuffer: 2_000_000,
    });
    return stdout
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);
  } catch (error) {
    throw new Error(
      `Could not determine files changed from ${baseRef}: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
}

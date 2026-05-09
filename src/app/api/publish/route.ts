import { execFile } from "node:child_process";
import { promisify } from "node:util";

const run = promisify(execFile);

async function command(file: string, args: string[]) {
  const { stdout, stderr } = await run(file, args, {
    cwd: process.cwd(),
    timeout: 120_000,
  });
  return [stdout, stderr].filter(Boolean).join("\n");
}

export async function POST() {
  if (process.env.NEXT_PUBLIC_KEYSTATIC_STORAGE_KIND !== "local") {
    return new Response("Publishing is disabled outside local CMS mode.", { status: 403 });
  }

  try {
    const statusBefore = await command("git", [
      "status",
      "--short",
      "src/_data",
      "src/content",
      "src/static/collections",
    ]);

    if (!statusBefore.trim()) {
      return new Response("No CMS content changes to publish.");
    }

    await command("npm", ["run", "build"]);
    await command("git", ["add", "src/_data", "src/content", "src/static/collections"]);
    await command("git", ["commit", "-m", "Publish CMS content updates"]);
    const pushOutput = await command("git", ["push", "origin", "main"]);

    return new Response(`Published successfully.\n\n${pushOutput}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return new Response(`Publish failed.\n\n${message}`, { status: 500 });
  }
}

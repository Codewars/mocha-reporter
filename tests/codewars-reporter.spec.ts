import fs from "fs";
import path from "path";
import { promisify } from "util";

import chai from "chai";
import execa from "execa";

const assert = chai.assert;
const readFile = promisify(fs.readFile);
const access = promisify(fs.access);
const exists = async (path: string) => {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
};

const structureMatches = (a: string, b: string) =>
  assert.strictEqual(
    a.match(/<(?:DESCRIBE|IT|PASSED|FAILED|ERROR|COMPLETEDIN)::>/g).join(""),
    b.match(/<(?:DESCRIBE|IT|PASSED|FAILED|ERROR|COMPLETEDIN)::>/g).join("")
  );

describe("CodewarsReporter", function () {
  const cwd = path.join(__dirname, "..");
  const fixturesDir = path.join(__dirname, "fixtures");
  for (const file of fs.readdirSync(fixturesDir)) {
    if (!file.endsWith(".js")) continue;

    it(file.replace(/\.js$/, ""), async () => {
      const { stdout } = await execa(
        "mocha",
        ["--reporter", "lib/codewars-reporter", path.join(fixturesDir, file)],
        {
          cwd,
          preferLocal: true,
          stripFinalNewline: false,
          reject: false,
        }
      );
      const expectedFile = path.join(
        fixturesDir,
        file.replace(/\.js$/, ".expected.txt")
      );

      if (await exists(expectedFile)) {
        const expected = await readFile(expectedFile, {
          encoding: "utf-8",
        });
        // Allow duration to change
        const expectedPattern = new RegExp(
          expected.replace(/(?<=<COMPLETEDIN::>)\d+/g, "\\d+")
        );
        assert.match(stdout, expectedPattern);
      } else {
        const samplePath = path.join(
          fixturesDir,
          file.replace(/\.js$/, ".sample.txt")
        );
        const sample = await readFile(samplePath, {
          encoding: "utf-8",
        });
        structureMatches(stdout, sample);
      }
    });
  }
});

import { reporters, Runner, Suite, MochaOptions } from "mocha";

const EVENT_SUITE_BEGIN = Runner.constants.EVENT_SUITE_BEGIN;
const EVENT_SUITE_END = Runner.constants.EVENT_SUITE_END;
const EVENT_TEST_BEGIN = Runner.constants.EVENT_TEST_BEGIN;
const EVENT_TEST_END = Runner.constants.EVENT_TEST_END;
const EVENT_TEST_PASS = Runner.constants.EVENT_TEST_PASS;
const EVENT_TEST_FAIL = Runner.constants.EVENT_TEST_FAIL;
const EVENT_TEST_PENDING = Runner.constants.EVENT_TEST_PENDING;

class CodewarsReporter extends reporters.Base {
  // To allow default import
  static default = CodewarsReporter;
  constructor(runner: Runner, options?: MochaOptions) {
    super(runner, options);

    runner.on(EVENT_SUITE_BEGIN, (suite) => {
      if (suite.title) groupStart(suite.title);
    });

    runner.on(EVENT_SUITE_END, (suite) => {
      if (suite.title) completedIn(getSuiteDuration(suite));
    });

    runner.on(EVENT_TEST_BEGIN, (test) => {
      testStart(test.title);
    });

    runner.on(EVENT_TEST_END, (test) => {
      completedIn(test.duration);
    });

    runner.on(EVENT_TEST_PASS, (_) => {
      passed();
    });

    runner.on(EVENT_TEST_PENDING, (_) => {
      skipped();
    });

    runner.on(EVENT_TEST_FAIL, (test, err) => {
      if (test.timedOut) return failed("Timed Out");

      // From fast-check
      // TODO Improve the output by providing custom reporter.
      // https://github.com/dubzzz/fast-check/blob/master/documentation/1-Guides/Tips.md#customize-the-reported-error
      if (
        err instanceof Error &&
        /^Property failed after \d+ tests/.test(err.message)
      ) {
        failed(err.message);
        return;
      }

      if (err instanceof Error && !/^AssertionError/.test(err.name)) {
        errored(err.stack || err.toString());
        return;
      }

      failed(err.message);
    });
  }
}

const getSuiteDuration = ({ tests, suites }: Suite): number =>
  tests.reduce((a, t) => a + (t.duration || 0), 0) +
  suites.reduce((a, s) => a + getSuiteDuration(s), 0);

const escapeLF = (text: string) => text.replace(/\n/g, "<:LF:>");

const groupStart = (s: string) => console.log(`\n<DESCRIBE::>${escapeLF(s)}`);
const testStart = (s: string) => console.log(`\n<IT::>${escapeLF(s)}`);
const failed = (s: string) => console.log(`\n<FAILED::>${escapeLF(s)}`);
const errored = (s: string) => console.log(`\n<ERROR::>${escapeLF(s)}`);
const passed = () => console.log("\n<PASSED::>Test Passed");
const skipped = () => console.log("\n<LOG::>Test Skipped");
const completedIn = (d?: number) =>
  console.log(`\n<COMPLETEDIN::>${typeof d === "undefined" ? "" : d}`);

export = CodewarsReporter;

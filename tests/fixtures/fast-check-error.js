describe("group 1", () => {
  it("test 1", () => {
    // Special case for errors from fast-check. Should be reported as assertion failure.
    throw new Error("Property failed after 3 tests");
  });
});

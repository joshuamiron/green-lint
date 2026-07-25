// Demonstrates excessive-dom's wrapper-removal check. (The "DOM has N
// nodes" total-count check needs 1500+ nodes to trigger - impractical to
// demonstrate in a small fixture, and the CLI doesn't load a config file
// to lower the threshold - so it isn't exercised here.)
function UnoptimizedDOM() {
  return (
    <>
      {/* 3 levels of unnecessary nesting - each div has exactly one child */}
      <div className="wrapper-outer">
        <div className="wrapper-middle">
          <div className="wrapper-inner">
            <h1>Unnecessary Wrapper Nesting</h1>
          </div>
        </div>
      </div>

      {/* A single unnecessary wrapper */}
      <div className="content-wrapper">
        <p>This paragraph is unnecessarily wrapped in a single div.</p>
      </div>
    </>
  );
}

export default UnoptimizedDOM;

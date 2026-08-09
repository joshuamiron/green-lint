// Demonstrates both excessive-dom checks: unnecessary wrapper elements,
// and a real rendered DOM size well over the 1500-node "DOM has N nodes"
// threshold (the bloat block below alone renders 1600+ elements).
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

      {/* 800 x 2 = 1600 extra elements, pushing the real rendered DOM well
          past the 1500-node threshold. Uses <ul>/<li>, not nested <div>s,
          so this doesn't also trip the unnecessary-wrapper check above -
          that one only looks at <div> elements. */}
      <ul className="bloat">
        {Array.from({ length: 800 }, (_, i) => (
          <li key={i}><span>Item {i}</span></li>
        ))}
      </ul>
    </>
  );
}

export default UnoptimizedDOM;

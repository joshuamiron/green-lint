import { useState } from 'react';

// TSX counterpart to UnoptimizedDOM.jsx - same issues, but exercises
// green-lint's TypeScript plugin path (typed props, generic useState<T>).
// Also demonstrates the "DOM has N nodes" total-count check: the bloat
// block below alone renders 1600+ elements, well past the 1500 threshold.
interface DOMProps {
  title: string;
}

function UnoptimizedDOM({ title }: DOMProps) {
  const [expanded, setExpanded] = useState<boolean>(false);

  return (
    <>
      {/* 3 levels of unnecessary nesting - each div has exactly one child */}
      <div className="wrapper-outer">
        <div className="wrapper-middle">
          <div className="wrapper-inner">
            <h1>{title}</h1>
          </div>
        </div>
      </div>

      {/* A single unnecessary wrapper */}
      <div className="content-wrapper">
        <p>This paragraph is unnecessarily wrapped in a single div.</p>
      </div>

      {/* 800 x 2 = 1600 extra elements. Uses <ul>/<li>, not nested <div>s,
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

import { useState } from 'react';

// TSX counterpart to UnoptimizedDOM.jsx - same issues, but exercises
// green-lint's TypeScript plugin path (typed props, generic useState<T>).
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
    </>
  );
}

export default UnoptimizedDOM;

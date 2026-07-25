import { useState } from 'react';

// Optimized counterpart to UnoptimizedDOM.tsx.
interface DOMProps {
  title: string;
}

function OptimizedDOM({ title }: DOMProps) {
  const [expanded, setExpanded] = useState<boolean>(false);

  return (
    <>
      <h1>{title}</h1>
      <p>This paragraph is unnecessarily wrapped in a single div.</p>
    </>
  );
}

export default OptimizedDOM;

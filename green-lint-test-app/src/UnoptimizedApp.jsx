import UnoptimizedGallery from '../tests/pages/UnoptimizedGallery.jsx';
import UnoptimizedDOM from '../tests/pages/UnoptimizedDOM.jsx';
import UnoptimizedGalleryTSX from '../tests/pages/UnoptimizedGallery.tsx';
import UnoptimizedDOMTSX from '../tests/pages/UnoptimizedDOM.tsx';

// All unoptimized fixtures on their own page, so they can be
// Lighthouse-audited separately from the optimized versions.
function UnoptimizedApp() {
  return (
    <div>
      <h1>Green Lint Test Fixtures - Unoptimized</h1>

      <section>
        <h2>UnoptimizedGallery.jsx</h2>
        <UnoptimizedGallery />
      </section>
      <section>
        <h2>UnoptimizedDOM.jsx</h2>
        <UnoptimizedDOM />
      </section>
      <section>
        <UnoptimizedGalleryTSX title="UnoptimizedGallery.tsx" />
      </section>
      <section>
        <UnoptimizedDOMTSX title="UnoptimizedDOM.tsx" />
      </section>
    </div>
  );
}

export default UnoptimizedApp;

import OptimizedGallery from '../tests/pages/OptimizedGallery.jsx';
import OptimizedDOM from '../tests/pages/OptimizedDOM.jsx';
import OptimizedGalleryTSX from '../tests/pages/OptimizedGallery.tsx';
import OptimizedDOMTSX from '../tests/pages/OptimizedDOM.tsx';

// All optimized fixtures on their own page, so they can be
// Lighthouse-audited separately from the unoptimized versions.
function OptimizedApp() {
  return (
    <div>
      <h1>Green Lint Test Fixtures - Optimized</h1>

      <section>
        <h2>OptimizedGallery.jsx</h2>
        <OptimizedGallery />
      </section>
      <section>
        <h2>OptimizedDOM.jsx</h2>
        <OptimizedDOM />
      </section>
      <section>
        <OptimizedGalleryTSX title="OptimizedGallery.tsx" />
      </section>
      <section>
        <OptimizedDOMTSX title="OptimizedDOM.tsx" />
      </section>
    </div>
  );
}

export default OptimizedApp;

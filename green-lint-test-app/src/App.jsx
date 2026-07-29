import UnoptimizedGallery from '../tests/pages/UnoptimizedGallery.jsx';
import OptimizedGallery from '../tests/pages/OptimizedGallery.jsx';
import UnoptimizedDOM from '../tests/pages/UnoptimizedDOM.jsx';
import OptimizedDOM from '../tests/pages/OptimizedDOM.jsx';
import UnoptimizedGalleryTSX from '../tests/pages/UnoptimizedGallery.tsx';
import OptimizedGalleryTSX from '../tests/pages/OptimizedGallery.tsx';
import UnoptimizedDOMTSX from '../tests/pages/UnoptimizedDOM.tsx';
import OptimizedDOMTSX from '../tests/pages/OptimizedDOM.tsx';

// Renders every green-lint test fixture as a real, live React component so
// they can be viewed in a browser and audited with Lighthouse - not just
// parsed as source by the CLI/VS Code extension.
function App() {
  return (
    <div>
      <h1>Green Lint Test Fixtures</h1>

      <section>
        <h2>UnoptimizedGallery.jsx</h2>
        <UnoptimizedGallery />
      </section>
      <section>
        <h2>OptimizedGallery.jsx</h2>
        <OptimizedGallery />
      </section>
      <section>
        <h2>UnoptimizedDOM.jsx</h2>
        <UnoptimizedDOM />
      </section>
      <section>
        <h2>OptimizedDOM.jsx</h2>
        <OptimizedDOM />
      </section>

      <section>
        <UnoptimizedGalleryTSX title="UnoptimizedGallery.tsx" />
      </section>
      <section>
        <OptimizedGalleryTSX title="OptimizedGallery.tsx" />
      </section>
      <section>
        <UnoptimizedDOMTSX title="UnoptimizedDOM.tsx" />
      </section>
      <section>
        <OptimizedDOMTSX title="OptimizedDOM.tsx" />
      </section>
    </div>
  );
}

export default App;

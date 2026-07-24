// Optimized counterpart to UnoptimizedGallery.jsx - what green-lint fix
// should produce: modern formats via <picture>, lazy loading below the fold.
function OptimizedGallery() {
  return (
    <div className="gallery">
      {/* Hero image, above the fold - modern format, no lazy loading needed */}
      <picture>
        <source srcSet="https://picsum.photos/id/100/400/300.webp" type="image/webp" />
        <img src="https://picsum.photos/id/100/400/300.jpg" alt="Landscape 1" />
      </picture>

      {/* Below-fold images - modern format + lazy loading */}
      <picture>
        <source srcSet="https://picsum.photos/id/200/400/300.webp" type="image/webp" />
        <img src="https://picsum.photos/id/200/400/300.jpg" alt="Landscape 2" loading="lazy" />
      </picture>
      <picture>
        <source srcSet="https://picsum.photos/id/300/400/300.webp" type="image/webp" />
        <img src="https://picsum.photos/id/300/400/300.jpg" alt="Landscape 3" loading="lazy" />
      </picture>
      <picture>
        <source srcSet="https://picsum.photos/id/400/400/300.webp" type="image/webp" />
        <img src="https://picsum.photos/id/400/400/300.jpg" alt="Landscape 4" loading="lazy" />
      </picture>
    </div>
  );
}

export default OptimizedGallery;

// Optimized counterpart to UnoptimizedGallery.jsx - what green-lint fix
// should produce: modern formats via <picture>, lazy loading below the fold.
function OptimizedGallery() {
  return (
    <div className="gallery">
      {/* Hero image, above the fold - modern format, no lazy loading needed */}
      <picture>
        <source srcSet="https://picsum.photos/id/100/800/600.webp" type="image/webp" />
        <img src="https://picsum.photos/id/100/800/600.jpg" alt="Landscape 1" />
      </picture>

      {/* Below-fold images - modern format + lazy loading */}
      <picture>
        <source srcSet="https://picsum.photos/id/200/800/600.webp" type="image/webp" />
        <img src="https://picsum.photos/id/200/800/600.jpg" alt="Landscape 2" loading="lazy" />
      </picture>
      <picture>
        <source srcSet="https://picsum.photos/id/300/800/600.webp" type="image/webp" />
        <img src="https://picsum.photos/id/300/800/600.jpg" alt="Landscape 3" loading="lazy" />
      </picture>
      <picture>
        <source srcSet="https://picsum.photos/id/400/800/600.webp" type="image/webp" />
        <img src="https://picsum.photos/id/400/800/600.jpg" alt="Landscape 4" loading="lazy" />
      </picture>
      <picture>
        <source srcSet="https://picsum.photos/id/500/800/600.webp" type="image/webp" />
        <img src="https://picsum.photos/id/500/800/600.jpg" alt="Landscape 5" loading="lazy" />
      </picture>
      <picture>
        <source srcSet="https://picsum.photos/id/600/800/600.webp" type="image/webp" />
        <img src="https://picsum.photos/id/600/800/600.jpg" alt="Landscape 6" loading="lazy" />
      </picture>
      <picture>
        <source srcSet="https://picsum.photos/id/700/800/600.webp" type="image/webp" />
        <img src="https://picsum.photos/id/700/800/600.jpg" alt="Landscape 7" loading="lazy" />
      </picture>
      <picture>
        <source srcSet="https://picsum.photos/id/800/800/600.webp" type="image/webp" />
        <img src="https://picsum.photos/id/800/800/600.jpg" alt="Landscape 8" loading="lazy" />
      </picture>
      <picture>
        <source srcSet="https://picsum.photos/id/900/800/600.webp" type="image/webp" />
        <img src="https://picsum.photos/id/900/800/600.jpg" alt="Landscape 9" loading="lazy" />
      </picture>
      <picture>
        <source srcSet="https://picsum.photos/id/1000/800/600.webp" type="image/webp" />
        <img src="https://picsum.photos/id/1000/800/600.jpg" alt="Landscape 10" loading="lazy" />
      </picture>
    </div>
  );
}

export default OptimizedGallery;

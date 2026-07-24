// Unoptimized JSX gallery, mirroring src/pages/unoptimized.html but for
// green-lint's JSX/TSX detection: legacy image formats, no lazy loading.
function UnoptimizedGallery() {
  return (
    <div className="gallery">
      {/* Hero image, above the fold - still legacy JPEG (modern-formats issue) */}
      <img src="https://picsum.photos/id/100/400/300.jpg" alt="Landscape 1" />

      {/* Below-fold images - missing loading="lazy" AND legacy JPEG format */}
      <img src="https://picsum.photos/id/200/400/300.jpg" alt="Landscape 2" />
      <img src="https://picsum.photos/id/300/400/300.jpg" alt="Landscape 3" />
      <img src="https://picsum.photos/id/400/400/300.jpg" alt="Landscape 4" />
    </div>
  );
}

export default UnoptimizedGallery;

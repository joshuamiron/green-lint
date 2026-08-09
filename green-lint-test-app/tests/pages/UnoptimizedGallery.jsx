// Unoptimized JSX gallery, mirroring src/pages/unoptimized.html but for
// green-lint's JSX/TSX detection: legacy image formats, no lazy loading.
function UnoptimizedGallery() {
  return (
    <div className="gallery">
      {/* Hero image, above the fold - still legacy JPEG (modern-formats issue) */}
      <img src="https://picsum.photos/id/100/800/600.jpg" alt="Landscape 1" />

      {/* Below-fold images - missing loading="lazy" AND legacy JPEG format */}
      <img src="https://picsum.photos/id/200/800/600.jpg" alt="Landscape 2" />
      <img src="https://picsum.photos/id/300/800/600.jpg" alt="Landscape 3" />
      <img src="https://picsum.photos/id/400/800/600.jpg" alt="Landscape 4" />
      <img src="https://picsum.photos/id/500/800/600.jpg" alt="Landscape 5" />
      <img src="https://picsum.photos/id/600/800/600.jpg" alt="Landscape 6" />
      <img src="https://picsum.photos/id/700/800/600.jpg" alt="Landscape 7" />
      <img src="https://picsum.photos/id/800/800/600.jpg" alt="Landscape 8" />
      <img src="https://picsum.photos/id/900/800/600.jpg" alt="Landscape 9" />
      <img src="https://picsum.photos/id/1000/800/600.jpg" alt="Landscape 10" />
    </div>
  );
}

export default UnoptimizedGallery;

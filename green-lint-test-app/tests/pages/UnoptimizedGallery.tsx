import { useState } from 'react';

// TSX counterpart to UnoptimizedGallery.jsx - same issues, but exercises
// green-lint's TypeScript plugin path (typed props, generic useState<T>).
interface GalleryProps {
  title: string;
}

function UnoptimizedGallery({ title }: GalleryProps) {
  const [expanded, setExpanded] = useState<boolean>(false);

  return (
    <div className="gallery">
      <h2>{title}</h2>

      {/* Hero image, above the fold - still legacy JPEG (modern-formats issue) */}
      <img src="https://picsum.photos/id/500/400/300.jpg" alt="Landscape 5" />

      {/* Below-fold images - missing loading="lazy" AND legacy JPEG format */}
      <img src="https://picsum.photos/id/600/400/300.jpg" alt="Landscape 6" />
      <img src="https://picsum.photos/id/700/400/300.jpg" alt="Landscape 7" />
      <img src="https://picsum.photos/id/800/400/300.jpg" alt="Landscape 8" />
    </div>
  );
}

export default UnoptimizedGallery;

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
      <img src="https://picsum.photos/id/10/800/600.jpg" alt="Landscape 1" />

      {/* Below-fold images - missing loading="lazy" AND legacy JPEG format */}
      <img src="https://picsum.photos/id/20/800/600.jpg" alt="Landscape 2" />
      <img src="https://picsum.photos/id/30/800/600.jpg" alt="Landscape 3" />
      <img src="https://picsum.photos/id/40/800/600.jpg" alt="Landscape 4" />
      <img src="https://picsum.photos/id/50/800/600.jpg" alt="Landscape 5" />
      <img src="https://picsum.photos/id/60/800/600.jpg" alt="Landscape 6" />
      <img src="https://picsum.photos/id/70/800/600.jpg" alt="Landscape 7" />
      <img src="https://picsum.photos/id/80/800/600.jpg" alt="Landscape 8" />
      <img src="https://picsum.photos/id/90/800/600.jpg" alt="Landscape 9" />
      <img src="https://picsum.photos/id/1020/800/600.jpg" alt="Landscape 10" />
    </div>
  );
}

export default UnoptimizedGallery;

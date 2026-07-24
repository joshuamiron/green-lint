import { useState } from 'react';

// Optimized counterpart to UnoptimizedGallery.tsx.
interface GalleryProps {
  title: string;
}

function OptimizedGallery({ title }: GalleryProps) {
  const [expanded, setExpanded] = useState<boolean>(false);

  return (
    <div className="gallery">
      <h2>{title}</h2>

      {/* Hero image, above the fold - modern format, no lazy loading needed */}
      <picture>
        <source srcSet="https://picsum.photos/id/500/400/300.webp" type="image/webp" />
        <img src="https://picsum.photos/id/500/400/300.jpg" alt="Landscape 5" />
      </picture>

      {/* Below-fold images - modern format + lazy loading */}
      <picture>
        <source srcSet="https://picsum.photos/id/600/400/300.webp" type="image/webp" />
        <img src="https://picsum.photos/id/600/400/300.jpg" alt="Landscape 6" loading="lazy" />
      </picture>
      <picture>
        <source srcSet="https://picsum.photos/id/700/400/300.webp" type="image/webp" />
        <img src="https://picsum.photos/id/700/400/300.jpg" alt="Landscape 7" loading="lazy" />
      </picture>
      <picture>
        <source srcSet="https://picsum.photos/id/800/400/300.webp" type="image/webp" />
        <img src="https://picsum.photos/id/800/400/300.jpg" alt="Landscape 8" loading="lazy" />
      </picture>
    </div>
  );
}

export default OptimizedGallery;

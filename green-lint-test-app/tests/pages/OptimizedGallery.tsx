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
        <source srcSet="https://picsum.photos/id/10/800/600.webp" type="image/webp" />
        <img src="https://picsum.photos/id/10/800/600.jpg" alt="Landscape 1" />
      </picture>

      {/* Below-fold images - modern format + lazy loading */}
      <picture>
        <source srcSet="https://picsum.photos/id/20/800/600.webp" type="image/webp" />
        <img src="https://picsum.photos/id/20/800/600.jpg" alt="Landscape 2" loading="lazy" />
      </picture>
      <picture>
        <source srcSet="https://picsum.photos/id/30/800/600.webp" type="image/webp" />
        <img src="https://picsum.photos/id/30/800/600.jpg" alt="Landscape 3" loading="lazy" />
      </picture>
      <picture>
        <source srcSet="https://picsum.photos/id/40/800/600.webp" type="image/webp" />
        <img src="https://picsum.photos/id/40/800/600.jpg" alt="Landscape 4" loading="lazy" />
      </picture>
      <picture>
        <source srcSet="https://picsum.photos/id/50/800/600.webp" type="image/webp" />
        <img src="https://picsum.photos/id/50/800/600.jpg" alt="Landscape 5" loading="lazy" />
      </picture>
      <picture>
        <source srcSet="https://picsum.photos/id/60/800/600.webp" type="image/webp" />
        <img src="https://picsum.photos/id/60/800/600.jpg" alt="Landscape 6" loading="lazy" />
      </picture>
      <picture>
        <source srcSet="https://picsum.photos/id/70/800/600.webp" type="image/webp" />
        <img src="https://picsum.photos/id/70/800/600.jpg" alt="Landscape 7" loading="lazy" />
      </picture>
      <picture>
        <source srcSet="https://picsum.photos/id/80/800/600.webp" type="image/webp" />
        <img src="https://picsum.photos/id/80/800/600.jpg" alt="Landscape 8" loading="lazy" />
      </picture>
      <picture>
        <source srcSet="https://picsum.photos/id/90/800/600.webp" type="image/webp" />
        <img src="https://picsum.photos/id/90/800/600.jpg" alt="Landscape 9" loading="lazy" />
      </picture>
      <picture>
        <source srcSet="https://picsum.photos/id/1020/800/600.webp" type="image/webp" />
        <img src="https://picsum.photos/id/1020/800/600.jpg" alt="Landscape 10" loading="lazy" />
      </picture>
    </div>
  );
}

export default OptimizedGallery;

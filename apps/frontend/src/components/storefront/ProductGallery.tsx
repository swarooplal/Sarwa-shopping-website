'use client';

import { useState } from 'react';
import Image from 'next/image';
import { m, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export function ProductGallery({ images }: { images: string[] }) {
  const [idx, setIdx] = useState(0);
  const [zoom, setZoom] = useState(false);
  if (!images?.length) return null;

  return (
    <div className="flex flex-col-reverse md:flex-row gap-4">
      <div className="flex md:flex-col gap-3">
        {images.map((src, i) => (
          <button
            key={i}
            onClick={() => setIdx(i)}
            className={`relative aspect-[4/5] w-16 md:w-20 overflow-hidden rounded-md transition ${i === idx ? 'ring-2 ring-champagne' : ''}`}
          >
            <Image src={src} alt={`thumb ${i}`} fill sizes="80px" className="object-cover" />
          </button>
        ))}
      </div>

      <div className="flex-1">
        <div
          className="relative aspect-[4/5] overflow-hidden rounded-xl2 bg-ivory cursor-zoom-in"
          onClick={() => setZoom(true)}
        >
          <AnimatePresence mode="wait">
            <m.div
              key={idx}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="absolute inset-0"
            >
              <Image
                src={images[idx]}
                alt={`product ${idx}`}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
                priority
              />
            </m.div>
          </AnimatePresence>
          <div className="absolute right-4 top-4 rounded-full bg-white/80 px-3 py-1.5 text-[10px] uppercase tracking-widest">
            Click to zoom
          </div>
        </div>
      </div>

      <AnimatePresence>
        {zoom && (
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] grid place-items-center bg-charcoal/90 p-6"
            onClick={() => setZoom(false)}
          >
            <button className="absolute right-4 top-4 text-ivory text-sm uppercase tracking-widest">Close ✕</button>
            <Image src={images[idx]} alt="zoomed" width={1000} height={1300} className="max-h-[90vh] object-contain" />
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}

'use client';

import { useBanners } from '@/hooks/queries';
import { m, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export function HeroSlider() {
  const { data: banners, isLoading } = useBanners('HERO');
  const [idx, setIdx] = useState(0);

  const slides = banners ?? [];
  useEffect(() => {
    if (slides.length < 2) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % slides.length), 5500);
    return () => clearInterval(t);
  }, [slides.length]);

  if (isLoading) return <div className="aspect-[16/9] w-full animate-pulse bg-ivory" />;
  if (slides.length === 0) {
    return (
      <div className="relative h-[78vh] md:h-[88vh] w-full overflow-hidden bg-ivory grid place-items-center">
        <Image
          src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1920"
          alt="SARWA"
          fill
          sizes="100vw"
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/20 to-black/50" />
        <div className="relative z-10 max-w-3xl text-center text-ivory px-6">
          <span className="eyebrow text-champagne">SARWA · Heritage</span>
          <h1 className="mt-4 font-serif text-5xl md:text-7xl leading-tight">The Bridal Edit</h1>
          <p className="mt-4 text-base md:text-lg text-ivory/85">Handwoven sarees for your forever.</p>
          <Link href="/collections/wedding-edit" className="btn-gold mt-8 inline-flex">Shop the Edit</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-[78vh] md:h-[88vh] w-full overflow-hidden">
      <AnimatePresence mode="wait">
        {slides.map((b: any, i: number) =>
          i === idx ? (
            <m.div
              key={b.id}
              initial={{ opacity: 0, scale: 1.04 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ duration: 1.2, ease: [0.21, 0.47, 0.32, 0.98] }}
              className="absolute inset-0"
            >
              <Image
                src={b.desktopImage}
                alt={b.heading ?? ''}
                fill
                sizes="100vw"
                className="object-cover"
                priority={i === 0}
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/30 to-black/55" />
              <div className="absolute inset-0 grid items-center">
                <div className="container-x text-ivory">
                  <m.span
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="eyebrow text-champagne"
                  >
                    SARWA · Heritage
                  </m.span>
                  <m.h1
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.45 }}
                    className="mt-3 max-w-3xl font-serif text-5xl md:text-7xl leading-[1.05]"
                  >
                    {b.heading}
                  </m.h1>
                  <m.p
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="mt-4 max-w-xl text-base md:text-lg text-ivory/85"
                  >
                    {b.subHeading}
                  </m.p>
                  {b.buttonText && (
                    <m.div
                      initial={{ y: 30, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.75 }}
                      className="mt-8"
                    >
                      <Link href={b.buttonLink ?? '#'} className="btn-gold">
                        {b.buttonText}
                      </Link>
                    </m.div>
                  )}
                </div>
              </div>
            </m.div>
          ) : null
        )}
      </AnimatePresence>

      {slides.length > 1 && (
        <>
          <button
            onClick={() => setIdx((i) => (i - 1 + slides.length) % slides.length)}
            className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 grid h-12 w-12 place-items-center rounded-full bg-white/20 text-ivory hover:bg-white/40 backdrop-blur transition"
            aria-label="Previous slide"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={() => setIdx((i) => (i + 1) % slides.length)}
            className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 grid h-12 w-12 place-items-center rounded-full bg-white/20 text-ivory hover:bg-white/40 backdrop-blur transition"
            aria-label="Next slide"
          >
            <ChevronRight size={20} />
          </button>
        </>
      )}

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((_b: any, i: number) => (
          <button
            key={i}
            onClick={() => setIdx(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`h-1 transition-all rounded-full ${i === idx ? 'w-10 bg-champagne' : 'w-6 bg-white/40'}`}
          />
        ))}
      </div>
    </div>
  );
}

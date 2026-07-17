'use client';

import { LazyMotion, domAnimation, MotionConfig } from 'framer-motion';

export function MotionProvider({ children }: { children: React.ReactNode }) {
  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig transition={{ duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] }}>
        {children}
      </MotionConfig>
    </LazyMotion>
  );
}

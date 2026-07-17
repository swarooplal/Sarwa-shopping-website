'use client';

import { m, AnimatePresence } from 'framer-motion';
import { ReactNode, useEffect } from 'react';
import { X } from 'lucide-react';

export function AdminModal({
  open,
  onClose,
  title,
  children,
  size = 'md',
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: 'md' | 'lg';
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const widthClass = size === 'lg' ? 'max-w-3xl' : 'max-w-xl';
  return (
    <AnimatePresence>
      {open && (
        <m.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[90] grid place-items-center bg-charcoal/50 backdrop-blur-sm p-4 overflow-y-auto"
          onClick={onClose}
        >
          <m.div
            initial={{ scale: 0.95, y: 10 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 10 }}
            className={`w-full ${widthClass} rounded-xl2 bg-white shadow-luxury my-8`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-charcoal-100 p-4">
              <h3 className="font-serif text-2xl">{title}</h3>
              <button onClick={onClose} className="p-1"><X size={18} /></button>
            </div>
            <div className="p-6 max-h-[80vh] overflow-y-auto">{children}</div>
          </m.div>
        </m.div>
      )}
    </AnimatePresence>
  );
}

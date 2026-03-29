'use client';
import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { COLORS, FONTS, BUSINESS } from '@/lib/constants';
import type { Product } from '@/types';

interface ProductCardProps { product: Product; onOrder: (product: Product) => void; index?: number; }

export function ProductCard({ product, onOrder, index = 0 }: ProductCardProps) {
  const [currentImage, setCurrentImage] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const images = [product.image1, product.image2, product.image3].filter(Boolean) as string[];
  const hasMultiple = images.length > 1;
  const inStock = product.status === 'In Stock' && product.stock > 0;

  const next = useCallback((e: React.MouseEvent) => { e.stopPropagation(); setCurrentImage((p) => (p + 1) % images.length); }, [images.length]);
  const prev = useCallback((e: React.MouseEvent) => { e.stopPropagation(); setCurrentImage((p) => (p - 1 + images.length) % images.length); }, [images.length]);

  const openLightbox = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLightboxIndex(currentImage);
    setLightboxOpen(true);
  };

  const lightboxNext = (e: React.MouseEvent) => { e.stopPropagation(); setLightboxIndex((p) => (p + 1) % images.length); };
  const lightboxPrev = (e: React.MouseEvent) => { e.stopPropagation(); setLightboxIndex((p) => (p - 1 + images.length) % images.length); };

  return (
    <>
      <motion.article
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
        onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}
        className={cn('group relative overflow-hidden rounded-2xl bg-white flex flex-col h-full border transition-all duration-500',
          isHovered ? '-translate-y-2 shadow-[0_20px_40px_rgba(29,78,216,0.15)]' : 'shadow-sm')}
        style={{ borderColor: COLORS.border }}>

        {/* Image */}
        <div className="relative aspect-square overflow-hidden border-b" style={{ borderColor: COLORS.border, backgroundColor: COLORS.bg }}>
          <div className={cn('absolute top-3 left-3 z-10 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider',
            inStock ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white')}>
            {inStock ? 'In Stock' : 'Sold Out'}
          </div>
          {product.category && (
            <div className="absolute top-3 right-3 z-10 px-2.5 py-1 rounded-full text-xs font-semibold text-white"
              style={{ backgroundColor: COLORS.primary }}>
              {product.category}
            </div>
          )}

          {/* Clickable image — opens lightbox */}
          <div
            className="w-full h-full p-4 flex items-center justify-center transition-transform duration-500 cursor-zoom-in"
            style={{ transform: isHovered ? 'scale(1.06)' : 'scale(1)' }}
            onClick={openLightbox}
            title="Click to enlarge">
            {images.length ? (
              <img src={images[currentImage]} alt={`${product.name} - ${currentImage + 1}`}
                className="max-w-full max-h-full object-contain rounded-xl drop-shadow-md" loading="lazy" decoding="async" />
            ) : (
              <div className="text-6xl opacity-20">👕</div>
            )}
          </div>

          {/* Zoom hint */}
          <div className={cn('absolute bottom-10 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-lg transition-all pointer-events-none',
            isHovered ? 'opacity-100' : 'opacity-0')}>
            🔍 Tap to enlarge
          </div>

          {hasMultiple && (
            <>
              <button onClick={prev} className={cn('absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white shadow flex items-center justify-center font-bold transition-all z-10',
                isHovered ? 'opacity-100' : 'opacity-0 -translate-x-2')} style={{ color: COLORS.text }}>‹</button>
              <button onClick={next} className={cn('absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white shadow flex items-center justify-center font-bold transition-all z-10',
                isHovered ? 'opacity-100' : 'opacity-0 translate-x-2')} style={{ color: COLORS.text }}>›</button>
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 bg-white/90 px-2.5 py-1 rounded-full z-10">
                {images.map((_, i) => (
                  <button key={i} onClick={(e) => { e.stopPropagation(); setCurrentImage(i); }}
                    className={cn('h-1.5 rounded-full transition-all', i === currentImage ? 'w-4' : 'w-1.5')}
                    style={{ backgroundColor: i === currentImage ? COLORS.primary : '#CBD5E1' }} />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Info */}
        <div className="p-4 flex flex-col flex-grow gap-2">
          <h3 className="text-sm font-bold leading-tight line-clamp-2 min-h-[2.5rem]" style={{ color: COLORS.text }}>{product.name}</h3>
          {product.description && (
            <p className="text-xs line-clamp-2 flex-grow" style={{ color: COLORS.textSoft }}>{product.description}</p>
          )}
          {product.variants?.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {product.variants.slice(0, 4).map((v) => (
                <span key={v.name} className="text-xs px-2 py-0.5 rounded-full font-medium border"
                  style={{ borderColor: COLORS.border, color: COLORS.textSoft, backgroundColor: COLORS.bg }}>
                  {v.name}
                </span>
              ))}
              {product.variants.length > 4 && (
                <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ color: COLORS.primary }}>
                  +{product.variants.length - 4}
                </span>
              )}
            </div>
          )}
          <div className="flex items-end justify-between pt-2 mt-auto border-t" style={{ borderColor: COLORS.border }}>
            <div className="flex items-baseline gap-1">
              <span className="text-xs font-medium" style={{ color: COLORS.textMuted }}>{BUSINESS.currency}</span>
              <span className="text-xl font-bold" style={{ color: COLORS.primary, fontFamily: FONTS.serif }}>{product.price}</span>
            </div>
            {product.stock > 0 && product.stock <= 5 && (
              <span className="text-xs text-orange-500 font-semibold">Only {product.stock} left</span>
            )}
          </div>
          <button onClick={() => inStock && onOrder(product)} disabled={!inStock}
            className={cn('mt-1 w-full py-2.5 px-4 rounded-xl font-semibold text-sm transition-all relative overflow-hidden',
              inStock ? 'text-white shadow-md hover:shadow-lg hover:-translate-y-0.5' : 'bg-gray-200 text-gray-400 cursor-not-allowed')}
            style={inStock ? { background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryDark})` } : {}}>
            {inStock && <span className={cn('absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full transition-transform duration-700', isHovered && 'translate-x-full')} />}
            {inStock ? '🛒 Order Now' : 'Sold Out'}
          </button>
        </div>
      </motion.article>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center"
            style={{ backgroundColor: 'rgba(0,0,0,0.92)' }}
            onClick={() => setLightboxOpen(false)}>

            {/* Close button */}
            <button
              onClick={() => setLightboxOpen(false)}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all z-10">
              <X className="w-6 h-6 text-white" />
            </button>

            {/* Image counter */}
            {hasMultiple && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/20 text-white text-sm px-3 py-1 rounded-full">
                {lightboxIndex + 1} / {images.length}
              </div>
            )}

            {/* Main image */}
            <motion.div
              key={lightboxIndex}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className="relative max-w-[90vw] max-h-[85vh] flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}>
              <img
                src={images[lightboxIndex]}
                alt={`${product.name} - ${lightboxIndex + 1}`}
                className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl"
              />
            </motion.div>

            {/* Product name at bottom */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center">
              <p className="text-white font-semibold text-sm">{product.name}</p>
              <p className="text-white/70 text-xs mt-0.5">{BUSINESS.currency} {product.price}</p>
            </div>

            {/* Prev/Next arrows */}
            {hasMultiple && (
              <>
                <button
                  onClick={lightboxPrev}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all">
                  <ChevronLeft className="w-7 h-7 text-white" />
                </button>
                <button
                  onClick={lightboxNext}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all">
                  <ChevronRight className="w-7 h-7 text-white" />
                </button>

                {/* Thumbnail strip */}
                <div className="absolute bottom-14 left-1/2 -translate-x-1/2 flex gap-2">
                  {images.map((src, i) => (
                    <button key={i} onClick={(e) => { e.stopPropagation(); setLightboxIndex(i); }}
                      className={cn('w-12 h-12 rounded-lg overflow-hidden border-2 transition-all',
                        i === lightboxIndex ? 'border-white scale-110' : 'border-white/30 opacity-60 hover:opacity-100')}>
                      <img src={src} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

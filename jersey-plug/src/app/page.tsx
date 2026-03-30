'use client';
import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Header } from '@/components/layout/Header';
import { ProductGrid } from '@/components/product/ProductGrid';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { COLORS, BUSINESS } from '@/lib/constants';
import { useProducts } from '@/hooks/index';
import { useRecordVisit } from '@/hooks/useAnalytics';
import type { Product } from '@/types';

export default function ShopPage() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  // Record visit automatically when shop page loads
  useRecordVisit();

  const { data, isLoading, error, refetch } = useProducts();
  const allProducts = data?.data ?? [];

  const filtered = useMemo(() => {
    return allProducts.filter((p) => {
      const matchesSearch = !searchQuery ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [allProducts, searchQuery, activeCategory]);

  const handleOrder = (product: Product) => {
    setSelectedProduct(product);
    setCartOpen(true);
  };

  return (
    <div className="relative min-h-screen" style={{ background: COLORS.bg }}>
      <Header
        searchQuery={searchQuery} onSearchChange={setSearchQuery}
        activeCategory={activeCategory} onCategoryChange={setActiveCategory}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold mb-4 text-white"
            style={{ background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryDark})` }}>
            ⚽ Ghana's #1 Jersey Store
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold mb-3 leading-tight" style={{ color: COLORS.text }}>
            Your Plug For{' '}
            <span style={{ background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.accent})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Every Jersey
            </span>
          </h2>
          <p className="text-lg max-w-md mx-auto" style={{ color: COLORS.textSoft }}>
            Retro classics to modern kits. Club, country, NFL & basketball. Fast delivery across Ghana.
          </p>
        </motion.div>

        {/* Count */}
        {!isLoading && (
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm" style={{ color: COLORS.textMuted }}>
              {filtered.length} {filtered.length === 1 ? 'jersey' : 'jerseys'} found
              {activeCategory !== 'All' && ` in ${activeCategory}`}
              {searchQuery && ` for "${searchQuery}"`}
            </p>
            {(searchQuery || activeCategory !== 'All') && (
              <button onClick={() => { setSearchQuery(''); setActiveCategory('All'); }}
                className="text-sm font-medium" style={{ color: COLORS.primary }}>
                Clear filters ×
              </button>
            )}
          </div>
        )}

        {/* Loading skeleton */}
        {isLoading && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-2xl overflow-hidden bg-white border animate-pulse" style={{ borderColor: COLORS.border }}>
                <div className="aspect-square bg-gray-100" />
                <div className="p-4 space-y-3">
                  <div className="h-3 bg-gray-100 rounded w-3/4" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                  <div className="h-8 bg-gray-100 rounded-xl mt-4" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {error && !isLoading && (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">⚠️</div>
            <h3 className="text-lg font-bold mb-2" style={{ color: COLORS.text }}>Failed to load jerseys</h3>
            <button onClick={() => refetch()}
              className="text-sm font-medium px-4 py-2 rounded-xl border mt-2"
              style={{ color: COLORS.primary, borderColor: COLORS.primary }}>Try Again</button>
          </div>
        )}

        {!isLoading && !error && <ProductGrid products={filtered} onOrder={handleOrder} />}
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t py-8 text-center bg-white" style={{ borderColor: COLORS.border }}>
        <p className="text-sm" style={{ color: COLORS.textMuted }}>
          © {new Date().getFullYear()} {BUSINESS.name} · retrogh.shop ·{' '}
          <a href={`tel:${BUSINESS.phone}`} className="font-medium hover:underline" style={{ color: COLORS.primary }}>
            {BUSINESS.phone}
          </a>
        </p>
      </footer>

      <CartDrawer
        isOpen={cartOpen} onClose={() => setCartOpen(false)}
        selectedProduct={selectedProduct} onClearSelection={() => setSelectedProduct(null)}
      />
    </div>
  );
}

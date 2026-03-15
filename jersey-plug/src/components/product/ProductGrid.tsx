'use client';
import { ProductCard } from './ProductCard';
import type { Product } from '@/types';

interface ProductGridProps { products: Product[]; onOrder: (product: Product) => void; }

export function ProductGrid({ products, onOrder }: ProductGridProps) {
  if (!products.length) return (
    <div className="text-center py-24">
      <div className="text-7xl mb-4 opacity-40">👕</div>
      <h3 className="text-xl font-semibold text-jp-text">No jerseys found</h3>
      <p className="text-jp-text-muted mt-2">New stock dropping soon!</p>
    </div>
  );

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
      {products.map((p, i) => <ProductCard key={p.id} product={p} onOrder={onOrder} index={i} />)}
    </div>
  );
}

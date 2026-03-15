'use client';
import { useState } from 'react';
import { Search, Phone, Menu, X, ShoppingBag } from 'lucide-react';
import { COLORS, BUSINESS, CATEGORIES } from '@/lib/constants';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (v: string) => void;
  activeCategory: string;
  onCategoryChange: (c: string) => void;
}

export function Header({ searchQuery, onSearchChange, activeCategory, onCategoryChange }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white border-b shadow-sm" style={{ borderColor: COLORS.border }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top bar */}
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm"
              style={{ background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryDark})` }}>
              ⚽
            </div>
            <div>
              <h1 className="text-base font-bold leading-tight" style={{ color: COLORS.text }}>
                {BUSINESS.name}
              </h1>
              <p className="text-[10px] uppercase tracking-widest" style={{ color: COLORS.textMuted }}>
                Retro · Modern · Ghana
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="relative flex-1 max-w-sm hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: COLORS.textMuted }} />
            <input type="text" placeholder="Search jerseys..." value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border text-sm focus:outline-none focus:ring-2 transition-all"
              style={{ borderColor: COLORS.border, backgroundColor: COLORS.bg }} />
          </div>

          <div className="flex items-center gap-2">
            <a href={`tel:${BUSINESS.phone}`}
              className="hidden sm:flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-xl hover:bg-jp-primary-light transition-colors"
              style={{ color: COLORS.primary }}>
              <Phone className="w-4 h-4" />{BUSINESS.phone}
            </a>
            <button className="sm:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile search */}
        {mobileMenuOpen && (
          <div className="sm:hidden pb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: COLORS.textMuted }} />
              <input type="text" placeholder="Search jerseys..." value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl border text-sm focus:outline-none focus:ring-2"
                style={{ borderColor: COLORS.border }} />
            </div>
          </div>
        )}

        {/* Category filters */}
        <div className="flex gap-2 pb-3 overflow-x-auto scrollbar-hide">
          {CATEGORIES.map((cat) => (
            <button key={cat} onClick={() => onCategoryChange(cat)}
              className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${activeCategory === cat ? 'text-white shadow-md' : 'hover:bg-jp-primary-light'}`}
              style={activeCategory === cat
                ? { background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryDark})` }
                : { color: COLORS.textSoft, border: `1px solid ${COLORS.border}` }}>
              {cat}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}

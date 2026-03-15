import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { QueryProvider } from '@/lib/queryClient';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'The Jersey Plug GH — Retro & Modern Jerseys Ghana',
  description: 'Your plug for every jersey in Ghana. Shop retro and modern club jerseys, country kits, NFL, and basketball jerseys. Fast delivery across Ghana.',
  keywords: 'jerseys Ghana, retro jerseys, club jerseys, country jerseys, NFL Ghana, basketball jerseys, football kits Ghana',
  openGraph: {
    title: 'The Jersey Plug GH',
    description: 'Your plug for every jersey. Retro to modern. Delivered across Ghana.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased">
        <QueryProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: { borderRadius: '12px', fontFamily: 'Inter, sans-serif', fontSize: '14px' },
              success: { iconTheme: { primary: '#10B981', secondary: '#fff' } },
              error: { iconTheme: { primary: '#EF4444', secondary: '#fff' } },
            }}
          />
        </QueryProvider>
      </body>
    </html>
  );
}

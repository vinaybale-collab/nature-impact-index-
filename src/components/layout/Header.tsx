'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import Toggle from '@/components/ui/Toggle';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();

  // Only show toggle on rankings and company pages
  const showToggle = pathname === '/rankings' || pathname.startsWith('/company/');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-sm shadow-sm border-b border-gray-100'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-600 to-blue-600 flex items-center justify-center">
              <span className="text-white font-bold text-base">NII</span>
            </div>
            <span className="font-gothic text-lg text-gray-900 uppercase tracking-wide hidden sm:block">
              Nature Impact Index
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-10">
            <Link
              href="/rankings"
              className="text-base text-gray-600 hover:text-gray-900 transition-colors font-medium"
            >
              Rankings
            </Link>
            <Link
              href="/methodology"
              className="text-base text-gray-600 hover:text-gray-900 transition-colors font-medium"
            >
              Methodology
            </Link>
          </nav>

          {/* Toggle + Mobile Menu */}
          <div className="flex items-center gap-4">
            {showToggle && <Toggle className="hidden sm:flex" />}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-gray-900"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-200 shadow-lg">
          <div className="px-4 py-4 space-y-4">
            {showToggle && <Toggle className="w-full justify-center" />}
            <nav className="flex flex-col gap-2">
              <Link
                href="/rankings"
                className="px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Rankings
              </Link>
              <Link
                href="/methodology"
                className="px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Methodology
              </Link>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}

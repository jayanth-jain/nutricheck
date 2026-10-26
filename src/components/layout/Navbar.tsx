import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Sun, Moon } from 'lucide-react';
import { useTranslation, type Language } from '../../i18n';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { lang: currentLang, setLanguage: setCurrentLang } = useTranslation();
  const [isDark, setIsDark] = useState(() => {
    try {
      const stored = sessionStorage.getItem('nutricheck_dark');
      if (stored !== null) return stored === 'true' || stored === 'dark';
      return document.documentElement.classList.contains('dark');
    } catch {
      return false;
    }
  });
  const location = useLocation();

  useEffect(() => {
    try {
      if (isDark) {
        document.documentElement.classList.add('dark');
        sessionStorage.setItem('nutricheck_dark', 'true');
      } else {
        document.documentElement.classList.remove('dark');
        sessionStorage.setItem('nutricheck_dark', 'false');
      }
    } catch {
      // Ignore sessionStorage exceptions
    }
  }, [isDark]);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Analyze', path: '/analyze/profile' },
    { name: 'About', path: '/about' },
  ];

  const isLinkActive = (linkPath: string) => {
    if (linkPath === '/') {
      return location.pathname === '/';
    }
    if (linkPath.startsWith('/analyze')) {
      return location.pathname.startsWith('/analyze');
    }
    return location.pathname.startsWith(linkPath);
  };

  const langNames: Record<Language, string> = {
    en: 'English',
    hi: 'Hindi',
    te: 'Telugu',
  };

  return (
    <header className="sticky top-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-orange-100 dark:border-gray-800 transition-colors no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand / Logo */}
        <Link
          to="/"
          onClick={() => setIsOpen(false)}
          className="flex items-center gap-2 group min-h-[44px]"
        >
          <span className="text-2xl transition-transform group-hover:scale-110">🍽️</span>
          <span className="font-heading font-bold text-xl tracking-tight text-gray-900 dark:text-white">
            Nutri<span className="text-primary-600">Check</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8" aria-label="Main Navigation">
          {navLinks.map((link) => {
            const active = isLinkActive(link.path);
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`min-h-[44px] inline-flex items-center text-sm font-medium transition-colors hover:text-primary-600 dark:hover:text-primary-400 focus:outline-hidden focus:ring-2 focus:ring-primary-500 rounded-lg px-2 ${
                  active
                    ? 'text-primary-600 dark:text-primary-400 font-bold border-b-2 border-primary-600 dark:border-primary-400'
                    : 'text-gray-600 dark:text-gray-300'
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Action Controls (Desktop) */}
        <div className="hidden md:flex items-center gap-4">
          {/* Language Switcher */}
          <div className="flex items-center text-xs font-medium rounded-lg border border-gray-200 dark:border-gray-700 p-0.5 bg-gray-50 dark:bg-gray-800" role="group" aria-label="Language selection">
            {(['en', 'hi', 'te'] as const).map((lang) => (
              <button
                key={lang}
                type="button"
                aria-label={`Switch language to ${langNames[lang]}`}
                aria-pressed={currentLang === lang}
                onClick={() => setCurrentLang(lang)}
                className={`min-h-[32px] px-2 py-1 rounded capitalize transition-colors focus:outline-hidden focus:ring-1 focus:ring-primary-500 ${
                  currentLang === lang
                    ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 font-bold shadow-2xs'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
                title={`Switch to ${lang.toUpperCase()}`}
              >
                {lang}
              </button>
            ))}
          </div>

          {/* Dark Mode Toggle */}
          <button
            type="button"
            onClick={() => setIsDark((prev) => !prev)}
            aria-label="Toggle dark mode"
            className="min-h-[44px] min-w-[44px] p-2.5 rounded-xl text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-hidden focus:ring-2 focus:ring-primary-500 inline-flex items-center justify-center"
          >
            {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="md:hidden flex items-center gap-1">
          <button
            type="button"
            onClick={() => setIsDark((prev) => !prev)}
            aria-label="Toggle dark mode"
            className="min-h-[44px] min-w-[44px] p-2.5 rounded-xl text-gray-500 hover:text-gray-700 dark:text-gray-400 inline-flex items-center justify-center"
          >
            {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
          </button>
          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            aria-label="Toggle navigation menu"
            aria-expanded={isOpen}
            className="min-h-[44px] min-w-[44px] p-2.5 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 inline-flex items-center justify-center"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="md:hidden border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 pt-2 pb-6 space-y-3">
          <nav className="flex flex-col space-y-1">
            {navLinks.map((link) => {
              const active = isLinkActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`min-h-[44px] flex items-center px-3 py-2 rounded-xl text-base font-medium transition-colors ${
                    active
                      ? 'bg-orange-50 dark:bg-gray-800 text-primary-600 dark:text-primary-400 font-bold'
                      : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-850'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          <div className="pt-2 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <span className="text-xs text-gray-500 dark:text-gray-400">Language:</span>
            <div className="flex gap-1 text-xs" role="group" aria-label="Language selection">
              {(['en', 'hi', 'te'] as const).map((lang) => (
                <button
                  key={lang}
                  type="button"
                  aria-label={`Switch language to ${langNames[lang]}`}
                  aria-pressed={currentLang === lang}
                  onClick={() => setCurrentLang(lang)}
                  className={`min-h-[36px] px-2.5 py-1 rounded-lg capitalize ${
                    currentLang === lang
                      ? 'bg-primary-500 text-white font-bold'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

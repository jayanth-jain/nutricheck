import { Suspense, lazy, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { useTranslation } from './i18n';

const Landing = lazy(() => import('./pages/Landing'));
const Profile = lazy(() => import('./pages/Profile'));
const Meals = lazy(() => import('./pages/Meals'));
const Results = lazy(() => import('./pages/Results'));
const About = lazy(() => import('./pages/About'));
const NotFound = lazy(() => import('./pages/NotFound'));

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

const pageTransition = { duration: 0.22, ease: 'easeOut' };

export default function App() {
  const location = useLocation();
  const { lang } = useTranslation();

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang;
    }
  }, [lang]);

  const prefersReducedMotion =
    typeof window !== 'undefined' && typeof window.matchMedia === 'function'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false;
  const transition = prefersReducedMotion ? { duration: 0 } : pageTransition;

  return (
    <div className="min-h-screen flex flex-col font-body bg-cream dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 bg-white text-primary-700 px-4 py-2 rounded shadow-md z-50 font-medium"
      >
        Skip to content
      </a>
      <Navbar />
      <main id="main-content" className="flex-1">
        <ErrorBoundary>
          <Suspense
            fallback={
              <div className="p-8 text-center text-sm text-gray-500 dark:text-gray-400">
                Loading…
              </div>
            }
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={transition}
              >
                <Routes location={location}>
                  <Route path="/" element={<Landing />} />
                  <Route path="/analyze/profile" element={<Profile />} />
                  <Route path="/analyze/meals" element={<Meals />} />
                  <Route path="/analyze/results" element={<Results />} />
                  <Route path="/about" element={<About />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </motion.div>
            </AnimatePresence>
          </Suspense>
        </ErrorBoundary>
      </main>
      <Footer />
    </div>
  );
}

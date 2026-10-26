import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <div className="text-8xl mb-4">🍽️</div>
      <h1 className="text-3xl font-heading font-bold text-gray-800 dark:text-gray-100 mb-2">
        Page Not Found
      </h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md">
        This page doesn&apos;t exist. Let&apos;s get you back to analyzing your diet.
      </p>
      <Link
        to="/"
        className="btn-primary inline-flex items-center px-6 py-3 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold shadow-md transition-colors"
      >
        Back to Home
      </Link>
    </div>
  );
}

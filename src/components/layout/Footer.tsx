
export default function Footer() {
  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 py-8 px-4 sm:px-6 lg:px-8 mt-auto transition-colors no-print">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500 dark:text-gray-400 text-center sm:text-left">
        <div>
          <p className="font-medium text-gray-700 dark:text-gray-300">
            Powered by ICMR-NIN reference data
          </p>
          <p className="mt-1">
            ⚠️ Educational tool, not medical advice. Consult a qualified professional for clinical guidance.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span>🔒 No data stored or sent to any server.</span>
        </div>
      </div>
    </footer>
  );
}

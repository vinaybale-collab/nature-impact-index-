import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-600 to-blue-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">NII</span>
              </div>
              <span className="font-semibold text-gray-900">
                India Nature Impact Index
              </span>
            </div>
            <p className="text-gray-600 text-sm max-w-md">
              Measuring the true cost of business on nature. Transparent, rigorous,
              and open-source environmental performance rankings for Indian companies.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Explore</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/rankings"
                  className="text-gray-600 hover:text-gray-900 transition-colors text-sm"
                >
                  Rankings
                </Link>
              </li>
              <li>
                <Link
                  href="/methodology"
                  className="text-gray-600 hover:text-gray-900 transition-colors text-sm"
                >
                  Methodology
                </Link>
              </li>
            </ul>
          </div>

          {/* About */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">About</h4>
            <ul className="space-y-2">
              <li>
                <span className="text-gray-600 text-sm">
                  Built by Urvara
                </span>
              </li>
              <li>
                <span className="text-gray-600 text-sm">
                  Data: 525 Companies
                </span>
              </li>
              <li>
                <span className="text-gray-600 text-sm">
                  Sectors: 29
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} India Nature Impact Index. All rights reserved.
          </p>
          <p className="text-gray-500 text-sm">
            Methodology: UN SEEA Enhanced
          </p>
        </div>
      </div>
    </footer>
  );
}

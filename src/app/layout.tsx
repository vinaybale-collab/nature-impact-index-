import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { ToggleProvider } from '@/context/ToggleContext';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

// Special Gothic Expanded One for bold headers - loaded via CSS @import in globals.css

export const metadata: Metadata = {
  title: 'India Nature Impact Index | NII',
  description: 'Measuring the true cost of business on nature. Transparent environmental performance rankings for 525 Indian companies across 29 sectors.',
  keywords: ['nature impact', 'ESG', 'India', 'sustainability', 'biodiversity', 'climate', 'environmental ranking'],
  authors: [{ name: 'Urvara' }],
  openGraph: {
    title: 'India Nature Impact Index',
    description: 'Transparent environmental performance rankings for Indian companies',
    url: 'https://nii.urvara.life',
    siteName: 'India Nature Impact Index',
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'India Nature Impact Index',
    description: 'Transparent environmental performance rankings for Indian companies',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="font-sans antialiased text-base">
        <ToggleProvider>
          {children}
        </ToggleProvider>
      </body>
    </html>
  );
}

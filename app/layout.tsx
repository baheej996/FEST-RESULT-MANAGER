import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Festival Result Management System',
  description: 'Enterprise Festival Scoring, Verification and Results Management Portal',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50/50 text-slate-900 antialiased font-sans">
        {children}
      </body>
    </html>
  );
}


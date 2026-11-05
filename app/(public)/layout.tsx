import PublicHeader from '@/components/public-header';
import { Trophy, Heart } from 'lucide-react';
import Link from 'next/link';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <PublicHeader />

      <div className="flex-1">{children}</div>

      <footer className="bg-white border-t border-slate-200/80 py-8 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-indigo-600" />
            <span className="font-bold text-slate-800">Sahodaya Kalotsav 2026</span>
            <span>• Official Festival Results Portal</span>
          </div>

          <div className="text-slate-400">
            Powered by <strong className="text-slate-700">FestResult OS</strong> • Automated Scrutiny & Championship Engine
          </div>
        </div>
      </footer>
    </div>
  );
}


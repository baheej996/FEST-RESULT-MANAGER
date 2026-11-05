'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Calendar,
  Building2,
  Users2,
  Award,
  Edit3,
  CheckCircle2,
  Trophy,
  FileSpreadsheet,
  LogOut,
  ExternalLink,
} from 'lucide-react';

interface SidebarProps {
  userRole?: string;
  userName?: string;
}

export default function AdminSidebar({ userRole = 'SUPER_ADMIN', userName = 'Administrator' }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  const navItems = [
    { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard, roles: ['SUPER_ADMIN', 'PROGRAM_ADMIN', 'JUDGE', 'VERIFIER'] },
    { label: 'Festivals', href: '/admin/festivals', icon: Calendar, roles: ['SUPER_ADMIN'] },
    { label: 'Institutions', href: '/admin/institutions', icon: Building2, roles: ['SUPER_ADMIN'] },
    { label: 'Participants', href: '/admin/participants', icon: Users2, roles: ['SUPER_ADMIN', 'PROGRAM_ADMIN'] },
    { label: 'Programs & Events', href: '/admin/programs', icon: Award, roles: ['SUPER_ADMIN', 'PROGRAM_ADMIN'] },
    { label: 'Mark Entry Grid', href: '/admin/mark-entry', icon: Edit3, roles: ['SUPER_ADMIN', 'PROGRAM_ADMIN', 'JUDGE'] },
    { label: 'Result Verification', href: '/admin/verification', icon: CheckCircle2, roles: ['SUPER_ADMIN', 'VERIFIER'] },
    { label: 'Championship Board', href: '/admin/leaderboard', icon: Trophy, roles: ['SUPER_ADMIN', 'PROGRAM_ADMIN', 'VERIFIER'] },
    { label: 'Reports & Exports', href: '/admin/reports', icon: FileSpreadsheet, roles: ['SUPER_ADMIN', 'PROGRAM_ADMIN', 'VERIFIER'] },
  ];

  const filteredNav = navItems.filter((item) => item.roles.includes(userRole));

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-screen fixed left-0 top-0 z-30 select-none">
      {/* Brand Header */}
      <div className="h-16 px-6 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-sm shadow-indigo-200">
            <Trophy className="w-4 h-4" />
          </div>
          <div>
            <span className="font-semibold text-slate-900 tracking-tight text-sm block">FestResult OS</span>
            <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider block">Enterprise Result Engine</span>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
          Operations
        </div>
        {filteredNav.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/admin/dashboard' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-indigo-50 text-indigo-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Public Portal Shortcut */}
      <div className="px-3 py-2 border-t border-slate-100">
        <Link
          href="/"
          target="_blank"
          className="flex items-center justify-between px-3 py-2 text-xs font-medium text-slate-500 hover:text-indigo-600 hover:bg-slate-50 rounded-lg transition-colors"
        >
          <span className="flex items-center gap-2">
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            Public Live Portal
          </span>
          <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono">Live</span>
        </Link>
      </div>

      {/* User Footer */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/50">
        <div className="flex items-center justify-between px-2 py-1">
          <div className="truncate mr-2">
            <p className="text-xs font-semibold text-slate-800 truncate">{userName}</p>
            <span className="text-[10px] font-medium text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded inline-block mt-0.5">
              {userRole.replace('_', ' ')}
            </span>
          </div>
          <button
            onClick={handleLogout}
            title="Sign out"
            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-white rounded-md transition-colors border border-transparent hover:border-slate-200"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}


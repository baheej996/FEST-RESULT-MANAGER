import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import AdminSidebar from '@/components/admin-sidebar';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-slate-50/50 flex">
      {/* Fixed Sidebar */}
      <AdminSidebar userRole={user.role} userName={user.name} />

      {/* Main Content Area */}
      <div className="flex-1 ml-64 flex flex-col min-h-screen overflow-x-hidden">
        {children}
      </div>
    </div>
  );
}


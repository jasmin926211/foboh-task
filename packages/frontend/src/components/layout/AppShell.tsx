import { Outlet } from 'react-router-dom';
import { TopBar } from './TopBar';
import { Sidebar } from './Sidebar';
import { ScrollToTop } from '@/components/pricing/ScrollToTop';

export function AppShell() {
  return (
    <div className="min-h-screen bg-surface-page">
      <TopBar />
      <Sidebar />
      <main className="ml-[240px] pt-20">
        <div className="px-10 py-8">
          <Outlet />
        </div>
      </main>
      <ScrollToTop />
    </div>
  );
}

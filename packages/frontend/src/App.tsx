import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { AppShell } from './components/layout/AppShell';
import { ProductsPage } from './pages/products/ProductsPage';
import { ProfilesPage } from './pages/profiles/ProfilesPage';
import { ResolvedPricesPage } from './pages/resolved-prices/ResolvedPricesPage';
import { SetupPage } from './pages/pricing/SetupPage';

const queryClient = new QueryClient();

function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="rounded-card bg-surface-panel p-8">
      <h1 className="text-lg font-semibold text-ink-900">{title}</h1>
      <p className="mt-1 text-[13px] text-ink-500">This page is under development.</p>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route element={<AppShell />}>
            <Route path="/dashboard" element={<PlaceholderPage title="Dashboard" />} />
            <Route path="/orders" element={<PlaceholderPage title="Orders" />} />
            <Route path="/customers" element={<PlaceholderPage title="Customers" />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/pricing" element={<Navigate to="/pricing/profiles" replace />} />
            <Route path="/pricing/profiles" element={<ProfilesPage />} />
            <Route path="/pricing/setup" element={<SetupPage />} />
            <Route path="/pricing/setup/:id" element={<SetupPage />} />
            <Route path="/resolved-prices" element={<ResolvedPricesPage />} />
            <Route path="/freight" element={<PlaceholderPage title="Freight" />} />
            <Route path="/integrations" element={<PlaceholderPage title="Integrations" />} />
            <Route path="/settings" element={<PlaceholderPage title="Settings" />} />
            <Route path="/" element={<Navigate to="/pricing/profiles" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" />
    </QueryClientProvider>
  );
}

export default App;

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Toaster } from "sonner";
import { AppShell } from "./components/layout/AppShell";
import { ProductsPage } from "./pages/products/ProductsPage";
import { ProfilesPage } from "./pages/profiles/ProfilesPage";
import { ResolvedPricesPage } from "./pages/resolved-prices/ResolvedPricesPage";
import { SetupPage } from "./pages/pricing/SetupPage";
import { CustomersPage } from "./pages/customers/CustomersPage";
import { CustomerGroupsPage } from "./pages/customer-groups/CustomerGroupsPage";


function UnderDevelopmentPage({ title }: { title: string }) {
  return (
    <div className="rounded-card bg-surface-panel p-8">
      <h1 className="text-lg font-semibold text-ink-900">{title}</h1>
      <p className="mt-1 text-[13px] text-ink-500">
        This page is under development.
      </p>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route element={<AppShell />}>
            <Route
              path="/dashboard"
              element={<UnderDevelopmentPage title="Dashboard" />}
            />
            <Route
              path="/orders"
              element={<UnderDevelopmentPage title="Orders" />}
            />
            <Route path="/customers" element={<CustomersPage />} />
            <Route path="/customer-groups" element={<CustomerGroupsPage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route
              path="/pricing"
              element={<Navigate to="/pricing/profiles" replace />}
            />
            <Route path="/pricing/profiles" element={<ProfilesPage />} />
            <Route path="/pricing/setup" element={<SetupPage />} />
            <Route path="/pricing/setup/:id" element={<SetupPage />} />
            <Route path="/resolved-prices" element={<ResolvedPricesPage />} />
            <Route
              path="/freight"
              element={<UnderDevelopmentPage title="Freight" />}
            />
            <Route
              path="/integrations"
              element={<UnderDevelopmentPage title="Integrations" />}
            />
            <Route
              path="/settings"
              element={<UnderDevelopmentPage title="Settings" />}
            />
            <Route
              path="/"
              element={<Navigate to="/pricing/profiles" replace />}
            />
          </Route>
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" />
    </QueryClientProvider>
  );
}

export default App;

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Toaster } from "sonner";
import { ROUTES } from "@/lib/routes";
import { AppShell } from "./components/layout/AppShell";
import { ProductsPage } from "./pages/products/ProductsPage";
import { ProfilesPage } from "./pages/profiles/ProfilesPage";
import { ResolvedPricesPage } from "./pages/resolved-prices/ResolvedPricesPage";
import { SetupPage } from "./pages/pricing/SetupPage";
import { CustomersPage } from "./pages/customers/CustomersPage";
import { CustomerGroupsPage } from "./pages/customer-groups/CustomerGroupsPage";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route element={<AppShell />}>
            <Route path={ROUTES.CUSTOMERS} element={<CustomersPage />} />
            <Route path={ROUTES.CUSTOMER_GROUPS} element={<CustomerGroupsPage />} />
            <Route path={ROUTES.PRODUCTS} element={<ProductsPage />} />
            <Route
              path={ROUTES.PRICING}
              element={<Navigate to={ROUTES.PRICING_PROFILES} replace />}
            />
            <Route path={ROUTES.PRICING_PROFILES} element={<ProfilesPage />} />
            <Route path={ROUTES.PRICING_SETUP} element={<SetupPage />} />
            <Route path="/pricing/setup/:id" element={<SetupPage />} />
            <Route path={ROUTES.RESOLVED_PRICES} element={<ResolvedPricesPage />} />
            <Route
              path="/"
              element={<Navigate to={ROUTES.PRICING_PROFILES} replace />}
            />
          </Route>
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" />
    </QueryClientProvider>
  );
}

export default App;

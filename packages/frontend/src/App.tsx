import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import Layout from './components/layout/Layout';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<div className="text-gray-500">Products Page (coming soon)</div>} />
            <Route path="/profiles" element={<div className="text-gray-500">Profiles List (coming soon)</div>} />
            <Route path="/profiles/new" element={<div className="text-gray-500">Create Profile (coming soon)</div>} />
            <Route path="/profiles/:id/edit" element={<div className="text-gray-500">Edit Profile (coming soon)</div>} />
            <Route path="/resolved-prices" element={<div className="text-gray-500">Resolved Prices (coming soon)</div>} />
          </Route>
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" />
    </QueryClientProvider>
  );
}

export default App;

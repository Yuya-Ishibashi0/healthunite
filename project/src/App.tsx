import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SupabaseProvider } from './context/SupabaseProvider';
import Layout from './components/Layout';
import PrivateRoute from './components/PrivateRoute';
import Home from './pages/Home';
import Facilities from './pages/Facilities';
import Auth from './pages/Auth';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SupabaseProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            
            <Route element={<PrivateRoute />}>
              <Route element={<Layout />}>
                <Route index element={<Home />} />
                <Route path="facilities" element={<Facilities />} />
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </SupabaseProvider>
    </QueryClientProvider>
  );
}

export default App
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { AdminLayout, OperadorLayout } from './components/layout/Layout';

import Login from './pages/auth/Login';
import Dashboard from './pages/admin/Dashboard';
import Obras from './pages/admin/Obras';
import Funcoes from './pages/admin/Funcoes';
import Funcionarios from './pages/admin/Funcionarios';
import Relatorios from './pages/admin/Relatorios';
import PresencaPage from './pages/operador/Presenca';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="obras" element={<Obras />} />
            <Route path="funcoes" element={<Funcoes />} />
            <Route path="funcionarios" element={<Funcionarios />} />
            <Route path="presenca" element={<PresencaPage />} />
            <Route path="relatorios" element={<Relatorios />} />
          </Route>

          {/* Operator Routes */}
          <Route path="/operador" element={<OperadorLayout />}>
            <Route index element={<Navigate to="/operador/presenca" replace />} />
            <Route path="presenca" element={<PresencaPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

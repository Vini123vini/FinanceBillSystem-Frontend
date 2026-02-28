import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import { Spinner } from './components/UI'
import Dashboard from './pages/Dashboard'
import Invoices from './pages/Invoices'
import InvoiceDetail from './pages/InvoiceDetail'
import Clients from './pages/Clients'
import ClientDetail from './pages/ClientDetail'
import Payments from './pages/Payments'
import Products from './pages/Products'
import Expenses from './pages/Expenses'
import Reports from './pages/Reports'
import Settings from './pages/Settings'
import Login from './pages/Login'
import Register from './pages/Register'

function PrivateRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <Spinner />
  return user ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/login"    element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route index               element={<Dashboard />} />
        <Route path="invoices"     element={<Invoices />} />
        <Route path="invoices/:id" element={<InvoiceDetail />} />
        <Route path="clients"      element={<Clients />} />
        <Route path="clients/:id"  element={<ClientDetail />} />
        <Route path="payments"     element={<Payments />} />
        <Route path="products"     element={<Products />} />
        <Route path="expenses"     element={<Expenses />} />
        <Route path="reports"      element={<Reports />} />
        <Route path="settings"     element={<Settings />} />
      </Route>
    </Routes>
  )
}

import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Products from './pages/Products'
import Transactions from './pages/Transactions'
import Reports from './pages/Reports'

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/san-pham" element={<Products />} />
        <Route path="/nhap-xuat" element={<Transactions />} />
        <Route path="/bao-cao" element={<Reports />} />
      </Routes>
    </Layout>
  )
}

export default App

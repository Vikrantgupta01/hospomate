import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Login from './pages/Login';
import Register from './pages/Register';
import StoreList from './pages/StoreList';
import StoreMenu from './pages/StoreMenu';
import Cart from './pages/Cart';
import StoreDashboard from './pages/StoreDashboard';
import StaffDashboard from './pages/StaffDashboard';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<StoreList />} />
            <Route path="/store/:id" element={<StoreMenu />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/dashboard" element={<StoreDashboard />} />
            <Route path="/staff" element={<StaffDashboard />} />
          </Routes>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;

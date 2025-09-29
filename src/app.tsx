import { BrowserRouter, Routes, Route } from 'react-router-dom';
import UserAuth from './UserAuth';
import Overview from './OverviewPage';
import Dashboard from './Dashboard';
import './style.css';
import Wishlist from './WishlistPage';
import Home from './Home';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Create a wrapper component to handle the protected routes and user context
const ProtectedRoutes = () => {
  return (
    <ProtectedRoute>
      <Home>
        <Routes>
          <Route index element={<Overview />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/wishlist" element={<Wishlist />} />
        </Routes>
      </Home>
    </ProtectedRoute>
  );
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<UserAuth />} />
          <Route path="/*" element={<ProtectedRoutes />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
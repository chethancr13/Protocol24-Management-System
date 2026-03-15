import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
  const isStorageAvailable = () => {
    try {
      localStorage.setItem('test', 'test');
      localStorage.removeItem('test');
      return true;
    } catch (e) {
      return false;
    }
  };

  if (!isStorageAvailable()) {
    console.warn('LocalStorage is not available. Authentication cannot be verified.');
    return <Navigate to="/login" replace />;
  }

  const authState = localStorage.getItem('protocol24-auth');
  const userState = localStorage.getItem('protocol24-user');
  
  const isAuthenticated = authState === 'authenticated' && !!userState;
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;

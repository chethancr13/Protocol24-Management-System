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
  const userJson = localStorage.getItem('protocol24-user');
  
  if (!authState || !userJson) {
     return <Navigate to="/login" replace />;
  }

  const user = JSON.parse(userJson);
  const loginTime = user.loginTime || 0;
  const hoursElapsed = (Date.now() - loginTime) / (1000 * 60 * 60);

  if (hoursElapsed > 24) {
    localStorage.removeItem('protocol24-auth');
    localStorage.removeItem('protocol24-user');
    return <Navigate to="/login" replace />;
  }
  
  const isAuthenticated = authState === 'authenticated';
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;

import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '@/store';

const AuthRedirect: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  useEffect(() => {
    // Check if there's a redirect URL stored in localStorage
    const redirectUrl = localStorage.getItem('redirectAfterLogin');
    if (redirectUrl && isAuthenticated && location.pathname !== redirectUrl) {
      localStorage.removeItem('redirectAfterLogin'); // Clear the stored URL
      navigate(redirectUrl);
    }
  }, [isAuthenticated, location.pathname, navigate]);

  return null; // This component doesn't render anything
};

export default AuthRedirect; 
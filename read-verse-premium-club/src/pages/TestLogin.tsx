import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppDispatch } from '@/store';
import { setUser } from '@/store/slices/authSlice';
import { setToken, authFetch } from '@/lib/api';

const TestLogin: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');

  const testLogin = async (email: string, password: string, role: string) => {
    setLoading(true);
    setStatus(`Testing login for ${role}...`);
    
    try {
      const res = await authFetch('/auth/signin', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setToken(data.token);
        dispatch(setUser(data.user));
        setStatus(`✅ ${role} login successful! Redirecting...`);
        
        setTimeout(() => {
          if (data.user.role === 'admin') {
            navigate('/admin-dashboard');
          } else if (data.user.role === 'author') {
            navigate('/author-dashboard');
          } else {
            navigate('/customer-dashboard');
          }
        }, 1000);
      } else {
        setStatus(`❌ ${role} login failed: ${data.message}`);
      }
    } catch (error: any) {
      setStatus(`❌ ${role} login error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Test Login</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Button 
              onClick={() => testLogin('admin@test.com', 'admin123', 'Admin')}
              disabled={loading}
              className="w-full"
            >
              Test Admin Login
            </Button>
            <Button 
              onClick={() => testLogin('customer@test.com', 'customer123', 'Customer')}
              disabled={loading}
              className="w-full"
              variant="outline"
            >
              Test Customer Login
            </Button>
            <Button 
              onClick={() => testLogin('author@test.com', 'author123', 'Author')}
              disabled={loading}
              className="w-full"
              variant="outline"
            >
              Test Author Login
            </Button>
          </div>
          
          {status && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded">
              <p className="text-sm text-blue-800">{status}</p>
            </div>
          )}
          
          <div className="text-xs text-gray-500 text-center">
            <p>Test Credentials:</p>
            <p>Admin: admin@test.com / admin123</p>
            <p>Customer: customer@test.com / customer123</p>
            <p>Author: author@test.com / author123</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TestLogin; 
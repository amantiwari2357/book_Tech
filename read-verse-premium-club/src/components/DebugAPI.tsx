import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { authFetch } from '@/lib/api';

const DebugAPI: React.FC = () => {
  const [status, setStatus] = useState<string>('');
  const [error, setError] = useState<string>('');

  const testAPI = async () => {
    setStatus('Testing API connection...');
    setError('');
    
    try {
      const response = await authFetch('/auth/signin', {
        method: 'POST',
        body: JSON.stringify({ email: 'admin@test.com', password: 'admin123' }),
      });
      
      setStatus(`API Response: ${response.status} ${response.statusText}`);
    } catch (err: any) {
      setError(`API Error: ${err.message}`);
      setStatus('API test failed');
    }
  };

  const testCORS = async () => {
    setStatus('Testing CORS...');
    setError('');
    
    try {
      const response = await fetch('https://book-tech.onrender.com/api/cors-test', {
        method: 'GET',
        headers: {
          'Origin': window.location.origin,
          'Accept': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setStatus(`CORS Response: ${response.status} ${response.statusText} - ${data.message}`);
      } else {
        setError(`CORS Error: ${response.status} ${response.statusText}`);
        setStatus('CORS test failed');
      }
    } catch (err: any) {
      setError(`CORS Error: ${err.message}`);
      setStatus('CORS test failed');
    }
  };

  const testBackendHealth = async () => {
    setStatus('Testing backend health...');
    setError('');
    
    try {
      const response = await fetch('https://book-tech.onrender.com/api/test', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setStatus(`Backend Health: ${response.status} - ${data.message}`);
      } else {
        setError(`Backend Error: ${response.status} ${response.statusText}`);
        setStatus('Backend health check failed');
      }
    } catch (err: any) {
      setError(`Backend Error: ${err.message}`);
      setStatus('Backend health check failed');
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto mt-8">
      <CardHeader>
        <CardTitle>API Debug Tool</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Button onClick={testBackendHealth} className="w-full">
            Test Backend Health
          </Button>
          <Button onClick={testCORS} variant="outline" className="w-full">
            Test CORS
          </Button>
          <Button onClick={testAPI} variant="outline" className="w-full">
            Test API Connection
          </Button>
        </div>
        
        {status && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded">
            <p className="text-sm text-blue-800">{status}</p>
          </div>
        )}
        
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}
        
        <div className="text-xs text-gray-500">
          <p>API URL: {import.meta.env.VITE_API_URL || 'https://book-tech.onrender.com/api'}</p>
          <p>Current Origin: {window.location.origin}</p>
          <p>User Agent: {navigator.userAgent.substring(0, 50)}...</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default DebugAPI; 
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
        body: JSON.stringify({ email: 'test@example.com', password: 'test' }),
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
      const response = await fetch('https://book-tech.onrender.com/api/auth/signin', {
        method: 'OPTIONS',
        headers: {
          'Origin': window.location.origin,
        },
      });
      
      setStatus(`CORS Response: ${response.status} ${response.statusText}`);
    } catch (err: any) {
      setError(`CORS Error: ${err.message}`);
      setStatus('CORS test failed');
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto mt-8">
      <CardHeader>
        <CardTitle>API Debug Tool</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Button onClick={testAPI} className="w-full">
            Test API Connection
          </Button>
          <Button onClick={testCORS} variant="outline" className="w-full">
            Test CORS
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
        </div>
      </CardContent>
    </Card>
  );
};

export default DebugAPI; 
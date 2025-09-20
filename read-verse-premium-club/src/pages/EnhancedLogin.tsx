import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpenIcon, 
  UserIcon, 
  PencilIcon,
  EyeIcon,
  EyeSlashIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { useAppDispatch } from '@/store';
import { setUser } from '@/store/slices/authSlice';
import { setToken, authFetch } from '@/lib/api';
import { toast } from '@/hooks/use-toast';

const EnhancedLogin: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginType, setLoginType] = useState<'user' | 'author'>('user');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    if (!email || !password) {
      setError('Please enter both email and password');
      setLoading(false);
      return;
    }
    
    try {
      console.log(`Attempting ${loginType} login with email:`, email);
      
      const res = await authFetch('/auth/signin', {
        method: 'POST',
        body: JSON.stringify({ 
          email, 
          password,
          userType: loginType 
        }),
      });
      
      const data = await res.json();
      console.log('Login response:', data);
      
      if (res.ok) {
        setToken(data.token);
        dispatch(setUser(data.user));
        
        toast({
          title: "Login Successful!",
          description: `Welcome back, ${data.user.name}!`,
        });
        
        // Check if there's a redirect URL stored in localStorage
        const redirectUrl = localStorage.getItem('redirectAfterLogin');
        if (redirectUrl) {
          localStorage.removeItem('redirectAfterLogin');
          navigate(redirectUrl);
        } else {
          // Default navigation based on user role
          if (data.user.role === 'author') {
            navigate('/author-dashboard');
          } else if (data.user.role === 'admin') {
            navigate('/admin-dashboard');
          } else if (data.user.role === 'delivery_boy') {
            navigate('/delivery-boy-dashboard');
          } else {
            navigate('/user-dashboard');
          }
        }
      } else {
        setError(data.message || 'Login failed. Please check your credentials.');
        toast({
          title: "Login Failed",
          description: data.message || 'Invalid credentials',
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Network error. Please try again.');
      toast({
        title: "Login Error",
        description: "Network error. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = (type: 'user' | 'author' | 'admin') => {
    const demoCredentials = {
      user: { email: 'user@demo.com', password: 'password123' },
      author: { email: 'author@demo.com', password: 'password123' },
      admin: { email: 'admin@demo.com', password: 'password123' }
    };
    
    setEmail(demoCredentials[type].email);
    setPassword(demoCredentials[type].password);
    setLoginType(type === 'admin' ? 'user' : type);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <BookOpenIcon className="h-12 w-12 text-blue-600" />
            <span className="ml-3 text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              BookTech
            </span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back!</h1>
          <p className="text-gray-600">Sign in to your account to continue</p>
        </div>

        {/* Login Form */}
        <Card className="shadow-xl border-0">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl">Sign In</CardTitle>
            <CardDescription>
              Choose your account type and sign in
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={loginType} onValueChange={(value: any) => setLoginType(value)} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="user" className="flex items-center gap-2">
                  <UserIcon className="h-4 w-4" />
                  Reader
                </TabsTrigger>
                <TabsTrigger value="author" className="flex items-center gap-2">
                  <PencilIcon className="h-4 w-4" />
                  Author
                </TabsTrigger>
              </TabsList>

              <TabsContent value="user">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="reader@example.com"
                      required
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="password">Password</Label>
                    <div className="relative mt-1">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        required
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeSlashIcon className="h-4 w-4" />
                        ) : (
                          <EyeIcon className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {error && (
                    <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
                      <span className="text-sm text-red-700">{error}</span>
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Signing In...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        Sign In as Reader
                        <ArrowRightIcon className="h-4 w-4" />
                      </div>
                    )}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="author">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <Label htmlFor="author-email">Email</Label>
                    <Input
                      id="author-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="author@example.com"
                      required
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="author-password">Password</Label>
                    <div className="relative mt-1">
                      <Input
                        id="author-password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        required
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeSlashIcon className="h-4 w-4" />
                        ) : (
                          <EyeIcon className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {error && (
                    <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
                      <span className="text-sm text-red-700">{error}</span>
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Signing In...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        Sign In as Author
                        <ArrowRightIcon className="h-4 w-4" />
                      </div>
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            {/* Demo Login Buttons */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-600 text-center mb-4">Try Demo Accounts</p>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDemoLogin('user')}
                  className="text-xs"
                >
                  <UserIcon className="h-3 w-3 mr-1" />
                  Reader
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDemoLogin('author')}
                  className="text-xs"
                >
                  <PencilIcon className="h-3 w-3 mr-1" />
                  Author
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDemoLogin('admin')}
                  className="text-xs"
                >
                  <UserIcon className="h-3 w-3 mr-1" />
                  Admin
                </Button>
              </div>
            </div>

            {/* Links */}
            <div className="mt-6 text-center space-y-2">
              <Link
                to="/forgot-password"
                className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
              >
                Forgot your password?
              </Link>
              <div className="text-sm text-gray-600">
                Don't have an account?{' '}
                <Link
                  to="/signup"
                  className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                >
                  Sign up here
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Features */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-white rounded-lg shadow-sm">
            <CheckCircleIcon className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <h3 className="font-semibold text-sm">Secure Login</h3>
            <p className="text-xs text-gray-600">Your data is protected</p>
          </div>
          <div className="text-center p-4 bg-white rounded-lg shadow-sm">
            <BookOpenIcon className="h-8 w-8 text-blue-500 mx-auto mb-2" />
            <h3 className="font-semibold text-sm">Unlimited Access</h3>
            <p className="text-xs text-gray-600">Read without limits</p>
          </div>
          <div className="text-center p-4 bg-white rounded-lg shadow-sm">
            <UserIcon className="h-8 w-8 text-purple-500 mx-auto mb-2" />
            <h3 className="font-semibold text-sm">Personalized</h3>
            <p className="text-xs text-gray-600">Tailored experience</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedLogin;

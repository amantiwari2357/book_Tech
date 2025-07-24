import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { BookOpenIcon } from '@heroicons/react/24/outline';
import { useAppDispatch } from '@/store';
import { setUser } from '@/store/slices/authSlice';
import { setToken, authFetch } from '@/lib/api';

const AuthForm: React.FC = () => {
  const [tab, setTab] = useState<'signin' | 'signup'>('signin');
  // Shared
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  // Sign In
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [signInError, setSignInError] = useState('');
  // Sign Up
  const [signUpName, setSignUpName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpError, setSignUpError] = useState('');

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignInError('');
    try {
      const res = await authFetch('/auth/signin', {
        method: 'POST',
        body: JSON.stringify({ email: signInEmail, password: signInPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setToken(data.token);
        dispatch(setUser(data.user));
        navigate('/');
      } else {
        setSignInError(data.message || 'Sign in failed');
      }
    } catch {
      setSignInError('Sign in failed');
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignUpError('');
    try {
      const res = await authFetch('/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ name: signUpName, email: signUpEmail, password: signUpPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setToken(data.token);
        dispatch(setUser(data.user));
        navigate('/');
      } else {
        setSignUpError(data.message || 'Sign up failed');
      }
    } catch {
      setSignUpError('Sign up failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 px-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center space-x-2">
            <BookOpenIcon className="h-8 w-8 text-primary" />
            <span className="text-2xl font-serif font-bold text-primary">BookTech</span>
          </Link>
        </div>
        <div className="flex justify-center mb-4">
          <button
            className={`px-4 py-2 rounded-t-md font-semibold focus:outline-none ${tab === 'signin' ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}
            onClick={() => setTab('signin')}
          >
            Sign In
          </button>
          <button
            className={`px-4 py-2 rounded-t-md font-semibold focus:outline-none ${tab === 'signup' ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}
            onClick={() => setTab('signup')}
          >
            Sign Up
          </button>
        </div>
        <Card className="border-border/50 shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">
              {tab === 'signin' ? 'Sign in' : 'Create account'}
            </CardTitle>
            <CardDescription className="text-center">
              {tab === 'signin'
                ? 'Enter your email and password to access your library'
                : 'Enter your information to get started'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {tab === 'signin' ? (
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signInEmail">Email</Label>
                  <Input
                    id="signInEmail"
                    name="signInEmail"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="Enter your email"
                    value={signInEmail}
                    onChange={e => setSignInEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signInPassword">Password</Label>
                  <Input
                    id="signInPassword"
                    name="signInPassword"
                    type="password"
                    autoComplete="current-password"
                    required
                    placeholder="Enter your password"
                    value={signInPassword}
                    onChange={e => setSignInPassword(e.target.value)}
                  />
                </div>
                {signInError && <p className="text-red-500 text-sm">{signInError}</p>}
                <Button type="submit" className="w-full">Sign in</Button>
              </form>
            ) : (
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signUpName">Name</Label>
                  <Input
                    id="signUpName"
                    name="signUpName"
                    type="text"
                    autoComplete="name"
                    required
                    placeholder="Your name"
                    value={signUpName}
                    onChange={e => setSignUpName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signUpEmail">Email</Label>
                  <Input
                    id="signUpEmail"
                    name="signUpEmail"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="Enter your email"
                    value={signUpEmail}
                    onChange={e => setSignUpEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signUpPassword">Password</Label>
                  <Input
                    id="signUpPassword"
                    name="signUpPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    placeholder="Create a strong password"
                    value={signUpPassword}
                    onChange={e => setSignUpPassword(e.target.value)}
                  />
                </div>
                {signUpError && <p className="text-red-500 text-sm">{signUpError}</p>}
                <Button type="submit" className="w-full">Create account</Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AuthForm; 
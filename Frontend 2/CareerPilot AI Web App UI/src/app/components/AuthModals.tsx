import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { authService } from '../../services/api';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

interface AuthModalsProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  defaultTab?: 'login' | 'signup';
}

export function AuthModals({ isOpen, onOpenChange, defaultTab = 'login' }: AuthModalsProps) {
  const [tab, setTab] = useState<'login' | 'signup'>(defaultTab);
  const [username, setUsername] = useState(() => localStorage.getItem('saved_username') || '');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (tab === 'login') {
        const res = await authService.login({ username, password });
        const token = res.data.access || res.data.access_token || res.data.token || res.data.key;
        if (token) {
          await login(token);
          toast.success('Successfully logged in!');
          onOpenChange(false);
        } else {
          toast.error('Invalid response from server.');
        }
      } else {
        const res = await authService.signup({ username, email, password });
        const token = res.data.access || res.data.access_token || res.data.token || res.data.key;
        if (token) {
          await login(token);
          toast.success('Account created successfully!');
          onOpenChange(false);
        } else {
          // If signup is successful but doesn't return a token, switch to login tab
          toast.success('Account created! Please log in.');
          setTab('login');
        }
      }
    } catch (error: any) {
      // No console.error in production
      let errorMessage = 'Authentication failed. Please try again.';
      
      if (error.response?.data) {
        if (error.response.data.errors) {
          const firstErrorList = Object.values(error.response.data.errors)[0];
          if (Array.isArray(firstErrorList) && firstErrorList.length > 0) {
            errorMessage = firstErrorList[0] as string;
          }
        } else if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        } else if (error.response.data.error) {
          errorMessage = error.response.data.error;
        } else if (error.response.data.detail) {
          errorMessage = error.response.data.detail;
        } else {
          // Attempt to extract field-specific errors
          const firstError = Object.values(error.response.data)[0];
          if (Array.isArray(firstError) && firstError.length > 0) {
            errorMessage = firstError[0] as string;
          } else if (typeof firstError === 'string') {
            errorMessage = firstError;
          }
        }
      } else if (error.message) {
        errorMessage = error.message;
        if (errorMessage.toLowerCase().includes('network error')) {
          errorMessage = 'Cannot connect to server. Is the Django backend running?';
        }
      }
      
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md border-0" style={{ 
        background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
      }}>
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
            {tab === 'login' ? 'Welcome Back' : 'Create Account'}
          </DialogTitle>
          <DialogDescription>
            {tab === 'login' 
              ? 'Enter your credentials to access your CareerPilot companion.'
              : 'Sign up to start navigating your career journey with AI.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Username</label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                localStorage.setItem('saved_username', e.target.value);
              }}
              className="w-full px-4 py-3 bg-white rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
              placeholder="e.g. johndoe"
            />
          </div>

          {tab === 'signup' && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-white rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                placeholder="you@example.com"
              />
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-white rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 mt-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all disabled:opacity-70"
          >
            {isLoading ? 'Processing...' : tab === 'login' ? 'Sign In' : 'Sign Up'}
          </button>
        </form>

        <div className="mt-4 text-center text-sm text-gray-600">
          {tab === 'login' ? "Don't have an account? " : "Already have an account? "}
          <button 
            type="button" 
            onClick={() => { setTab(tab === 'login' ? 'signup' : 'login'); setPassword(''); }}
            className="text-blue-600 font-medium hover:underline"
          >
            {tab === 'login' ? 'Sign up' : 'Log in'}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

import React, { useState } from 'react';
import { Button, Card, Input } from './UI';
import { User, Lock, Mail, AlertCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type AuthMode = 'login' | 'register' | 'forgot';

export const Auth = ({ onAuthSuccess }: { onAuthSuccess: (user: any) => void }) => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    if (!email || !password) return "Email and password are required";
    if (mode === 'register' && !username) return "Username is required";
    if (!/\S+@\S+\.\S+/.test(email)) return "Invalid email format";
    if (password.length < 6) return "Password must be at least 6 characters";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);
    try {
      const API_URL = 'https://smartlearn-ai-test-study-platform.onrender.com';
const endpoint = mode === 'login' ? `${API_URL}/api/auth/login` : `${API_URL}/api/auth/register`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, username }),
      });

      const data = await response.json();

      if (data.success) {
        onAuthSuccess(data.user);
      } else {
        setError(data.message || "Authentication failed");
      }
    } catch (err) {
      setError("Connection error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl flex flex-col md:flex-row min-h-[500px] overflow-hidden">
        {/* Left Side: Form */}
        <div className="flex-1 p-8 md:p-12 flex flex-col justify-center bg-white">
          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                {mode === 'login' ? 'Login' : mode === 'register' ? 'Create Account' : 'Reset Password'}
              </h2>
              <p className="text-gray-500 mb-6">
                {mode === 'login' ? 'Welcome back! Please enter your details.' : 
                 mode === 'register' ? 'Join us and start your learning journey.' : 
                 'Enter your email to receive a reset link.'}
              </p>

              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600 text-sm"
                >
                  <AlertCircle size={18} />
                  {error}
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === 'register' && (
                  <div className="relative">
                    <User className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                    <Input 
                      placeholder="Username" 
                      className="pl-10" 
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                    />
                  </div>
                )}
                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                  <Input 
                    type="email" 
                    placeholder="Email Address" 
                    className="pl-10" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                {mode !== 'forgot' && (
                  <div className="relative">
                    <Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                    <Input 
                      type="password" 
                      placeholder="Password" 
                      className="pl-10" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                )}

                {mode === 'login' && (
                  <div className="flex justify-end">
                    <button 
                      type="button"
                      onClick={() => setMode('forgot')}
                      className="text-sm font-medium text-blue-600 hover:text-blue-700"
                    >
                      Forgot Password?
                    </button>
                  </div>
                )}

                <Button type="submit" className="w-full py-6 text-lg" disabled={isLoading}>
                  {isLoading ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    mode === 'login' ? 'Login' : mode === 'register' ? 'Register' : 'Send Link'
                  )}
                </Button>
              </form>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Right Side: Welcome/Switch */}
        <div className="flex-1 bg-blue-600 p-8 md:p-12 flex flex-col items-center justify-center text-center text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-indigo-700 opacity-90" />
          <div className="relative z-10">
            <h2 className="text-4xl font-bold mb-4">
              {mode === 'login' ? 'Hello, Friend!' : 'Welcome Back!'}
            </h2>
            <p className="text-blue-100 mb-8 text-lg">
              {mode === 'login' ? "Don't have an account? Register now and start learning." : 
               "Already have an account? Login to access your dashboard."}
            </p>
            <Button 
              variant="outline" 
              className="border-white text-white hover:bg-white/10 px-8"
              onClick={() => {
                setMode(mode === 'login' ? 'register' : 'login');
                setError(null);
              }}
            >
              {mode === 'login' ? 'Register' : 'Login'}
            </Button>
          </div>
          
          {/* Decorative circles */}
          <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -top-20 -left-20 w-64 h-64 bg-blue-400/20 rounded-full blur-3xl" />
        </div>
      </Card>
    </div>
  );
};

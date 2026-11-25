import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Mail, Lock, User, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Input } from '../components/Input';
import { Button } from '../components/Button';

export const LoginPage = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('demo@edumind.ai');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);

  const { login, register } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password || (isRegister && !name)) {
      addToast('Please fill in all required fields', 'error');
      return;
    }

    setLoading(true);
    try {
      if (isRegister) {
        await register(name, email, password);
        addToast('Account created successfully!', 'success');
      } else {
        await login(email, password);
        addToast('Welcome back!', 'success');
      }
      navigate('/');
    } catch (err) {
      addToast(err.message || 'Authentication failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-mesh-texture flex items-center justify-center p-4 relative overflow-hidden">
      {/* 3D Liquid Orbs */}
      <div className="liquid-orb top-1/4 left-1/3 w-[500px] h-[500px] bg-sky-200/40 pointer-events-none" />

      <div className="w-full max-w-md liquid-glass rounded-3xl p-8 md:p-10 shadow-2xl relative z-10 border border-white/90 dark:border-white/10">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-slate-900 dark:bg-white/[0.08] border border-slate-800 dark:border-white/20 flex items-center justify-center shadow-md mb-4 text-white">
            <GraduationCap className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            {isRegister ? 'Join EduMind' : 'Sign in to EduMind'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {isRegister
              ? 'Autonomous curriculum engineering platform'
              : 'Enter your credentials to access your curriculum studio'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <Input
              label="Full Name"
              type="text"
              placeholder="e.g. Sarah Connor"
              icon={User}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          )}

          <Input
            label="Email Address"
            type="email"
            placeholder="instructor@edumind.ai"
            icon={Mail}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            icon={Lock}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <Button
            type="submit"
            variant="primary"
            className="w-full mt-2"
            isLoading={loading}
            icon={ArrowRight}
          >
            {isRegister ? 'Create Account' : 'Sign In'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => setIsRegister(!isRegister)}
            className="text-xs text-slate-500 hover:text-slate-900 font-medium transition-colors cursor-pointer"
          >
            {isRegister
              ? 'Already have an account? Sign in'
              : "Don't have an account? Create one"}
          </button>
        </div>
      </div>
    </div>
  );
};

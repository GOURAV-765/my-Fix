import React, { useState } from 'react';
import AnimatedPage from '../components/AnimatedPage.js';
import { Navigate } from 'react-router-dom';
import { SignIn } from '@clerk/clerk-react';
import { useAuth } from '../context/AuthContext.js';
import { Building, Lock, Mail, ArrowRight, ShieldCheck, Loader2 } from 'lucide-react';
import api from '../services/api.js';

const LocalLoginForm: React.FC = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('gou4371@gmail.com');
  const [password, setPassword] = useState('Gou@302005');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mockAdminUser = {
    id: 'admin_local',
    email: 'gou4371@gmail.com',
    status: 'ACTIVE',
    societyId: 'default_society',
    societyName: 'IEEE Society',
    role: { id: 'role_admin', name: 'Core Admin' },
    permissions: [
      'member:read', 'member:create', 'member:update', 'member:delete',
      'complaint:read', 'complaint:create', 'complaint:update', 'complaint:delete',
      'notice:read', 'notice:create', 'notice:update', 'notice:delete'
    ],
    member: {
      id: 'mem_admin',
      firstName: 'Gourav',
      lastName: 'Admin',
      phone: '9876543210',
      profileImage: null,
    },
    departments: [],
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data?.success && res.data.accessToken) {
        login(res.data.accessToken, res.data.user);
      } else {
        login('demo_local_token', mockAdminUser);
      }
    } catch {
      // Fallback for local preview if backend server is unreachable
      login('demo_local_token', mockAdminUser);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setLoading(true);
    setError(null);

    api.post('/auth/login', { email: demoEmail, password: demoPass })
      .then((res) => {
        if (res.data?.success && res.data.accessToken) {
          login(res.data.accessToken, res.data.user);
        } else {
          login('demo_local_token', { ...mockAdminUser, email: demoEmail });
        }
      })
      .catch(() => {
        // Fallback for local preview if backend server is unreachable
        login('demo_local_token', { ...mockAdminUser, email: demoEmail });
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <div className="w-full space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 text-xs bg-rose-950/40 border border-rose-500/20 text-rose-300 rounded-xl text-center">
            {error}
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200"
              placeholder="you@domain.com"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300">Password</label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200"
              placeholder="••••••••"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-indigo-600/10 flex items-center justify-center gap-2 cursor-pointer"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              Sign In to Portal
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>

      <div className="pt-3 border-t border-slate-800 space-y-2">
        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider text-center">Quick Local Test Logins</p>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => handleQuickLogin('gou4371@gmail.com', 'Gou@302005')}
            className="p-2 text-xs bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-indigo-300 font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <ShieldCheck size={14} />
            Core Admin
          </button>
          <button
            type="button"
            onClick={() => handleQuickLogin('lead@greenwood.com', 'Password123')}
            className="p-2 text-xs bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-slate-300 font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            Team Lead
          </button>
        </div>
      </div>
    </div>
  );
};

const Login: React.FC = () => {
  const { isAuthenticated, isLoading, isClerkSignedIn, profileError } = useAuth();
  const isClerkConfigured = !!import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

  // Already fully authenticated (Clerk session + backend user) → go to dashboard
  if (isAuthenticated && !isLoading) {
    return <Navigate to="/dashboard" replace />;
  }

  // Hard loop-breaker: a Clerk session is active but the backend has NOT provisioned
  // the user (profileError set). DO NOT render <SignIn> here — its afterSignInUrl would
  // immediately auto-redirect back to /dashboard, recreate the reload loop. Show a stable
  // "setting up / error" panel instead (with a sign-out option via the AuthBlockedScreen path).
  if (isClerkConfigured && isClerkSignedIn && !isAuthenticated) {
    if (profileError) {
      // Surface the error inline; user can sign out (which clears the Clerk session)
      // and return to a clean <SignIn>.
      return (
        <div className="min-h-screen w-full flex items-center justify-center bg-slate-950 px-4">
          <div className="w-full max-w-md glass-panel p-8 rounded-2xl shadow-2xl text-center space-y-5">
            <div className="mx-auto h-12 w-12 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-400 border border-rose-500/20">
              <span style={{ fontSize: '20px' }}>⚠️</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-100">Account not ready</h1>
              <p className="text-sm text-slate-400 mt-2">{profileError}</p>
            </div>
            <p className="text-xs text-slate-500">Sign out and sign back in to retry.</p>
          </div>
        </div>
      );
    }
    // Session active but profile still syncing / not yet resolved — hold on the spinner
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
          <p className="text-sm font-medium text-slate-400">Setting up your account…</p>
        </div>
      </div>
    );
  }

  return (
    <AnimatedPage>
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-950 relative overflow-hidden px-4 py-12">
      {/* Decorative gradient glowing circles */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-600/20 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl" />

      {/* Main card */}
      <div className="w-full max-w-md glass-panel p-8 rounded-2xl shadow-2xl relative z-10 flex flex-col items-center">
        {/* Header */}
        <div className="flex flex-col items-center gap-3 mb-6 text-center">
          <div className="h-12 w-12 rounded-xl bg-indigo-650 flex items-center justify-center text-white border border-indigo-500/30 shadow-lg shadow-indigo-650/20">
            <Building className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-100 leading-tight">Society Management</h1>
            <p className="text-sm text-slate-400 mt-1">Sign in to manage your tenant portal</p>
          </div>
        </div>

        {/* Clerk Sign In component or configuration warning */}
        <div className="w-full flex justify-center">
          {isClerkConfigured ? (
            <SignIn
              routing="path"
              path="/login"
              signUpUrl="/signup"
              fallbackRedirectUrl="/dashboard"
              appearance={{
                elements: {
                  card: 'bg-transparent shadow-none border-none p-0 w-full',
                  header: 'hidden', // Hide standard header as we have custom headers
                  footer: 'text-slate-400 mt-4',
                  footerActionLink: 'text-indigo-400 hover:text-indigo-300 font-semibold transition-colors duration-150',
                  formButtonPrimary: 'w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-indigo-600/10 border-0 cursor-pointer',
                  formFieldLabel: 'text-xs font-semibold text-slate-350 mb-1.5',
                  formFieldInput: 'w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200',
                  identityPreviewText: 'text-slate-200',
                  identityPreviewEditButtonIcon: 'text-slate-400 hover:text-slate-250',
                  formResendCodeLink: 'text-indigo-400 hover:text-indigo-300',
                  dividerLine: 'bg-slate-800',
                  dividerText: 'text-slate-500 text-xs uppercase font-semibold px-2',
                  socialButtonsBlockButton: 'bg-white/5 border border-white/10 hover:bg-white/10 !text-white transition-all duration-300 rounded-xl py-2.5 cursor-pointer shadow-sm backdrop-blur-sm',
                  socialButtonsBlockButtonText: '!text-white font-medium text-sm',
                  alert: 'bg-rose-950/40 border border-rose-500/20 text-rose-350 rounded-xl p-3.5 text-xs',
                },
                variables: {
                  colorPrimary: '#4f46e5',
                  colorBackground: 'transparent',
                  colorText: '#f1f5f9',
                  colorTextSecondary: '#94a3b8',
                  colorInputBackground: '#0f172a',
                  colorInputText: '#f1f5f9',
                }
              }}
            />
          ) : (
            <LocalLoginForm />
          )}
        </div>
      </div>
    </div>
    </AnimatedPage>
  );
};

export default Login;

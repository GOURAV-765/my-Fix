import React from 'react';
import { Navigate } from 'react-router-dom';
import { SignUp } from '@clerk/clerk-react';
import { useAuth } from '../context/AuthContext.js';
import { Building, ShieldAlert } from 'lucide-react';
import AnimatedPage from '../components/AnimatedPage.js';

const Signup: React.FC = () => {
 const { isAuthenticated, isLoading, isClerkSignedIn, profileError } = useAuth();
 const isClerkConfigured = !!import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

 // Already fully authenticated → go to dashboard
 if (isAuthenticated && !isLoading) {
 return <Navigate to="/dashboard" replace />;
 }

 // Hard loop-breaker: a Clerk session is active but backend has not provisioned the user.
 // Don't render <SignUp> (its afterSignUpUrl would bounce back into the loop).
 if (isClerkConfigured && isClerkSignedIn && !isAuthenticated) {
 if (profileError) {
 return (
 <div className="min-h-screen w-full flex items-center justify-center bg-slate-955 px-4">
 <div className="w-full max-w-md bg-cardBg shadow-sm p-8 rounded-xl shadow-2xl text-center space-y-5">
 <div className="mx-auto h-12 w-12 rounded-full bg-error/10 flex items-center justify-center text-error border border-error/20">
 <span style={{ fontSize: '20px' }}>⚠️</span>
 </div>
 <div>
 <h1 className="text-xl font-bold text-textPrimary">Account not ready</h1>
 <p className="text-sm text-textMuted mt-2">
 {profileError}
 </p>
 </div>
 <p className="text-xs text-slate-500">Sign out and sign back in to retry.</p>
 </div>
 </div>
 );
 }
 return (
 <div className="min-h-screen w-full flex items-center justify-center bg-appBg">
 <div className="flex flex-col items-center gap-4">
 <div className="h-12 w-12 animate-spin rounded-full border-4 border-ieeeBlue border-t-transparent"></div>
 <p className="text-sm font-medium text-textMuted">Setting up your account…</p>
 </div>
 </div>
 );
 }

 return (
 <AnimatedPage>
 <div className="min-h-screen w-full flex items-center justify-center bg-appBg relative overflow-hidden px-4 py-12">
 {/* Decorative gradient glowing circles */}
 <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-ieeeBlue/20 rounded-full blur-3xl" />
 <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-80 h-80 bg-techTeal/20 rounded-full blur-3xl" />

 {/* Main card */}
 <div className="w-full max-w-md bg-cardBg shadow-sm p-8 rounded-xl shadow-2xl relative z-10 flex flex-col items-center">
 {/* Header */}
 <div className="flex flex-col items-center gap-3 mb-6 text-center">
 <div className="h-12 w-12 rounded-xl bg-ieeeBlue flex items-center justify-center text-white border border-ieeeBlue/30 shadow-lg shadow-ieeeBlue/20">
 <Building className="h-6 w-6" />
 </div>
 <div>
 <h1 className="text-2xl font-bold text-textPrimary leading-tight">Create Account</h1>
 <p className="text-sm text-textMuted mt-1">Sign up to access the tenant portal</p>
 </div>
 </div>

 {/* Clerk Sign Up component or configuration warning */}
 <div className="w-full flex justify-center">
 {isClerkConfigured ? (
 <SignUp
 routing="path"
 path="/signup"
 signInUrl="/login"
 fallbackRedirectUrl="/dashboard"
 appearance={{
 elements: {
 card: 'bg-transparent shadow-none border-none p-0 w-full',
 header: 'hidden', // Hide duplicate headers
 footer: 'text-textMuted mt-4',
 footerActionLink: 'text-ieeeBlue hover:text-ieeeBlue font-semibold transition-colors duration-150',
 formButtonPrimary: 'w-full py-2.5 px-4 bg-ieeeBlue hover:bg-ieeeBlue text-white text-sm font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-ieeeBlue/10 border-0 cursor-pointer',
 formFieldLabel: 'text-xs font-semibold text-slate-350 mb-1.5',
 formFieldInput: 'w-full px-4 py-2.5 bg-cardBg border border-slate-200 rounded-xl text-sm text-textPrimary placeholder-slate-500 focus:outline-none focus:ring-4 focus:ring-ieeeBlue/20 focus:border-ieeeBlue transition-all duration-200',
 identityPreviewText: 'text-textPrimary',
 identityPreviewEditButtonIcon: 'text-textMuted hover:text-slate-250',
 formResendCodeLink: 'text-ieeeBlue hover:text-ieeeBlue',
 dividerLine: 'bg-slate-100',
 dividerText: 'text-slate-500 text-xs uppercase font-semibold px-2',
 socialButtonsBlockButton: 'bg-white/5 border border-white/10 hover:bg-white/10 !text-white transition-all duration-300 rounded-xl py-2.5 cursor-pointer shadow-sm ',
 socialButtonsBlockButtonText: '!text-white font-medium text-sm',
 alert: 'bg-error/40 border border-error/20 text-error rounded-xl p-3.5 text-xs',
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
 <div className="w-full p-5 bg-error/20 border border-error/20 rounded-xl text-center space-y-4">
 <div className="mx-auto h-10 w-10 rounded-full bg-error/10 flex items-center justify-center text-error border border-error/20">
 <ShieldAlert className="h-5 w-5" />
 </div>
 <div>
 <h3 className="text-sm font-semibold text-error">Registration Disabled</h3>
 <p className="text-xs text-textMuted mt-1">
 Clerk Registration could not be loaded because the API keys are not configured.
 </p>
 </div>
 <div className="p-3 bg-cardBg rounded-lg text-left">
 <p className="text-[11px] text-slate-450 leading-relaxed font-mono">
 Go to Vercel Project Settings and add <strong>VITE_CLERK_PUBLISHABLE_KEY</strong> to verify your environment variables.
 </p>
 </div>
 </div>
 )}
 </div>
 </div>
 </div>
 </AnimatedPage>
 );
};

export default Signup;

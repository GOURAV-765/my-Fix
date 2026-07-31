import React from 'react';
import AnimatedPage from '../components/AnimatedPage.js';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

const Unauthorized: React.FC = () => {
 return (
 <AnimatedPage>
 <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
 <div className="p-4 rounded-full bg-error/10 border border-error/20 text-error mb-6 shadow-lg shadow-error/5">
 <ShieldAlert size={48} className="text-error" />
 </div>
 <h1 className="text-3xl font-extrabold text-textPrimary tracking-tight">403 - Access Denied</h1>
 <p className="text-textMuted mt-2.5 max-w-md text-sm leading-relaxed">
 You do not have the required permissions or administrative privileges to view this section of the portal.
 </p>
 <div className="mt-8 flex gap-4">
 <Link
 to="/dashboard"
 className="flex items-center gap-2 px-5 py-2.5 bg-ieeeBlue hover:bg-ieeeBlue text-white rounded-xl text-sm font-semibold shadow-lg shadow-ieeeBlue/15 transition-all"
 >
 <ArrowLeft size={16} />
 Back to Dashboard
 </Link>
 </div>
 </div>
 </AnimatedPage>
 );
};

export default Unauthorized;

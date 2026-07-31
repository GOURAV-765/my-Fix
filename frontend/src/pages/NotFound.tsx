import React from 'react';
import AnimatedPage from '../components/AnimatedPage.js';
import { Link } from 'react-router-dom';
import { FileQuestion, ArrowLeft } from 'lucide-react';

const NotFound: React.FC = () => {
 return (
 <AnimatedPage>
 <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
 <div className="p-4 rounded-full bg-ieeeBlue/10 border border-ieeeBlue/20 text-ieeeBlue mb-6 shadow-lg shadow-ieeeBlue/5">
 <FileQuestion size={48} />
 </div>
 <h1 className="text-3xl font-extrabold text-textPrimary tracking-tight font-sans">404 - Page Not Found</h1>
 <p className="text-textMuted mt-2.5 max-w-md text-sm leading-relaxed">
 The link you followed may be broken, or the page may have been removed. Let's get you back on track.
 </p>
 <div className="mt-8">
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

export default NotFound;

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext.js';

interface DepartmentContextType {
 activeDepartmentId: string | 'all';
 setActiveDepartmentId: (id: string | 'all') => void;
 availableDepartments: { departmentId: string; roleName: string; name?: string }[];
}

const DepartmentContext = createContext<DepartmentContextType | undefined>(undefined);

export const DepartmentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
 const { user } = useAuth();
 
 // Try to load from localStorage first, fallback to 'all'
 const [activeDepartmentId, setActiveDepartmentIdState] = useState<string | 'all'>(() => {
 return localStorage.getItem('activeDepartmentId') || 'all';
 });

 const setActiveDepartmentId = (id: string | 'all') => {
 setActiveDepartmentIdState(id);
 localStorage.setItem('activeDepartmentId', id);
 };

 // When user changes, ensure their selected department is still valid for them
 useEffect(() => {
 if (user && activeDepartmentId !== 'all') {
 const hasDept = user.departments?.some(d => d.departmentId === activeDepartmentId);
 const isCoreAdmin = user.role?.name === 'Core Admin';
 if (!hasDept && !isCoreAdmin) {
 setActiveDepartmentId('all');
 }
 }
 }, [user, activeDepartmentId]);

 return (
 <DepartmentContext.Provider value={{
 activeDepartmentId,
 setActiveDepartmentId,
 availableDepartments: user?.departments || []
 }}>
 {children}
 </DepartmentContext.Provider>
 );
};

export const useDepartment = () => {
 const context = useContext(DepartmentContext);
 if (context === undefined) {
 throw new Error('useDepartment must be used within a DepartmentProvider');
 }
 return context;
};

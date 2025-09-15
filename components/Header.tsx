import React from 'react';
import type { User } from '../types';
import { LogoutIcon } from './icons/Icons';

interface HeaderProps {
    user: User;
    onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout }) => {
    return (
        <header className="bg-white shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex items-center space-x-4">
                        <svg className="h-8 w-8 text-indigo-600 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        <div>
                            <h1 className="text-xl font-bold text-slate-800">KeyGuard</h1>
                            <p className="text-xs text-slate-500 leading-tight">by @nongdinhminh - v1.0.1.0</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                         <div className="text-right">
                            <p className="text-sm font-medium text-slate-700">{user.name}</p>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${user.role === 'superadmin' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                                {user.role}
                            </span>
                        </div>
                        <button
                            onClick={onLogout}
                            className="p-2 rounded-full text-slate-500 hover:text-slate-800 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                            aria-label="Logout"
                        >
                           <LogoutIcon className="h-6 w-6" />
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
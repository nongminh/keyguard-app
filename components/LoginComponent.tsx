import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { EnvelopeIcon, KeyIcon } from './icons/Icons';
import type { User } from '../types';
import { api } from '../services/api';

interface LoginComponentProps {
    onLogin: (user: User) => void;
}

const LoginComponent: React.FC<LoginComponentProps> = ({ onLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleLoginSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) {
            toast.error("Please enter both your email and password.");
            return;
        }

        setIsSubmitting(true);
        try {
            const user = await api.login(email, password);

            if (user) {
                onLogin(user);
            } else {
                toast.error("Invalid email or password. Please try again.");
            }
        } catch (error) {
            toast.error("An error occurred during login. Please try again.");
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center p-4">
            <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 space-y-6">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-slate-800">KeyGuard</h1>
                    <p className="text-sm text-slate-400 mt-1">by @nongdinhminh - v1.0.1.0</p>
                    <p className="text-slate-500 mt-2">Sign in to manage your license keys</p>
                </div>

                <form onSubmit={handleLoginSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="email" className="text-sm font-medium text-slate-700">Email Address</label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                            <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center">
                                <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                required
                                className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-md leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="password" className="text-sm font-medium text-slate-700">Password</label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                            <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center">
                                <KeyIcon className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-md leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                        </div>
                    </div>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:bg-indigo-400 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? 'Signing In...' : 'Sign In'}
                    </button>
                </form>
            </div>
            <footer className="mt-8 text-center text-slate-500 text-sm">
                <p>&copy; {new Date().getFullYear()} KeyGuard. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default LoginComponent;
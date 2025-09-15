
import 'react-toastify/dist/ReactToastify.css';
import React, { useState, useEffect, useCallback } from 'react';
import type { User } from './types';
import LoginComponent from './components/LoginComponent';
import Dashboard from './components/Dashboard';
import { ToastContainer, toast } from 'react-toastify';
import { api } from './services/api';

const App: React.FC = () => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check if a user session exists on app load
        const checkCurrentUser = async () => {
            try {
                const user = await api.getCurrentUser();
                if (user) {
                    setCurrentUser(user);
                }
            } catch (error) {
                console.error("Failed to fetch current user", error);
                toast.error("Could not verify session. Please log in again.");
                await api.setCurrentUser(null); // Clear broken session
            }
            setIsLoading(false);
        };
        checkCurrentUser();
    }, []);

    const handleLogin = useCallback(async (user: User) => {
        await api.setCurrentUser(user);
        setCurrentUser(user);
        toast.success(`Welcome back, ${user.name}!`);
    }, []);

    const handleLogout = useCallback(async () => {
        await api.setCurrentUser(null);
        setCurrentUser(null);
        toast.info("You have been logged out.");
    }, []);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen bg-slate-100">
                <div className="text-xl font-semibold text-slate-700">Loading...</div>
            </div>
        );
    }

    return (
        <>
            <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
            />
            {currentUser ? (
                <Dashboard 
                    user={currentUser} 
                    onLogout={handleLogout} 
                />
            ) : (
                <LoginComponent onLogin={handleLogin} />
            )}
        </>
    );
};

export default App;
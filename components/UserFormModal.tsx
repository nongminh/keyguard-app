
import React, { useState, useEffect } from 'react';
import type { User, Permission } from '../types';
import { PERMISSIONS } from '../constants';
import { toast } from 'react-toastify';

interface UserFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (userData: Pick<User, 'name' | 'email' | 'permissions' | 'password'>, id: string | null) => void;
    initialData: User | null;
}

const UserFormModal: React.FC<UserFormModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [permissions, setPermissions] = useState<{[key in Permission]?: boolean}>({});

    const isCreateMode = initialData === null;

    useEffect(() => {
        if (initialData) {
            setName(initialData.name);
            setEmail(initialData.email);
            setPermissions(initialData.permissions || {});
            setPassword('');
            setConfirmPassword('');
        } else {
            // Reset for new user creation
            setName('');
            setEmail('');
            setPassword('');
            setConfirmPassword('');
            setPermissions({});
        }
    }, [initialData, isOpen]);

    const handlePermissionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        setPermissions(prev => ({ ...prev, [name as Permission]: checked }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (isCreateMode) {
            if (!password || password !== confirmPassword) {
                toast.error("Passwords do not match or are empty.");
                return;
            }
        }
        
        onSave({
            name,
            email,
            permissions,
            password: isCreateMode ? password : undefined,
        }, initialData ? initialData.id : null);
    };

    if (!isOpen) return null;

    if (initialData && initialData.role === 'superadmin') {
        // This case should ideally not be reached as the edit button is hidden for superadmin
        return null; 
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSubmit}>
                    <div className="p-6">
                        <h3 className="text-lg font-medium leading-6 text-gray-900">{isCreateMode ? 'Create New User' : `Edit User: ${initialData?.name}`}</h3>
                        
                        <div className="mt-6 space-y-6">
                             <div>
                                <label htmlFor="userName" className="block text-sm font-medium text-gray-700">User Name</label>
                                <input
                                    type="text"
                                    name="userName"
                                    id="userName"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                />
                            </div>

                             <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
                                <input
                                    type="email"
                                    name="email"
                                    id="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    disabled={!isCreateMode}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                                />
                            </div>
                            
                            {isCreateMode && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
                                    <div>
                                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                                        <input
                                            type="password"
                                            name="password"
                                            id="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        />
                                    </div>
                                     <div>
                                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm Password</label>
                                        <input
                                            type="password"
                                            name="confirmPassword"
                                            id="confirmPassword"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            required
                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        />
                                    </div>
                                </div>
                            )}
                        
                            <div>
                                <fieldset>
                                    <legend className="text-base font-medium text-gray-900">Permissions</legend>
                                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {Object.keys(PERMISSIONS).map((permKey) => (
                                            <div key={permKey} className="relative flex items-start">
                                                <div className="flex items-center h-5">
                                                    <input
                                                        id={permKey}
                                                        name={permKey}
                                                        type="checkbox"
                                                        checked={!!permissions[permKey as Permission]}
                                                        onChange={handlePermissionChange}
                                                        className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                                                    />
                                                </div>
                                                <div className="ml-3 text-sm">
                                                    <label htmlFor={permKey} className="font-medium text-gray-700">{PERMISSIONS[permKey as Permission]}</label>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </fieldset>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                        <button type="submit" className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm">
                            {isCreateMode ? 'Create User' : 'Save Changes'}
                        </button>
                        <button type="button" onClick={onClose} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm">
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UserFormModal;

import React, { useState, useEffect, useCallback } from 'react';
import type { User, Key, Application } from '../types';
import { Permission } from '../types';
import Header from './Header';
import KeyTable from './KeyTable';
import ApplicationTable from './ApplicationTable';
import UserTable from './UserTable';
import KeyFormModal from './KeyFormModal';
import ApplicationFormModal from './ApplicationFormModal';
import UserFormModal from './UserFormModal';
import DeleteConfirmModal from './DeleteConfirmModal';
import { PlusIcon } from './icons/Icons';
import { toast } from 'react-toastify';
import { api } from '../services/api';

interface DashboardProps {
    user: User;
    onLogout: () => void;
}

interface ValidationResponse {
  status: boolean;
  info: {
    keyValue: string;
    applicationName: string;
    userName: string;
    userContact: string;
    startDate: string;
    endDate: string;
  } | { message: string } | null;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onLogout }) => {
    const [view, setView] = useState<'keys' | 'apps' | 'users' | 'api' | 'api-docs'>('keys');
    
    // --- Data State ---
    const [keys, setKeys] = useState<Key[]>([]);
    const [applications, setApplications] = useState<Application[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [isLoadingData, setIsLoadingData] = useState(true);

    // --- Modal & Form State ---
    const [isKeyFormOpen, setIsKeyFormOpen] = useState(false);
    const [isKeyDeleteModalOpen, setIsKeyDeleteModalOpen] = useState(false);
    const [editingKey, setEditingKey] = useState<Key | null>(null);
    const [deletingKeyId, setDeletingKeyId] = useState<string | null>(null);

    const [isAppFormOpen, setIsAppFormOpen] = useState(false);
    const [isAppDeleteModalOpen, setIsAppDeleteModalOpen] = useState(false);
    const [editingApp, setEditingApp] = useState<Application | null>(null);
    const [deletingAppId, setDeletingAppId] = useState<string | null>(null);

    const [isUserFormOpen, setIsUserFormOpen] = useState(false);
    const [isUserDeleteModalOpen, setIsUserDeleteModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [deletingUserId, setDeletingUserId] = useState<string | null>(null);

    // --- API Tester State ---
    const [apiKeyToTest, setApiKeyToTest] = useState('');
    const [validationResult, setValidationResult] = useState<ValidationResponse | null>(null);

    // --- Permissions Check ---
    const can = (permission: Permission) => {
        return user.role === 'superadmin' || !!user.permissions?.[permission];
    };

    // --- Data Fetching ---
    const fetchData = useCallback(async () => {
        setIsLoadingData(true);
        try {
            const promises = [api.getKeys(), api.getApplications()];
            if (user.role === 'superadmin') {
                promises.push(api.getUsers());
            }
            const [keysData, appsData, usersData] = await Promise.all(promises);
            setKeys(keysData as Key[]);
            setApplications(appsData as Application[]);
            if (usersData) {
                setUsers(usersData as User[]);
            }
        } catch (error) {
            toast.error("Failed to load application data.");
            console.error(error);
        } finally {
            setIsLoadingData(false);
        }
    }, [user.role]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);


    // --- Key Handlers ---
    const handleOpenKeyForm = (key: Key | null) => { setEditingKey(key); setIsKeyFormOpen(true); };
    const handleCloseKeyForm = () => { setEditingKey(null); setIsKeyFormOpen(false); };
    const handleSaveKey = async (keyData: Omit<Key, 'id'>, id: string | null) => {
        try {
            await api.saveKey(keyData, id);
            toast.success(id ? "Key updated successfully!" : "New key created successfully!");
            handleCloseKeyForm();
            await fetchData();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to save key.");
        }
    };
    const handleOpenKeyDeleteModal = (keyId: string) => { setDeletingKeyId(keyId); setIsKeyDeleteModalOpen(true); };
    const handleConfirmKeyDelete = async () => {
        if (deletingKeyId) {
            try {
                await api.deleteKey(deletingKeyId);
                toast.warn("Key has been deleted.");
                setDeletingKeyId(null);
                setIsKeyDeleteModalOpen(false);
                await fetchData();
            } catch(error) {
                toast.error(error instanceof Error ? error.message : "Failed to delete key.");
            }
        }
    };
    const handleToggleKeyStatus = async (keyId: string) => {
        try {
            await api.toggleKeyStatus(keyId);
            toast.info(`Key status has been toggled.`);
            await fetchData();
        } catch(error) {
            toast.error(error instanceof Error ? error.message : "Failed to toggle key status.");
        }
    };

    // --- Application Handlers ---
    const handleOpenAppForm = (app: Application | null) => { setEditingApp(app); setIsAppFormOpen(true); };
    const handleCloseAppForm = () => { setEditingApp(null); setIsAppFormOpen(false); };
    const handleSaveApp = async (appData: Omit<Application, 'id'>, id: string | null) => {
        try {
            await api.saveApplication(appData, id);
            toast.success(id ? "Application updated successfully!" : "New application added successfully!");
            handleCloseAppForm();
            await fetchData();
        } catch(error) {
            toast.error(error instanceof Error ? error.message : "Failed to save application.");
        }
    };
    const handleOpenAppDeleteModal = (appId: string) => { setDeletingAppId(appId); setIsAppDeleteModalOpen(true); };
    const handleConfirmAppDelete = async () => {
        if (deletingAppId) {
            try {
                await api.deleteApplication(deletingAppId);
                toast.warn("Application has been deleted.");
                setDeletingAppId(null);
                setIsAppDeleteModalOpen(false);
                await fetchData();
            } catch(error) {
                toast.error(error instanceof Error ? error.message : "Failed to delete application.");
                setDeletingAppId(null);
                setIsAppDeleteModalOpen(false);
            }
        }
    };
    
    // --- User Handlers ---
    const handleOpenUserForm = (userToEdit: User | null) => { setEditingUser(userToEdit); setIsUserFormOpen(true); };
    const handleCloseUserForm = () => { setEditingUser(null); setIsUserFormOpen(false); };
    const handleSaveUser = async (userData: Pick<User, 'name' | 'email' | 'permissions' | 'password'>, id: string | null) => {
        try {
            await api.saveUser(userData, id);
            toast.success(id ? "User updated successfully!" : "New user created successfully!");
            handleCloseUserForm();
            await fetchData();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to save user.");
        }
    };
    const handleOpenUserDeleteModal = (userId: string) => { setDeletingUserId(userId); setIsUserDeleteModalOpen(true); };
    const handleConfirmUserDelete = async () => {
        if (deletingUserId) {
            try {
                await api.deleteUser(deletingUserId);
                toast.warn("User has been deleted.");
                setDeletingUserId(null);
                setIsUserDeleteModalOpen(false);
                await fetchData();
            } catch (error) {
                toast.error(error instanceof Error ? error.message : "Failed to delete user.");
            }
        }
    };
    
    const handleResetPassword = async (userId: string) => {
        try {
            await api.resetPassword(userId);
            const userToUpdate = users.find(u => u.id === userId);
            toast.success(`Password for ${userToUpdate?.name || 'user'} has been reset to 'keyguard123'.`);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to reset password.");
        }
    };

    // --- API Validation Handler ---
    const handleValidateKey = () => {
        if (!apiKeyToTest.trim()) {
            toast.warn("Please enter a key to validate.");
            setValidationResult(null);
            return;
        }
        const key = keys.find(k => k.keyValue === apiKeyToTest.trim());
        if (!key) {
            setValidationResult({ status: false, info: null });
            toast.error("Key not found.");
            return;
        }

        const now = new Date();
        now.setHours(0, 0, 0, 0); // Normalize to start of day
        const start = new Date(key.startDate);
        const end = new Date(key.endDate);

        const isValid = key.isActive && now >= start && now <= end;

        if (isValid) {
            const appName = applications.find(app => app.id === key.applicationId)?.name || 'Unknown Application';
            setValidationResult({
                status: true,
                info: {
                    keyValue: key.keyValue,
                    applicationName: appName,
                    userName: key.userName,
                    userContact: key.userContact,
                    startDate: key.startDate,
                    endDate: key.endDate,
                }
            });
            toast.success("Validation successful: Key is valid.");
        } else {
            let failureMessage = 'The key is invalid.'; // Default message
            if (!key.isActive) {
                failureMessage = 'Key has been deactivated by an administrator.';
            } else if (now > end) {
                failureMessage = `Key expired on ${new Date(key.endDate).toLocaleDateString()}.`;
            } else if (now < start) {
                failureMessage = `Key is not yet active. It will be valid from ${new Date(key.startDate).toLocaleDateString()}.`;
            }
            
            setValidationResult({
                status: false,
                info: {
                    message: failureMessage
                }
            });
            toast.error(`Validation failed: ${failureMessage}`);
        }
    };

    const renderContent = () => {
        if (isLoadingData) {
            return (
                <div className="flex justify-center items-center p-16">
                    <div className="text-lg font-semibold text-slate-600">Loading data...</div>
                </div>
            );
        }

        if (view === 'keys') {
            return (
                <>
                    <div className="p-6 border-b border-slate-200 flex justify-between items-center">
                        <h2 className="text-2xl font-semibold text-slate-800">License Key Registry</h2>
                        {can(Permission.CREATE_KEYS) && (
                            <button
                                onClick={() => handleOpenKeyForm(null)}
                                className="inline-flex items-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                            >
                                <PlusIcon className="h-5 w-5" />
                                Add New Key
                            </button>
                        )}
                    </div>
                    <KeyTable keys={keys} applications={applications} currentUser={user} onEdit={handleOpenKeyForm} onDelete={handleOpenKeyDeleteModal} onToggleStatus={handleToggleKeyStatus} />
                </>
            );
        }

        if (view === 'apps') {
            return (
                <>
                    <div className="p-6 border-b border-slate-200 flex justify-between items-center">
                        <h2 className="text-2xl font-semibold text-slate-800">Application Registry</h2>
                         {can(Permission.MANAGE_APPLICATIONS) && (
                            <button
                                onClick={() => handleOpenAppForm(null)}
                                className="inline-flex items-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                            >
                                <PlusIcon className="h-5 w-5" />
                                Add New Application
                            </button>
                        )}
                    </div>
                    <ApplicationTable applications={applications} currentUser={user} onEdit={handleOpenAppForm} onDelete={handleOpenAppDeleteModal} />
                </>
            );
        }

        if (view === 'users' && user.role === 'superadmin') {
             return (
                <>
                    <div className="p-6 border-b border-slate-200 flex justify-between items-center">
                        <h2 className="text-2xl font-semibold text-slate-800">User Management</h2>
                        <button
                            onClick={() => handleOpenUserForm(null)}
                            className="inline-flex items-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                        >
                            <PlusIcon className="h-5 w-5" />
                            Add New User
                        </button>
                    </div>
                    <UserTable users={users} currentUser={user} onEdit={handleOpenUserForm} onDelete={handleOpenUserDeleteModal} onResetPassword={handleResetPassword} />
                </>
            );
        }

        if (view === 'api') {
            return (
                <>
                    <div className="p-6 border-b border-slate-200">
                        <h2 className="text-2xl font-semibold text-slate-800">API Key Validation</h2>
                        <p className="mt-1 text-sm text-slate-500">
                            Simulate an API call from your application to validate a license key.
                        </p>
                    </div>
                    <div className="p-6 space-y-6">
                        <div>
                            <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700">License Key to Validate</label>
                            <div className="mt-1 flex gap-4">
                                <input
                                    type="text"
                                    name="apiKey"
                                    id="apiKey"
                                    value={apiKeyToTest}
                                    onChange={(e) => {
                                        setApiKeyToTest(e.target.value);
                                        setValidationResult(null); // Reset result on new input
                                    }}
                                    className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm font-mono"
                                    placeholder="Enter key value..."
                                />
                                <button
                                    onClick={handleValidateKey}
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors whitespace-nowrap"
                                >
                                    Validate Key
                                </button>
                            </div>
                        </div>

                        {validationResult !== null && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Simulated API Response</label>
                                <pre className={`mt-1 p-4 rounded-md text-sm overflow-x-auto ${validationResult.status ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                                    <code>
                                        {JSON.stringify(validationResult, null, 2)}
                                    </code>
                                </pre>
                            </div>
                        )}
                    </div>
                </>
            );
        }
        
        if (view === 'api-docs') {
            return (
                <>
                    <div className="p-6 border-b border-slate-200">
                        <h2 className="text-2xl font-semibold text-slate-800">API Usage Guide</h2>
                        <p className="mt-1 text-sm text-slate-500">
                            How to integrate your applications with the KeyGuard validation API.
                        </p>
                    </div>
                    <div className="p-6 space-y-6 text-slate-700">
                        <div>
                            <h3 className="text-lg font-semibold text-slate-800">Endpoint</h3>
                            <p className="mt-2">To validate a key, send a <code>POST</code> request to the following endpoint:</p>
                            <pre className="mt-2 p-3 bg-slate-100 rounded-md text-sm font-mono text-slate-800 overflow-x-auto"><code>https://api.keyguard.yourdomain.com/v1/validate</code></pre>
                        </div>
                        
                        <div>
                            <h3 className="text-lg font-semibold text-slate-800">Request Body</h3>
                            <p className="mt-2">The request body must be a JSON object containing the <code>keyValue</code> you wish to validate.</p>
                            <pre className="mt-2 p-3 bg-slate-100 rounded-md text-sm font-mono text-slate-800 overflow-x-auto">
                                <code>
{`{
  "keyValue": "KG-DEMO-ACTIVE-123"
}`}
                                </code>
                            </pre>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold text-slate-800">Successful Response (HTTP 200)</h3>
                            <p className="mt-2">If the key is valid, the API returns <code>status: true</code> and an <code>info</code> object with key details.</p>
                            <pre className="mt-2 p-3 bg-slate-100 rounded-md text-sm font-mono text-slate-800 overflow-x-auto">
                                <code>
{`{
  "status": true,
  "info": {
    "keyValue": "KG-DEMO-ACTIVE-123",
    "applicationName": "PhotoEditor Pro",
    "userName": "Alice Johnson",
    "userContact": "alice@example.com",
    "startDate": "YYYY-MM-DD",
    "endDate": "YYYY-MM-DD"
  }
}`}
                                </code>
                            </pre>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold text-slate-800">Error Responses (HTTP 200)</h3>
                            <p className="mt-2">If the key is not found, the API returns <code>info: null</code>.</p>
                             <pre className="mt-2 p-3 bg-slate-100 rounded-md text-sm font-mono text-slate-800 overflow-x-auto">
                                <code>
{`{
  "status": false,
  "info": null
}`}
                                </code>
                            </pre>
                            <p className="mt-4">If the key is found but is invalid (e.g., expired or deactivated), the API returns a descriptive message.</p>
                             <pre className="mt-2 p-3 bg-slate-100 rounded-md text-sm font-mono text-slate-800 overflow-x-auto">
                                <code>
{`{
  "status": false,
  "info": {
    "message": "Key expired on MM/DD/YYYY."
  }
}`}
                                </code>
                            </pre>
                        </div>
                    </div>
                </>
            );
        }

        return null;
    };

    const getTabClass = (tabName: 'keys' | 'apps' | 'users' | 'api' | 'api-docs') => {
        const base = "py-4 px-1 border-b-2 font-medium text-sm transition-colors";
        if(view === tabName) return `${base} border-indigo-500 text-indigo-600`;
        return `${base} border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300`;
    };

    return (
        <div className="min-h-screen bg-slate-100">
            <Header user={user} onLogout={onLogout} />
            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                         <div className="border-b border-gray-200 px-6">
                            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                                <button onClick={() => setView('keys')} className={getTabClass('keys')}>Key Management</button>
                                <button onClick={() => setView('apps')} className={getTabClass('apps')}>Application Management</button>
                                {user.role === 'superadmin' && (
                                     <button onClick={() => setView('users')} className={getTabClass('users')}>User Management</button>
                                )}
                                <button onClick={() => setView('api')} className={getTabClass('api')}>API Integration</button>
                                <button onClick={() => setView('api-docs')} className={getTabClass('api-docs')}>API Documentation</button>
                            </nav>
                        </div>
                        {renderContent()}
                    </div>
                </div>
            </main>
            
            {/* Modals */}
            <KeyFormModal isOpen={isKeyFormOpen} onClose={handleCloseKeyForm} onSave={handleSaveKey} initialData={editingKey} applications={applications} />
            <DeleteConfirmModal isOpen={isKeyDeleteModalOpen} onClose={() => setIsKeyDeleteModalOpen(false)} onConfirm={handleConfirmKeyDelete} title="Delete Key" message="Are you sure you want to delete this key? This action cannot be undone." />

            <ApplicationFormModal isOpen={isAppFormOpen} onClose={handleCloseAppForm} onSave={handleSaveApp} initialData={editingApp} />
            <DeleteConfirmModal isOpen={isAppDeleteModalOpen} onClose={() => setIsAppDeleteModalOpen(false)} onConfirm={handleConfirmAppDelete} title="Delete Application" message="Are you sure you want to delete this application? This action cannot be undone." />

            {user.role === 'superadmin' && (
                <>
                    <UserFormModal isOpen={isUserFormOpen} onClose={handleCloseUserForm} onSave={handleSaveUser} initialData={editingUser} />
                    <DeleteConfirmModal isOpen={isUserDeleteModalOpen} onClose={() => setIsUserDeleteModalOpen(false)} onConfirm={handleConfirmUserDelete} title="Delete User" message="Are you sure you want to delete this user? This will revoke their access permanently." />
                </>
            )}
        </div>
    );
};

export default Dashboard;
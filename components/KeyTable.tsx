
import React from 'react';
import type { Key, Application, User } from '../types';
import { KeyStatus, Permission } from '../types';
import { EditIcon, DeleteIcon, PowerIcon } from './icons/Icons';

interface KeyTableProps {
    keys: Key[];
    applications: Application[];
    currentUser: User;
    onEdit: (key: Key) => void;
    onDelete: (keyId: string) => void;
    onToggleStatus: (keyId: string) => void;
}

const getStatus = (startDate: string, endDate: string, isActive: boolean): { status: KeyStatus, color: string } => {
    if (!isActive) {
        return { status: KeyStatus.Deactivated, color: 'bg-gray-100 text-gray-800' };
    }
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Normalize to start of day
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (now < start) {
        return { status: KeyStatus.Pending, color: 'bg-yellow-100 text-yellow-800' };
    } else if (now > end) {
        return { status: KeyStatus.Expired, color: 'bg-red-100 text-red-800' };
    } else {
        return { status: KeyStatus.Active, color: 'bg-green-100 text-green-800' };
    }
};

const KeyTable: React.FC<KeyTableProps> = ({ keys, applications, currentUser, onEdit, onDelete, onToggleStatus }) => {
    const appMap = new Map(applications.map(app => [app.id, app.name]));
    
    const can = (permission: Permission) => {
        return currentUser.role === 'superadmin' || !!currentUser.permissions?.[permission];
    };

    if (keys.length === 0) {
        return (
            <div className="text-center py-16">
                <h3 className="text-lg font-medium text-slate-700">No Keys Found</h3>
                <p className="text-slate-500 mt-1">Get started by adding a new license key.</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                    <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Key Value</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Application</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">User</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Validity Period</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                        <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                    {keys.map(key => {
                        const { status, color } = getStatus(key.startDate, key.endDate, key.isActive);
                        return (
                            <tr key={key.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-mono text-slate-900">{key.keyValue}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-slate-900">{appMap.get(key.applicationId) || 'Unknown App'}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-slate-900">{key.userName}</div>
                                    <div className="text-sm text-slate-500">{key.userContact}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                    {new Date(key.startDate).toLocaleDateString()} - {new Date(key.endDate).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${color}`}>
                                        {status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <div className="flex items-center justify-end space-x-4">
                                        {can(Permission.TOGGLE_KEY_STATUS) && (
                                             <button onClick={() => onToggleStatus(key.id)} className={`${key.isActive ? 'text-green-600 hover:text-green-900' : 'text-gray-400 hover:text-gray-600'} transition-colors`} title={key.isActive ? 'Deactivate Key' : 'Activate Key'}>
                                                <PowerIcon className="h-5 w-5" />
                                            </button>
                                        )}
                                        {can(Permission.EDIT_KEYS) && (
                                            <button onClick={() => onEdit(key)} className="text-indigo-600 hover:text-indigo-900 transition-colors" title="Edit Key">
                                                <EditIcon className="h-5 w-5" />
                                            </button>
                                        )}
                                        {can(Permission.DELETE_KEYS) && (
                                            <button onClick={() => onDelete(key.id)} className="text-red-600 hover:text-red-900 transition-colors" title="Delete Key">
                                                <DeleteIcon className="h-5 w-5" />
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default KeyTable;
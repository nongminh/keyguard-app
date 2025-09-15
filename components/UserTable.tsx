
import React from 'react';
import type { User } from '../types';
import { PERMISSIONS } from '../constants';
import { EditIcon, DeleteIcon, UsersIcon, RefreshIcon } from './icons/Icons';

interface UserTableProps {
    users: User[];
    currentUser: User;
    onEdit: (user: User) => void;
    onDelete: (userId: string) => void;
    onResetPassword: (userId: string) => void;
}

const UserTable: React.FC<UserTableProps> = ({ users, currentUser, onEdit, onDelete, onResetPassword }) => {
    
    if (users.length <= 1) { // Only superadmin exists
        return (
            <div className="text-center py-16">
                 <UsersIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="text-lg font-medium text-slate-700 mt-2">Only You Are Here</h3>
                <p className="text-slate-500 mt-1">Other administrators will appear here once they log in.</p>
            </div>
        );
    }
    
    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                    <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">User</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Role</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Permissions</th>
                        <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                    {users.map(user => {
                        const assignedPermissions = Object.entries(user.permissions || {})
                            .filter(([, value]) => value)
                            .map(([key]) => PERMISSIONS[key as keyof typeof PERMISSIONS]);

                        const isSelf = user.id === currentUser.id;

                        return (
                            <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-slate-900">{user.name} {isSelf && '(You)'}</div>
                                    <div className="text-sm text-slate-500">{user.email}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === 'superadmin' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                                        {user.role}
                                    </span>
                                </td>
                                 <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                    {user.role === 'superadmin' ? (
                                        <span className="italic">All Permissions</span>
                                    ) : assignedPermissions.length > 0 ? (
                                        assignedPermissions.join(', ')
                                    ) : (
                                        <span className="italic">No Permissions Assigned</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <div className="flex items-center justify-end space-x-4">
                                        {user.role !== 'superadmin' && (
                                            <>
                                                <button onClick={() => onEdit(user)} className="text-indigo-600 hover:text-indigo-900 transition-colors" title="Edit User Permissions">
                                                    <EditIcon className="h-5 w-5" />
                                                </button>
                                                <button onClick={() => onResetPassword(user.id)} className="text-yellow-600 hover:text-yellow-900 transition-colors" title="Reset Password">
                                                    <RefreshIcon className="h-5 w-5" />
                                                </button>
                                                {!isSelf && (
                                                    <button onClick={() => onDelete(user.id)} className="text-red-600 hover:text-red-900 transition-colors" title="Delete User">
                                                        <DeleteIcon className="h-5 w-5" />
                                                    </button>
                                                )}
                                            </>
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

export default UserTable;
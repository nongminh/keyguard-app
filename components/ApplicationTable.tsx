
import React from 'react';
import type { Application, User } from '../types';
import { Permission } from '../types';
import { EditIcon, DeleteIcon, AppIcon } from './icons/Icons';

interface ApplicationTableProps {
    applications: Application[];
    currentUser: User;
    onEdit: (app: Application) => void;
    onDelete: (appId: string) => void;
}

const ApplicationTable: React.FC<ApplicationTableProps> = ({ applications, currentUser, onEdit, onDelete }) => {
    
    const canManage = currentUser.role === 'superadmin' || !!currentUser.permissions?.[Permission.MANAGE_APPLICATIONS];

    if (applications.length === 0) {
        return (
            <div className="text-center py-16">
                 <AppIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="text-lg font-medium text-slate-700 mt-2">No Applications Found</h3>
                <p className="text-slate-500 mt-1">Get started by adding a new application.</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                    <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Application Name</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Application ID</th>
                        {canManage && <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>}
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                    {applications.map(app => (
                        <tr key={app.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-slate-900">{app.name}</div>
                            </td>
                             <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-mono text-slate-500">{app.id}</div>
                            </td>
                            {canManage && (
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <div className="flex items-center justify-end space-x-4">
                                        <button onClick={() => onEdit(app)} className="text-indigo-600 hover:text-indigo-900 transition-colors" title="Edit Application">
                                            <EditIcon className="h-5 w-5" />
                                        </button>
                                        <button onClick={() => onDelete(app.id)} className="text-red-600 hover:text-red-900 transition-colors" title="Delete Application">
                                            <DeleteIcon className="h-5 w-5" />
                                        </button>
                                    </div>
                                </td>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ApplicationTable;

import React, { useState, useEffect } from 'react';
import type { Key, Application } from '../types';

interface KeyFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (keyData: Omit<Key, 'id'>, id: string | null) => void;
    initialData: Key | null;
    applications: Application[];
}

const KeyFormModal: React.FC<KeyFormModalProps> = ({ isOpen, onClose, onSave, initialData, applications }) => {
    const [formData, setFormData] = useState({
        keyValue: '',
        applicationId: '',
        userName: '',
        userContact: '',
        startDate: '',
        endDate: '',
        isActive: true,
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                keyValue: initialData.keyValue,
                applicationId: initialData.applicationId,
                userName: initialData.userName,
                userContact: initialData.userContact,
                startDate: initialData.startDate,
                endDate: initialData.endDate,
                isActive: initialData.isActive,
            });
        } else {
            // Reset form for new entry
            setFormData({
                keyValue: '',
                applicationId: applications.length > 0 ? applications[0].id : '',
                userName: '',
                userContact: '',
                startDate: new Date().toISOString().split('T')[0],
                endDate: '',
                isActive: true,
            });
        }
    }, [initialData, isOpen, applications]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        
        if (type === 'checkbox') {
            const { checked } = e.target as HTMLInputElement;
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // The 'id' is handled in the parent, so we omit it here.
        const { ...keyData } = formData;
        onSave(keyData, initialData ? initialData.id : null);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSubmit}>
                    <div className="p-6">
                        <h3 className="text-lg font-medium leading-6 text-gray-900">{initialData ? 'Edit Key' : 'Create New Key'}</h3>
                        <div className="mt-6 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-6">
                            
                            <div className="sm:col-span-2">
                                <label htmlFor="keyValue" className="block text-sm font-medium text-gray-700">Key Value</label>
                                <input type="text" name="keyValue" id="keyValue" value={formData.keyValue} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm font-mono" />
                            </div>

                            <div className="sm:col-span-2">
                                <label htmlFor="applicationId" className="block text-sm font-medium text-gray-700">Application</label>
                                <select id="applicationId" name="applicationId" value={formData.applicationId} onChange={handleChange} required className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                                    {applications.length === 0 && <option disabled>Please add an application first</option>}
                                    {applications.map(app => (
                                        <option key={app.id} value={app.id}>{app.name}</option>
                                    ))}
                                </select>
                            </div>
                             <div className="sm:col-span-2">
                                <label htmlFor="userName" className="block text-sm font-medium text-gray-700">User Name</label>
                                <input type="text" name="userName" id="userName" value={formData.userName} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                            </div>
                            <div className="sm:col-span-2">
                                <label htmlFor="userContact" className="block text-sm font-medium text-gray-700">User Contact (Email/Phone)</label>
                                <input type="text" name="userContact" id="userContact" value={formData.userContact} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                            </div>
                             <div>
                                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">Start Date</label>
                                <input type="date" name="startDate" id="startDate" value={formData.startDate} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                            </div>
                            <div>
                                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">End Date</label>
                                <input type="date" name="endDate" id="endDate" value={formData.endDate} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" min={formData.startDate} />
                            </div>
                             <div className="sm:col-span-2 flex items-center">
                                <input id="isActive" name="isActive" type="checkbox" checked={formData.isActive} onChange={handleChange} className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded" />
                                <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">Key is Active</label>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                        <button type="submit" className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm">
                            Save
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

export default KeyFormModal;
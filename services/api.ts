import type { User, Key, Application } from '../types';
import { SUPER_ADMIN_EMAIL } from '../constants';

// --- MOCK DATABASE HELPERS (using localStorage) ---

const MOCK_LATENCY = 300; // ms

const simulateApiCall = <T>(data: T): Promise<T> => {
    return new Promise(resolve => {
        setTimeout(() => resolve(data), MOCK_LATENCY);
    });
};

const getFromStorage = <T>(key: string, defaultValue: T): T => {
    try {
        const stored = localStorage.getItem(key);
        return stored ? JSON.parse(stored) : defaultValue;
    } catch (e) {
        console.error(`Failed to parse ${key} from localStorage`, e);
        return defaultValue;
    }
};

const saveToStorage = <T>(key: string, data: T) => {
    localStorage.setItem(key, JSON.stringify(data));
};


// Initialize seed data if not present
const initializeData = () => {
    // Users
    if (!localStorage.getItem('users')) {
        saveToStorage<User[]>('users', [{
            id: `user-superadmin`,
            email: SUPER_ADMIN_EMAIL,
            name: 'Super Admin',
            role: 'superadmin',
            password: 'password123'
        }]);
    }
    // Applications
    if (!localStorage.getItem('applications')) {
        saveToStorage<Application[]>('applications', [
            { id: 'app-1', name: 'PhotoEditor Pro' },
            { id: 'app-2', name: 'DataAnalyzer Ultimate' },
            { id: 'app-3', name: 'CodeCompanion AI' },
        ]);
    }
    // Keys
    if (!localStorage.getItem('licenseKeys')) {
         const today = new Date();
        const oneMonthFromNow = new Date(new Date().setMonth(today.getMonth() + 1));
        const oneMonthAgo = new Date(new Date().setMonth(today.getMonth() - 1));
        const twoMonthsAgo = new Date(new Date().setMonth(today.getMonth() - 2));
        saveToStorage<Key[]>('licenseKeys', [
            { id: '1', keyValue: 'KG-DEMO-ACTIVE-123', applicationId: 'app-1', userName: 'Alice Johnson', userContact: 'alice@example.com', startDate: new Date().toISOString().split('T')[0], endDate: oneMonthFromNow.toISOString().split('T')[0], isActive: true },
            { id: '2', keyValue: 'KG-DEMO-EXPIRED-456', applicationId: 'app-2', userName: 'Bob Williams', userContact: '123-456-7890', startDate: twoMonthsAgo.toISOString().split('T')[0], endDate: oneMonthAgo.toISOString().split('T')[0], isActive: true },
        ]);
    }
};

initializeData();

// --- API FUNCTIONS ---

// USER API
export const api = {
    async login(email: string, password: string): Promise<User | null> {
        const users = getFromStorage<User[]>('users', []);
        const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

        if (user && user.password === password) {
            // Never send the password back to the client
            const { password, ...userWithoutPassword } = user;
            return simulateApiCall(userWithoutPassword as User);
        }
        
        return simulateApiCall(null);
    },

    async getCurrentUser(): Promise<User | null> {
        const user = getFromStorage<User | null>('currentUser', null);
        return simulateApiCall(user);
    },
    
    async setCurrentUser(user: User | null): Promise<void> {
        saveToStorage('currentUser', user);
        await simulateApiCall(undefined);
    },

    async getUsers(): Promise<User[]> {
        const users = getFromStorage<User[]>('users', []);
        return simulateApiCall(users.map(u => {
            const { password, ...userWithoutPassword } = u;
            return userWithoutPassword as User;
        }));
    },

    async saveUser(userData: Pick<User, 'name' | 'email' | 'permissions' | 'password'>, id: string | null): Promise<User> {
        let users = getFromStorage<User[]>('users', []);
        if (id) { // Edit
            let updatedUser: User | undefined;
            users = users.map(u => {
                if (u.id === id) {
                    updatedUser = { ...u, name: userData.name, permissions: userData.permissions };
                    return updatedUser;
                }
                return u;
            });
            saveToStorage('users', users);
            if (!updatedUser) throw new Error("User not found");
             const { password, ...userToReturn } = updatedUser;
            return simulateApiCall(userToReturn as User);

        } else { // Create
            if (users.some(u => u.email.toLowerCase() === userData.email.toLowerCase())) {
                throw new Error("A user with this email already exists.");
            }
            const newUser: User = { 
                id: `user-${Date.now()}`, 
                role: 'admin', 
                email: userData.email,
                name: userData.name,
                password: userData.password,
                permissions: userData.permissions || {},
            };
            users.unshift(newUser);
            saveToStorage('users', users);
            const { password, ...userToReturn } = newUser;
            return simulateApiCall(userToReturn as User);
        }
    },
    
    async deleteUser(userId: string): Promise<void> {
        let users = getFromStorage<User[]>('users', []);
        users = users.filter(u => u.id !== userId);
        saveToStorage('users', users);
        await simulateApiCall(undefined);
    },
    
    async resetPassword(userId: string): Promise<void> {
        let users = getFromStorage<User[]>('users', []);
        const defaultPassword = 'keyguard123';
        let found = false;
        users = users.map(u => {
            if (u.id === userId) {
                found = true;
                return { ...u, password: defaultPassword };
            }
            return u;
        });

        if (!found) throw new Error("User not found to reset password.");

        saveToStorage('users', users);
        await simulateApiCall(undefined);
    },


    // KEY API
    async getKeys(): Promise<Key[]> {
        const keys = getFromStorage<Key[]>('licenseKeys', []);
        keys.sort((a,b) => parseInt(b.id.split('-')[1] || '0') - parseInt(a.id.split('-')[1] || '0'));
        return simulateApiCall(keys);
    },

    async saveKey(keyData: Omit<Key, 'id'>, id: string | null): Promise<Key> {
        let keys = getFromStorage<Key[]>('licenseKeys', []);
        if (id) { // Edit
            let updatedKey: Key | undefined;
            keys = keys.map(k => {
                if (k.id === id) {
                    updatedKey = { id, ...keyData };
                    return updatedKey;
                }
                return k;
            });
            saveToStorage('licenseKeys', keys);
            if (!updatedKey) throw new Error("Key not found");
            return simulateApiCall(updatedKey);
        } else { // Create
            const newKey: Key = { id: `key-${Date.now()}`, ...keyData };
            keys.unshift(newKey);
            saveToStorage('licenseKeys', keys);
            return simulateApiCall(newKey);
        }
    },

    async deleteKey(keyId: string): Promise<void> {
        let keys = getFromStorage<Key[]>('licenseKeys', []);
        keys = keys.filter(k => k.id !== keyId);
        saveToStorage('licenseKeys', keys);
        await simulateApiCall(undefined);
    },

    async toggleKeyStatus(keyId: string): Promise<Key> {
        let keys = getFromStorage<Key[]>('licenseKeys', []);
        let updatedKey: Key | undefined;
        keys = keys.map(k => {
            if (k.id === keyId) {
                updatedKey = { ...k, isActive: !k.isActive };
                return updatedKey;
            }
            return k;
        });
        saveToStorage('licenseKeys', keys);
        if (!updatedKey) throw new Error("Key not found");
        return simulateApiCall(updatedKey);
    },

    // APPLICATION API
    async getApplications(): Promise<Application[]> {
        return simulateApiCall(getFromStorage<Application[]>('applications', []));
    },
    
    async saveApplication(appData: Omit<Application, 'id'>, id: string | null): Promise<Application> {
         let apps = getFromStorage<Application[]>('applications', []);
        if (id) { // Edit
            let updatedApp: Application | undefined;
            apps = apps.map(a => {
                if (a.id === id) {
                    updatedApp = { id, ...appData };
                    return updatedApp;
                }
                return a;
            });
            saveToStorage('applications', apps);
            if (!updatedApp) throw new Error("Application not found");
            return simulateApiCall(updatedApp);
        } else { // Create
            const newApp: Application = { id: `app-${Date.now()}`, ...appData };
            apps.push(newApp);
            saveToStorage('applications', apps);
            return simulateApiCall(newApp);
        }
    },

    async deleteApplication(appId: string): Promise<void> {
        let apps = getFromStorage<Application[]>('applications', []);
        // Check for dependencies before deleting
        const keys = getFromStorage<Key[]>('licenseKeys', []);
        if(keys.some(key => key.applicationId === appId)) {
            throw new Error("Cannot delete: application is in use by one or more keys.");
        }
        apps = apps.filter(a => a.id !== appId);
        saveToStorage('applications', apps);
        await simulateApiCall(undefined);
    }
};
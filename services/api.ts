import type { User, Key, Application } from '../types';

const API_ENDPOINT = '/.netlify/functions/data';

// --- API FUNCTIONS ---

// A helper to handle fetch requests and errors
async function apiFetch<T>(resource: string, options: RequestInit = {}): Promise<T> {
    const headers = { 'Content-Type': 'application/json', ...options.headers };
    try {
        const response = await fetch(`${API_ENDPOINT}?resource=${resource}`, { ...options, headers });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'An API error occurred');
        }
        if (response.status === 204) { // No Content
            return null as T;
        }
        return response.json();
    } catch (error) {
        console.error(`API Fetch Error (${resource}):`, error);
        throw error;
    }
}


// USER API
export const api = {
    // Session management is now simplified as we don't store the user object in localStorage for long.
    // In a real-world app, you'd use JWTs (JSON Web Tokens) for this.
    // For now, we'll keep a simple in-memory cache for the current user.
    _currentUser: null as User | null,

    async login(email: string, password: string): Promise<User | null> {
        const user = await apiFetch<User>('login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
        if (user) {
            this._currentUser = user;
        }
        return user;
    },

    async getCurrentUser(): Promise<User | null> {
        // This simulates checking a session. In a real app, this would validate a token.
        return Promise.resolve(this._currentUser);
    },
    
    async setCurrentUser(user: User | null): Promise<void> {
       this._currentUser = user;
       return Promise.resolve();
    },

    async getUsers(): Promise<User[]> {
        return apiFetch<User[]>('users', { method: 'GET' });
    },

    async saveUser(userData: Pick<User, 'name' | 'email' | 'permissions' | 'password'>, id: string | null): Promise<User> {
         return apiFetch<User>('users', {
            method: id ? 'PUT' : 'POST',
            body: JSON.stringify({ ...userData, id }),
        });
    },
    
    async deleteUser(userId: string): Promise<void> {
        await apiFetch('users', {
            method: 'DELETE',
            body: JSON.stringify({ id: userId }),
        });
    },
    
    async resetPassword(userId: string): Promise<void> {
        await apiFetch('resetPassword', {
            method: 'POST',
            body: JSON.stringify({ id: userId }),
        });
    },

    // KEY API
    async getKeys(): Promise<Key[]> {
        return apiFetch<Key[]>('keys', { method: 'GET' });
    },

    async saveKey(keyData: Omit<Key, 'id'>, id: string | null): Promise<Key> {
        return apiFetch<Key>('keys', {
            method: id ? 'PUT' : 'POST',
            body: JSON.stringify({ ...keyData, id }),
        });
    },

    async deleteKey(keyId: string): Promise<void> {
        await apiFetch('keys', {
            method: 'DELETE',
            body: JSON.stringify({ id: keyId }),
        });
    },

    async toggleKeyStatus(keyId: string): Promise<Key> {
         return apiFetch<Key>('toggleKeyStatus', {
            method: 'POST',
            body: JSON.stringify({ id: keyId }),
        });
    },

    // APPLICATION API
    async getApplications(): Promise<Application[]> {
        return apiFetch<Application[]>('applications', { method: 'GET' });
    },
    
    async saveApplication(appData: Omit<Application, 'id'>, id: string | null): Promise<Application> {
         return apiFetch<Application>('applications', {
            method: id ? 'PUT' : 'POST',
            body: JSON.stringify({ ...appData, id }),
        });
    },

    async deleteApplication(appId: string): Promise<void> {
        await apiFetch('applications', {
            method: 'DELETE',
            body: JSON.stringify({ id: appId }),
        });
    }
};

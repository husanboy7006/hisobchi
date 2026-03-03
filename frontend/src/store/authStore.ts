import { create } from 'zustand';
import Cookies from 'js-cookie';

interface User {
    id: string;
    phone: string;
    first_name?: string;
    last_name?: string;
    business_name?: string;
    business_sector?: string;
    sector?: string;
    role?: string;
}

interface AuthState {
    user: User | null;
    token: string | null;
    setUser: (user: User | null) => void;
    setToken: (token: string | null) => void;
    logout: () => void;
    initialize: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    token: null,
    setUser: (user) => {
        set({ user });
        if (user) {
            Cookies.set('user', JSON.stringify(user), { expires: 7 });
        } else {
            Cookies.remove('user');
        }
    },
    setToken: (token) => {
        set({ token });
        if (token) {
            Cookies.set('token', token, { expires: 7 });
        } else {
            Cookies.remove('token');
        }
    },
    logout: () => {
        set({ user: null, token: null });
        Cookies.remove('token');
        Cookies.remove('user');
    },
    initialize: () => {
        const token = Cookies.get('token');
        const userStr = Cookies.get('user');
        if (token && userStr) {
            try {
                set({ token, user: JSON.parse(userStr) });
            } catch (e) {
                Cookies.remove('token');
                Cookies.remove('user');
            }
        }
    }
}));

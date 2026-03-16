import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiRequest } from '@/lib/axios';

interface User {
    id: string;
    email: string;
    name: string;
    avatar: string | null;
    avatar_url?: string | null;
}

interface AuthState {
    user: User | null;
    accessToken: string | null;
    refreshToken: string | null;
    setAuth: (user: User, accessToken: string, refreshToken: string) => void;
    clearAuth: () => void;
    isAuthenticated: () => boolean;
}

const useAuth = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            accessToken: null,
            refreshToken: null,

            setAuth: (user, accessToken, refreshToken) =>
                set({ user, accessToken, refreshToken }),

            clearAuth: () =>
                set({ user: null, accessToken: null, refreshToken: null }),

            isAuthenticated: () => !!get().accessToken,
        }),
        {
            name: 'bnbly-auth',
        }
    )
);

export async function loginUser(email: string, password: string) {
    const data = await apiRequest<{
        user: { id: string; email: string; name: string; avatar: string | null };
        access: string;
        refresh: string;
    }>('/auth/login/', {
        method: 'POST',
        body: { email, password },
    });
    useAuth.getState().setAuth(data.user, data.access, data.refresh);
    return data.user;
}

export async function signupUser(
    name: string,
    email: string,
    password1: string,
    password2: string
) {
    const data = await apiRequest<{
        user: { id: string; email: string; name: string; avatar: string | null };
        access: string;
        refresh: string;
    }>('/auth/signup/', {
        method: 'POST',
        body: { name, email, password1, password2 },
    });
    useAuth.getState().setAuth(data.user, data.access, data.refresh);
    return data.user;
}

export async function logoutUser() {
    const { refreshToken, clearAuth } = useAuth.getState();
    try {
        if (refreshToken) {
            await apiRequest('/auth/logout/', {
                method: 'POST',
                body: { refresh: refreshToken },
                token: useAuth.getState().accessToken ?? undefined,
            });
        }
    } finally {
        clearAuth();
    }
}

export default useAuth;

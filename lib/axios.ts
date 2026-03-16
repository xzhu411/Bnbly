const API_BASE = 'http://localhost:8000/api';

interface RequestOptions {
    method?: string;
    body?: Record<string, unknown>;
    token?: string;
}

export async function apiRequest<T>(
    endpoint: string,
    options: RequestOptions = {}
): Promise<T> {
    const { method = 'GET', body, token } = options;

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE}${endpoint}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
    });

    const data = await res.json();

    if (!res.ok) {
        const message = extractErrorMessage(data);
        throw new Error(message);
    }

    return data as T;
}

function extractErrorMessage(data: Record<string, unknown>): string {
    if (typeof data === 'string') return data;
    if (data.error && typeof data.error === 'string') return data.error;
    if (data.detail && typeof data.detail === 'string') return data.detail;
    const firstKey = Object.keys(data)[0];
    if (firstKey) {
        const val = data[firstKey];
        if (Array.isArray(val)) return val[0] as string;
        if (typeof val === 'string') return val;
    }
    return '请求失败，请重试';
}

// 自动刷新 token 的 fetch 封装
export async function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
    // 动态 import 避免循环依赖
    const { default: useAuth } = await import('@/hooks/useAuth');
    const { accessToken, refreshToken, setAuth, clearAuth, user } = useAuth.getState();

    // 先用现有 token 请求
    const res = await fetch(url, {
        ...options,
        headers: {
            ...options.headers,
            'Authorization': `Bearer ${accessToken}`,
        },
    });

    // 如果 401，尝试用 refresh token 换新 token
    if (res.status === 401 && refreshToken) {
        try {
            const refreshRes = await fetch(`${API_BASE}/auth/token/refresh/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refresh: refreshToken }),
            });

            if (refreshRes.ok) {
                const data = await refreshRes.json();
                const newAccessToken = data.access;
                // 更新 store 里的 token
                if (user) {
                    setAuth(user, newAccessToken, refreshToken);
                }
                // 用新 token 重试原请求
                return fetch(url, {
                    ...options,
                    headers: {
                        ...options.headers,
                        'Authorization': `Bearer ${newAccessToken}`,
                    },
                });
            } else {
                // refresh token 也过期了，登出
                clearAuth();
            }
        } catch {
            clearAuth();
        }
    }

    return res;
}

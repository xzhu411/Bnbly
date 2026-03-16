'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import useAuth from "@/hooks/useAuth";
import { authFetch } from "@/lib/axios";
import { API_URL } from "@/lib/config";

const ProfilePage = () => {
    const { user, accessToken, isAuthenticated, setAuth, refreshToken } = useAuth();
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const [name, setName] = useState('');
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    useEffect(() => { setMounted(true); }, []);

    useEffect(() => {
        if (!mounted) return;
        if (!isAuthenticated()) { router.push('/'); return; }
        if (user) {
            setName(user.name || '');
            if (user.avatar) {
                const url = user.avatar.startsWith('http')
                    ? user.avatar
                    : `${API_URL}${user.avatar}`;
                setAvatarPreview(url);
            }
        }
    }, [mounted, user]);

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setAvatarFile(file);
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    const handleSave = async () => {
        if (!accessToken) return;
        setIsLoading(true);
        setSuccess('');
        setError('');

        try {
            const formData = new FormData();
            if (name) formData.append('name', name);
            if (avatarFile) formData.append('avatar', avatarFile);

            const res = await authFetch(`${API_URL}/api/auth/profile/`, {
                method: 'PATCH',
                headers: { Authorization: `Bearer ${accessToken}` },
                body: formData,
            });

            if (res.ok) {
                const updatedUser = await res.json();
                if (refreshToken) {
                    setAuth(updatedUser, accessToken, refreshToken);
                }
                setSuccess('Profile updated successfully!');
                setAvatarFile(null);
                // Update preview with full URL
                if (updatedUser.avatar) {
                    const url = updatedUser.avatar.startsWith('http')
                        ? updatedUser.avatar
                        : `${API_URL}${updatedUser.avatar}`;
                    setAvatarPreview(url);
                }
            } else {
                setError('Failed to update profile');
            }
        } catch {
            setError('Failed to update profile');
        } finally {
            setIsLoading(false);
        }
    };

    if (!mounted || !isAuthenticated()) return null;

    const initials = name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || '?';

    return (
        <main className="max-w-[600px] mx-auto px-6 py-10">
            <h1 className="text-2xl font-bold mb-8">Your Profile</h1>

            <div className="space-y-6">
                {/* Avatar */}
                <div className="flex flex-col items-center gap-3">
                    <label className="cursor-pointer group relative">
                        <div className="w-28 h-28 rounded-full overflow-hidden bg-airbnb flex items-center justify-center text-white text-4xl font-bold select-none">
                            {avatarPreview ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={avatarPreview}
                                    alt="avatar"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <span>{initials}</span>
                            )}
                        </div>
                        <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </div>
                        <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                    </label>
                    <p className="text-sm text-gray-400">Click to change photo</p>
                </div>

                {/* Name */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Display Name</label>
                    <input
                        type="text"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="Your name"
                        className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-airbnb"
                    />
                </div>

                {/* Email (read only) */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
                    <input
                        type="email"
                        value={user?.email || ''}
                        disabled
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-400 cursor-not-allowed"
                    />
                    <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
                </div>

                {success && (
                    <div className="rounded-xl bg-green-50 border border-green-200 px-4 py-3">
                        <p className="text-sm text-green-600 font-medium">✓ {success}</p>
                    </div>
                )}
                {error && (
                    <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3">
                        <p className="text-sm text-red-600">• {error}</p>
                    </div>
                )}

                <button
                    onClick={handleSave}
                    disabled={isLoading}
                    className="w-full py-3 bg-airbnb text-white rounded-xl font-semibold hover:bg-airbnb-dark transition disabled:opacity-60"
                >
                    {isLoading ? 'Saving...' : 'Save changes'}
                </button>
            </div>
        </main>
    );
};

export default ProfilePage;

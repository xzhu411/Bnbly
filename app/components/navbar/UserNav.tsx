'use client';

import { useState } from "react";
import MenuLink from "./MenuLink";
import useLoginModal from "@/hooks/useLoginModal";
import useSignupModal from "@/hooks/useSignupModal";
import useAuth, { logoutUser } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

const UserNav = () => {
    const [isOpen, setIsOpen] = useState(false);
    const loginModal = useLoginModal();
    const signupModal = useSignupModal();
    const { user, isAuthenticated } = useAuth();
    const router = useRouter();

    const handleSignIn = () => { setIsOpen(false); loginModal.open(); };
    const handleSignUp = () => { setIsOpen(false); signupModal.open(); };
    const handleLogout = async () => {
        setIsOpen(false);
        await logoutUser();
        router.push('/');
    };

    // Fix: safely handle null avatar
    const rawAvatar = (user as any)?.avatar_url || user?.avatar || null;
    const avatarUrl = rawAvatar
        ? (rawAvatar.startsWith('http') ? rawAvatar : `http://localhost:8000${rawAvatar}`)
        : null;

    const initials = user?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || '?';

    return (
        <div className="p-2 relative inline-block border rounded-full border-gray-300">
            <button
                className="flex items-center hover:bg-gray-100 rounded-full p-2 transition gap-2"
                onClick={() => setIsOpen(!isOpen)}
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>

                {isAuthenticated() && user ? (
                    <div className="h-8 w-8 rounded-full overflow-hidden bg-airbnb flex items-center justify-center text-white text-sm font-bold">
                        {avatarUrl ? (
                            <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                        ) : (
                            <span>{initials}</span>
                        )}
                    </div>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                    </svg>
                )}
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
                    <div className="w-[220px] absolute top-[60px] right-0 bg-white border border-gray-300 rounded-xl shadow-md flex flex-col overflow-hidden z-20">
                        {isAuthenticated() ? (
                            <>
                                {user && (
                                    <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full overflow-hidden bg-airbnb flex items-center justify-center text-white text-sm font-bold shrink-0">
                                            {avatarUrl ? (
                                                <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                                            ) : (
                                                <span>{initials}</span>
                                            )}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
                                            <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                        </div>
                                    </div>
                                )}
                                <MenuLink label="Profile" onClick={() => setIsOpen(false)} href="/profile" />
                                <MenuLink label="My properties" onClick={() => setIsOpen(false)} href="/myproperties" />
                                <MenuLink label="Reservations" onClick={() => setIsOpen(false)} href="/myreservations" />
                                <MenuLink label="My favourites" onClick={() => setIsOpen(false)} href="/myfavourites" />
                                <MenuLink label="Inbox" onClick={() => setIsOpen(false)} href="/inbox" />
                                <div className="border-t border-gray-100" />
                                <MenuLink label="Log out" onClick={handleLogout} href="#" />
                            </>
                        ) : (
                            <>
                                <MenuLink label="Log in" onClick={handleSignIn} href="#" />
                                <MenuLink label="Sign up" onClick={handleSignUp} href="#" />
                            </>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default UserNav;

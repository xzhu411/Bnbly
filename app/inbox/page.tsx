'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import useAuth from "@/hooks/useAuth";
import useLoginModal from "@/hooks/useLoginModal";

interface Participant {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
    avatar_url?: string | null;
}

interface LastMessage {
    body: string;
    sender: string;
}

interface ReservationInfo {
    check_in: string;
    check_out: string;
    guests: number;
    guest_name: string;
}

interface Conversation {
    id: string;
    participants: Participant[];
    last_message: LastMessage | null;
    property_title: string | null;
    property_id: string | null;
    property_landlord_id: string | null;
    reservation_info: ReservationInfo | null;
    modified_at: string;
}

const InboxPage = () => {
    const { accessToken, user, isAuthenticated } = useAuth();
    const loginModal = useLoginModal();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [mounted, setMounted] = useState(false);

    useEffect(() => { setMounted(true); }, []);

    useEffect(() => {
        if (!mounted) return;
        if (!isAuthenticated()) { setIsLoading(false); return; }
        fetch("http://localhost:8000/api/conversations/", {
            headers: { Authorization: `Bearer ${accessToken}` },
        })
            .then(res => res.json())
            .then(data => { setConversations(Array.isArray(data) ? data : []); setIsLoading(false); })
            .catch(() => setIsLoading(false));
    }, [mounted, accessToken]);

    if (!mounted) return (
        <main className="max-w-[1500px] mx-auto px-6 pb-6">
            <h1 className="my-6 text-2xl font-bold">Inbox</h1>
        </main>
    );

    if (!isAuthenticated()) return (
        <main className="max-w-[1500px] mx-auto px-6 pb-6">
            <h1 className="my-6 text-2xl font-bold">Inbox</h1>
            <div className="text-center py-20 text-gray-400">
                <p className="text-lg">Please log in to view your messages</p>
                <button onClick={() => loginModal.open()} className="mt-4 text-airbnb hover:underline">Log in</button>
            </div>
        </main>
    );

    if (isLoading) return (
        <main className="max-w-[1500px] mx-auto px-6 pb-6">
            <h1 className="my-6 text-2xl font-bold">Inbox</h1>
            <p className="text-gray-400">Loading...</p>
        </main>
    );

    return (
        <main className="max-w-[1500px] mx-auto px-6 pb-6">
            <h1 className="my-6 text-2xl font-bold">Inbox</h1>

            {conversations.length === 0 ? (
                <div className="text-center py-20 text-gray-400">
                    <p className="text-lg">No messages yet</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {conversations.map((conv) => {
                        const other = conv.participants.find(p => p.id !== user?.id);
                        const otherAvatarUrl = other?.avatar_url || (other?.avatar
                            ? (other.avatar.startsWith('http') ? other.avatar : `http://localhost:8000${other.avatar}`)
                            : null);

                        // If current user is the landlord → other person is Guest
                        // If current user is NOT the landlord → other person is Host
                        const currentUserIsLandlord = conv.property_landlord_id === user?.id;
                        const roleLabel = conv.property_id
                            ? (currentUserIsLandlord ? 'Guest' : 'Host')
                            : null;
                        const roleBg = currentUserIsLandlord
                            ? 'bg-blue-100 text-blue-700'   // other is Guest → blue
                            : 'bg-purple-100 text-purple-700'; // other is Host → purple

                        return (
                            <Link key={conv.id} href={`/inbox/${conv.id}`}>
                                <article className="mb-2 rounded-2xl border border-gray-200 bg-white px-5 py-4 transition hover:border-gray-300 hover:shadow-sm cursor-pointer">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex min-w-0 items-start gap-4">
                                            <div className="h-12 w-12 shrink-0 rounded-full overflow-hidden bg-airbnb flex items-center justify-center text-white text-lg font-bold">
                                                {otherAvatarUrl ? (
                                                    <img src={otherAvatarUrl} alt="avatar" className="w-full h-full object-cover" />
                                                ) : (
                                                    other?.name?.charAt(0).toUpperCase() ?? "?"
                                                )}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex flex-wrap items-center gap-2 mb-1">
                                                    <p className="font-semibold text-gray-900">{other?.name ?? "Unknown"}</p>
                                                    {roleLabel && (
                                                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${roleBg}`}>
                                                            {roleLabel}
                                                        </span>
                                                    )}
                                                    {conv.property_title && (
                                                        <span className="text-xs bg-airbnb/10 text-airbnb px-2 py-0.5 rounded-full font-medium truncate max-w-[160px]">
                                                            {conv.property_title}
                                                        </span>
                                                    )}
                                                </div>

                                                <p className="truncate text-sm text-gray-500">
                                                    {conv.last_message
                                                        ? `${conv.last_message.sender}: ${conv.last_message.body}`
                                                        : "Start the conversation..."}
                                                </p>

                                                {conv.reservation_info && (
                                                    <div className="mt-2 inline-flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-3 py-1.5 text-xs text-green-700">
                                                        <span>📅</span>
                                                        <span className="font-semibold">{conv.reservation_info.guest_name}</span>
                                                        <span>booked</span>
                                                        <span className="font-semibold">{conv.reservation_info.check_in} → {conv.reservation_info.check_out}</span>
                                                        <span>·</span>
                                                        <span>{conv.reservation_info.guests} guest{conv.reservation_info.guests > 1 ? 's' : ''}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="shrink-0">
                                            <p className="text-xs text-gray-400">
                                                {new Date(conv.modified_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                </article>
                            </Link>
                        );
                    })}
                </div>
            )}
        </main>
    );
};

export default InboxPage;

'use client';

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import CustomButton from "@/app/components/forms/CustomButton";
import useAuth from "@/hooks/useAuth";

interface Sender {
    id: string;
    name: string;
    avatar: string | null;
    avatar_url?: string | null;
}

interface Message {
    id: string;
    sender: Sender;
    body: string;
    created_at: string;
}

interface Participant {
    id: string;
    name: string;
    avatar: string | null;
    avatar_url?: string | null;
}

interface ReservationInfo {
    check_in: string;
    check_out: string;
    guests: number;
    guest_name: string;
}

interface ConversationInfo {
    participants: Participant[];
    property_title: string | null;
    property_id: string | null;
    property_landlord_id: string | null;
    reservation_info: ReservationInfo | null;
    messages: Message[];
}

const ConversationDetail = ({ conversationId }: { conversationId: string }) => {
    const { accessToken, user, isAuthenticated } = useAuth();
    const router = useRouter();
    const [info, setInfo] = useState<ConversationInfo | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [connected, setConnected] = useState(false);
    const [mounted, setMounted] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);
    const wsRef = useRef<WebSocket | null>(null);

    useEffect(() => { setMounted(true); }, []);

    // Load initial conversation info
    useEffect(() => {
        if (!mounted || !accessToken) return;
        if (!isAuthenticated()) { router.push('/'); return; }

        fetch(`http://localhost:8000/api/conversations/${conversationId}/`, {
            headers: { Authorization: `Bearer ${accessToken}` },
        })
            .then(res => res.json())
            .then(data => {
                setInfo(data);
                setMessages(data.messages ?? []);
            });
    }, [mounted, conversationId, accessToken]);

    // WebSocket connection
    useEffect(() => {
        if (!mounted || !accessToken || !isAuthenticated()) return;

        const ws = new WebSocket(
            `ws://localhost:8000/ws/conversations/${conversationId}/?token=${accessToken}`
        );

        ws.onopen = () => {
            setConnected(true);
            wsRef.current = ws;
        };

        ws.onmessage = (event) => {
            const msg = JSON.parse(event.data);
            setMessages(prev => {
                // Avoid duplicates
                if (prev.find(m => m.id === msg.id)) return prev;
                return [...prev, msg];
            });
        };

        ws.onclose = () => {
            setConnected(false);
            wsRef.current = null;
        };

        ws.onerror = () => {
            setConnected(false);
        };

        return () => {
            ws.close();
        };
    }, [mounted, conversationId, accessToken]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = async () => {
        if (!newMessage.trim()) return;
        const body = newMessage.trim();
        setNewMessage("");

        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            // Send via WebSocket
            wsRef.current.send(JSON.stringify({ body }));
        } else {
            // Fallback to HTTP if WebSocket not connected
            setIsLoading(true);
            try {
                const res = await fetch(
                    `http://localhost:8000/api/conversations/${conversationId}/send/`,
                    {
                        method: "POST",
                        headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
                        body: JSON.stringify({ body }),
                    }
                );
                if (res.ok) {
                    const msg = await res.json();
                    setMessages(prev => [...prev, msg]);
                }
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
    };

    if (!mounted || !isAuthenticated()) return null;

    const other = info?.participants.find(p => p.id !== user?.id);
    const otherAvatarUrl = other?.avatar_url || (other?.avatar
        ? (other.avatar.startsWith('http') ? other.avatar : `http://localhost:8000${other.avatar}`)
        : null);
    const currentUserIsLandlord = info?.property_landlord_id === user?.id;
    const roleLabel = info?.property_id ? (currentUserIsLandlord ? 'Guest' : 'Host') : null;
    const roleBg = currentUserIsLandlord ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700';

    return (
        <>
            {info && (
                <div className="rounded-2xl border border-gray-200 bg-white mb-2 overflow-hidden">
                    <div className="flex items-center justify-between p-4">
                        <Link href={`/landlords/${other?.id}`} className="flex items-center gap-3 hover:opacity-80 transition">
                            <div className="h-11 w-11 rounded-full overflow-hidden bg-airbnb flex items-center justify-center text-white font-bold shrink-0">
                                {otherAvatarUrl ? (
                                    <img src={otherAvatarUrl} alt="avatar" className="w-full h-full object-cover" />
                                ) : other?.name?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <p className="font-semibold text-gray-900 text-sm">{other?.name}</p>
                                    {roleLabel && (
                                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${roleBg}`}>{roleLabel}</span>
                                    )}
                                    {/* WebSocket status */}
                                    <span className={`w-2 h-2 rounded-full ${connected ? 'bg-green-400' : 'bg-gray-300'}`} title={connected ? 'Connected' : 'Connecting...'} />
                                </div>
                                <p className="text-xs text-gray-400">View profile →</p>
                            </div>
                        </Link>

                        {info.property_id && info.property_title && (
                            <Link href={`/properties/${info.property_id}`}
                                className="flex items-center gap-2 px-4 py-2 bg-airbnb/10 text-airbnb rounded-xl hover:bg-airbnb/20 transition text-sm font-semibold">
                                🏡 {info.property_title}
                            </Link>
                        )}
                    </div>

                    {info.reservation_info && (
                        <div className="mx-4 mb-4 flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-2.5 text-sm text-green-700">
                            <span>📅</span>
                            <span className="font-semibold">{info.reservation_info.guest_name}</span>
                            <span>has booked ·</span>
                            <span className="font-semibold">{info.reservation_info.check_in} → {info.reservation_info.check_out}</span>
                            <span>· {info.reservation_info.guests} guest{info.reservation_info.guests > 1 ? 's' : ''}</span>
                        </div>
                    )}
                </div>
            )}

            <div className="max-h-[55vh] overflow-auto flex flex-col space-y-4 p-2">
                {messages.length === 0 && (
                    <p className="text-center text-gray-400 py-10">No messages yet. Send the first one!</p>
                )}
                {messages.map((msg) => {
                    const isMe = msg.sender.id === user?.id;
                    const senderAvatarUrl = msg.sender.avatar_url || (msg.sender.avatar
                        ? (msg.sender.avatar.startsWith('http') ? msg.sender.avatar : `http://localhost:8000${msg.sender.avatar}`)
                        : null);
                    return (
                        <div key={msg.id} className={`flex items-end gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                            <div className="h-8 w-8 rounded-full overflow-hidden bg-airbnb flex items-center justify-center text-white text-xs font-bold shrink-0">
                                {senderAvatarUrl ? (
                                    <img src={senderAvatarUrl} alt="avatar" className="w-full h-full object-cover" />
                                ) : msg.sender.name?.charAt(0).toUpperCase()}
                            </div>
                            <div className={`max-w-[70%] py-3 px-4 rounded-2xl ${isMe ? 'bg-airbnb text-white rounded-br-sm' : 'bg-gray-100 text-gray-900 rounded-bl-sm'}`}>
                                <p className="text-sm">{msg.body}</p>
                                <p className={`text-xs mt-1 ${isMe ? 'text-white/70' : 'text-gray-400'} text-right`}>
                                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        </div>
                    );
                })}
                <div ref={bottomRef} />
            </div>

            <div className="mt-4 flex items-center space-x-3 rounded-xl border border-gray-300 px-4 py-3">
                <input
                    type="text"
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={connected ? "Type a message... (Enter to send)" : "Connecting..."}
                    className="h-11 w-full rounded-xl bg-gray-100 px-4 outline-none"
                />
                <CustomButton
                    label={isLoading ? "..." : "Send"}
                    onClick={handleSend}
                    className="h-11 w-[100px] bg-airbnb px-4 py-2 text-white"
                />
            </div>
        </>
    );
};

export default ConversationDetail;

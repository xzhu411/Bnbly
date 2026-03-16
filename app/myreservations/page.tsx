'use client';

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import useAuth from "@/hooks/useAuth";
import { authFetch } from "@/lib/axios";

interface Property {
    id: string;
    title: string;
    image: string | null;
    price_per_night: number;
}

interface Guest {
    id: string;
    name: string;
    email: string;
    avatar_url?: string | null;
}

interface Reservation {
    id: string;
    property: Property;
    guest: Guest;
    check_in: string;
    check_out: string;
    guests: number;
    total_price: number;
}

type Tab = 'guest' | 'host';

const MyReservationsPage = () => {
    const { accessToken, isAuthenticated } = useAuth();
    const [tab, setTab] = useState<Tab>('guest');
    const [guestReservations, setGuestReservations] = useState<Reservation[]>([]);
    const [hostReservations, setHostReservations] = useState<Reservation[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [cancellingId, setCancellingId] = useState<string | null>(null);

    const fetchAll = () => {
        if (!isAuthenticated() || !accessToken) { setIsLoading(false); return; }
        Promise.all([
            authFetch("http://localhost:8000/api/reservations/my/", {
                headers: { Authorization: `Bearer ${accessToken}` },
            }).then(r => r.json()),
            authFetch("http://localhost:8000/api/reservations/hosting/", {
                headers: { Authorization: `Bearer ${accessToken}` },
            }).then(r => r.json()),
        ]).then(([guest, host]) => {
            setGuestReservations(Array.isArray(guest) ? guest : []);
            setHostReservations(Array.isArray(host) ? host : []);
            setIsLoading(false);
        }).catch(() => setIsLoading(false));
    };

    useEffect(() => { fetchAll(); }, [accessToken]);

    const handleCancelAsGuest = async (id: string) => {
        if (!confirm("Cancel this reservation?")) return;
        setCancellingId(id);
        const res = await authFetch(`http://localhost:8000/api/reservations/cancel/${id}/`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (res.ok) setGuestReservations(prev => prev.filter(r => r.id !== id));
        setCancellingId(null);
    };

    const handleCancelAsHost = async (id: string) => {
        if (!confirm("Cancel this guest's reservation?")) return;
        setCancellingId(id);
        const res = await authFetch(`http://localhost:8000/api/reservations/host-cancel/${id}/`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (res.ok) setHostReservations(prev => prev.filter(r => r.id !== id));
        setCancellingId(null);
    };

    const getImageSrc = (image: string | null) =>
        image ? (image.startsWith('http') ? image : `http://localhost:8000${image}`) : '/beach1.jpeg';

    if (isLoading) return (
        <main className="max-w-[1500px] mx-auto px-6 pb-6">
            <h1 className="my-6 text-2xl font-bold">Reservations</h1>
            <p className="text-gray-400">Loading...</p>
        </main>
    );

    const current = tab === 'guest' ? guestReservations : hostReservations;

    return (
        <main className="max-w-[1500px] mx-auto px-6 pb-6">
            <h1 className="my-6 text-2xl font-bold">Reservations</h1>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 border-b border-gray-200">
                <button
                    onClick={() => setTab('guest')}
                    className={`pb-3 px-4 text-sm font-semibold border-b-2 transition ${tab === 'guest' ? 'border-airbnb text-airbnb' : 'border-transparent text-gray-500 hover:text-gray-900'}`}
                >
                    My trips
                    {guestReservations.length > 0 && (
                        <span className="ml-2 bg-airbnb text-white text-xs rounded-full px-1.5 py-0.5">{guestReservations.length}</span>
                    )}
                </button>
                <button
                    onClick={() => setTab('host')}
                    className={`pb-3 px-4 text-sm font-semibold border-b-2 transition ${tab === 'host' ? 'border-airbnb text-airbnb' : 'border-transparent text-gray-500 hover:text-gray-900'}`}
                >
                    My guests
                    {hostReservations.length > 0 && (
                        <span className="ml-2 bg-airbnb text-white text-xs rounded-full px-1.5 py-0.5">{hostReservations.length}</span>
                    )}
                </button>
            </div>

            {/* Empty state */}
            {current.length === 0 && (
                <div className="text-center py-20 text-gray-400">
                    {tab === 'guest' ? (
                        <>
                            <p className="text-lg">No trips booked yet</p>
                            <Link href="/" className="mt-4 inline-block text-airbnb hover:underline">Browse properties</Link>
                        </>
                    ) : (
                        <p className="text-lg">No guests have booked your properties yet</p>
                    )}
                </div>
            )}

            {/* Reservations list */}
            <div className="space-y-4">
                {current.map((reservation) => (
                    <div key={reservation.id} className="p-5 grid grid-cols-1 md:grid-cols-4 gap-4 shadow-sm border border-gray-200 rounded-2xl hover:border-gray-300 transition">
                        {/* Property image */}
                        <div className="col-span-1">
                            <Link href={`/properties/${reservation.property.id}`}>
                                <div className="relative overflow-hidden aspect-square rounded-xl cursor-pointer">
                                    <Image
                                        fill
                                        src={getImageSrc(reservation.property.image)}
                                        className="hover:scale-110 object-cover transition"
                                        alt={reservation.property.title}
                                    />
                                </div>
                            </Link>
                        </div>

                        {/* Details */}
                        <div className="col-span-1 md:col-span-3 flex flex-col justify-between">
                            <div className="space-y-1.5">
                                <div className="flex items-start justify-between">
                                    <Link href={`/properties/${reservation.property.id}`}>
                                        <h2 className="text-xl font-semibold hover:underline">{reservation.property.title}</h2>
                                    </Link>
                                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${tab === 'guest' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                                        {tab === 'guest' ? 'Guest' : 'Host'}
                                    </span>
                                </div>

                                {/* Guest info (for host view) */}
                                {tab === 'host' && (
                                    <div className="flex items-center gap-2">
                                        <div className="w-7 h-7 rounded-full bg-airbnb flex items-center justify-center text-white text-xs font-bold overflow-hidden">
                                            {reservation.guest.avatar_url ? (
                                                <img src={reservation.guest.avatar_url} alt="guest" className="w-full h-full object-cover" />
                                            ) : reservation.guest.name.charAt(0).toUpperCase()}
                                        </div>
                                        <Link href={`/landlords/${reservation.guest.id}`} className="text-sm font-medium text-gray-700 hover:underline">
                                            {reservation.guest.name}
                                        </Link>
                                        <span className="text-xs text-gray-400">{reservation.guest.email}</span>
                                    </div>
                                )}

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
                                    <div className="bg-gray-50 rounded-xl p-3">
                                        <p className="text-xs text-gray-400 mb-0.5">Check in</p>
                                        <p className="text-sm font-semibold">{reservation.check_in}</p>
                                    </div>
                                    <div className="bg-gray-50 rounded-xl p-3">
                                        <p className="text-xs text-gray-400 mb-0.5">Check out</p>
                                        <p className="text-sm font-semibold">{reservation.check_out}</p>
                                    </div>
                                    <div className="bg-gray-50 rounded-xl p-3">
                                        <p className="text-xs text-gray-400 mb-0.5">Guests</p>
                                        <p className="text-sm font-semibold">{reservation.guests}</p>
                                    </div>
                                    <div className="bg-gray-50 rounded-xl p-3">
                                        <p className="text-xs text-gray-400 mb-0.5">Total</p>
                                        <p className="text-sm font-semibold">${reservation.total_price}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 mt-4">
                                <Link
                                    href={`/properties/${reservation.property.id}`}
                                    className="py-2 px-5 bg-airbnb text-white rounded-xl hover:bg-airbnb-dark transition text-sm font-semibold"
                                >
                                    View property
                                </Link>
                                {tab === 'host' && (
                                    <Link
                                        href={`/inbox`}
                                        className="py-2 px-5 border border-gray-300 rounded-xl hover:bg-gray-50 transition text-sm font-semibold"
                                    >
                                        Message guest
                                    </Link>
                                )}
                                <button
                                    onClick={() => tab === 'guest' ? handleCancelAsGuest(reservation.id) : handleCancelAsHost(reservation.id)}
                                    disabled={cancellingId === reservation.id}
                                    className="py-2 px-5 border border-red-200 text-red-500 rounded-xl hover:bg-red-50 transition text-sm font-semibold disabled:opacity-50"
                                >
                                    {cancellingId === reservation.id ? "Cancelling..." : "Cancel"}
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </main>
    );
};

export default MyReservationsPage;

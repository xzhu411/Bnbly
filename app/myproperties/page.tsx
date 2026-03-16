'use client';

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import useAuth from "@/hooks/useAuth";
import useAddPropertyModal from "@/hooks/useAddPropertyModal";
import { authFetch } from "@/lib/axios";

interface Property {
    id: string;
    title: string;
    image: string | null;
    price_per_night: number;
    country: string;
    city: string;
    state: string;
    category: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const MyPropertiesPage = () => {
    const { accessToken, isAuthenticated } = useAuth();
    const [properties, setProperties] = useState<Property[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [mounted, setMounted] = useState(false);
    const addPropertyModal = useAddPropertyModal();

    useEffect(() => { setMounted(true); }, []);

    useEffect(() => {
        if (!mounted || !isAuthenticated()) { setIsLoading(false); return; }
        authFetch(`${API_BASE}/api/properties/my/`, {
            headers: { Authorization: `Bearer ${accessToken}` },
        })
            .then(res => res.json())
            .then(data => {
                setProperties(Array.isArray(data) ? data : []);
                setIsLoading(false);
            })
            .catch(() => setIsLoading(false));
    }, [mounted, accessToken]);

    const handleDelete = async (id: string, title: string) => {
        if (!confirm(`Are you sure you want to delete "${title}"?`)) return;
        setDeletingId(id);
        try {
            const res = await authFetch(
                `${API_BASE}/api/properties/${id}/delete/`,
                {
                    method: 'DELETE',
                    headers: { Authorization: `Bearer ${accessToken}` },
                }
            );
            if (res.ok) {
                setProperties(prev => prev.filter(p => p.id !== id));
            }
        } finally {
            setDeletingId(null);
        }
    };

    if (!mounted) return (
        <main className="max-w-[1500px] mx-auto px-6 pb-6">
            <h1 className="my-6 text-2xl font-bold">My Properties</h1>
        </main>
    );

    return (
        <main className="max-w-[1500px] mx-auto px-6 pb-6">
            <div className="flex justify-between items-center my-6">
                <h1 className="text-2xl font-bold">My Properties</h1>
                <button
                    onClick={() => addPropertyModal.open()}
                    className="px-6 py-3 bg-airbnb text-white rounded-xl hover:bg-airbnb-dark transition text-sm font-semibold"
                >
                    + List new property
                </button>
            </div>

            {!isAuthenticated() && (
                <div className="text-center py-20 text-gray-400">
                    <p className="text-lg">Please log in to view your properties</p>
                </div>
            )}

            {isAuthenticated() && !isLoading && properties.length === 0 && (
                <div className="text-center py-20 text-gray-400">
                    <p className="text-lg">You haven't listed any properties yet</p>
                    <button onClick={() => addPropertyModal.open()} className="mt-4 inline-block text-airbnb hover:underline">
                        List your first property
                    </button>
                </div>
            )}

            {isLoading && <p className="text-gray-400">Loading...</p>}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {properties.map((property) => (
                    <div key={property.id} className="group relative">
                        <Link href={`/properties/${property.id}`}>
                            <div className="cursor-pointer">
                                <div className="relative overflow-hidden aspect-square rounded-xl">
                                    <Image
                                        fill
                                        src={property.image ?? "/beach1.jpeg"}
                                        alt={property.title}
                                        className="object-cover w-full h-full transition-transform ease-in-out group-hover:scale-110"
                                    />
                                </div>
                                <div className="mt-2">
                                    <p className="text-lg font-bold">{property.title}</p>
                                    <p className="text-sm text-gray-500">{property.city && `${property.city}, `}{property.country} · {property.category}</p>
                                    <p className="text-sm text-gray-500 mt-1"><strong>${property.price_per_night}</strong> / night</p>
                                </div>
                            </div>
                        </Link>

                        {/* Edit / Delete buttons */}
                        <div className="flex gap-2 mt-3">
                            <Link
                                href={`/myproperties/${property.id}/edit`}
                                className="flex-1 text-center py-2 px-4 border border-gray-300 rounded-xl text-sm font-semibold hover:bg-gray-50 transition"
                            >
                                Edit
                            </Link>
                            <button
                                onClick={() => handleDelete(property.id, property.title)}
                                disabled={deletingId === property.id}
                                className="flex-1 py-2 px-4 border border-red-300 text-red-500 rounded-xl text-sm font-semibold hover:bg-red-50 transition disabled:opacity-50"
                            >
                                {deletingId === property.id ? "Deleting..." : "Delete"}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </main>
    );
};

export default MyPropertiesPage;

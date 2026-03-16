'use client';

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import useAuth from "@/hooks/useAuth";

interface Property {
    id: string;
    title: string;
    image: string | null;
    price_per_night: number;
    country: string;
    category: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const MyFavouritesPage = () => {
    const { accessToken, isAuthenticated } = useAuth();
    const [properties, setProperties] = useState<Property[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [mounted, setMounted] = useState(false);

    useEffect(() => { setMounted(true); }, []);

    useEffect(() => {
        if (!mounted || !isAuthenticated()) {
            setIsLoading(false);
            return;
        }

        fetch(`${API_BASE}/api/properties/favourites/`, {
            headers: { Authorization: `Bearer ${accessToken}` },
        })
            .then(res => res.json())
            .then(data => {
                setProperties(Array.isArray(data) ? data : []);
                setIsLoading(false);
            })
            .catch(() => setIsLoading(false));
    }, [mounted, accessToken]);

    if (!mounted) return (
        <main className="max-w-[1500px] mx-auto px-6 pb-6">
            <h1 className="my-6 text-2xl font-bold">My Favourites</h1>
        </main>
    );

    return (
        <main className="max-w-[1500px] mx-auto px-6 pb-6">
            <h1 className="my-6 text-2xl font-bold">My Favourites</h1>

            {!isAuthenticated() && (
                <div className="text-center py-20 text-gray-400">
                    <p className="text-lg">Please log in to view your favourites</p>
                </div>
            )}

            {isAuthenticated() && !isLoading && properties.length === 0 && (
                <div className="text-center py-20 text-gray-400">
                    <p className="text-lg">No favourites yet</p>
                    <Link href="/" className="mt-4 inline-block text-airbnb hover:underline">
                        Browse properties
                    </Link>
                </div>
            )}

            {isLoading && <p className="text-gray-400">Loading...</p>}

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-5">
                {properties.map((property) => (
                    <Link key={property.id} href={`/properties/${property.id}`}>
                        <div className="cursor-pointer group">
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
                                <p className="text-sm text-gray-500">{property.country} · {property.category}</p>
                                <p className="text-sm text-gray-500 mt-1">
                                    <strong>${property.price_per_night}</strong> / night
                                </p>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </main>
    );
};

export default MyFavouritesPage;

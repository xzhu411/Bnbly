'use client';

import { useEffect, useState } from "react";
import useAuth from "@/hooks/useAuth";
import useLoginModal from "@/hooks/useLoginModal";

interface FavouriteButtonProps {
    propertyId: string;
}

const FavouriteButton = ({ propertyId }: FavouriteButtonProps) => {
    const { accessToken, isAuthenticated } = useAuth();
    const loginModal = useLoginModal();
    const [isFavourited, setIsFavourited] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // 检查是否已收藏
    useEffect(() => {
        if (!isAuthenticated() || !accessToken) return;

        fetch("http://localhost:8000/api/properties/favourites/", {
            headers: { Authorization: `Bearer ${accessToken}` },
        })
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setIsFavourited(data.some((p: { id: string }) => p.id === propertyId));
                }
            })
            .catch(() => {});
    }, [accessToken, propertyId]);

    const handleToggle = async () => {
        if (!isAuthenticated()) {
            loginModal.open();
            return;
        }

        setIsLoading(true);
        try {
            const res = await fetch(
                `http://localhost:8000/api/properties/${propertyId}/toggle-favourite/`,
                {
                    method: "POST",
                    headers: { Authorization: `Bearer ${accessToken}` },
                }
            );
            const data = await res.json();
            if (res.ok) {
                setIsFavourited(data.status === 'added');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <button
            onClick={handleToggle}
            disabled={isLoading}
            className="flex items-center gap-2 mt-4 px-4 py-2 rounded-full border border-gray-300 hover:border-gray-400 transition disabled:opacity-60"
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className={`size-5 transition ${isFavourited ? 'fill-airbnb stroke-airbnb' : 'fill-none'}`}
            >
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
            </svg>
            <span className="text-sm font-medium">
                {isFavourited ? 'Saved' : 'Save'}
            </span>
        </button>
    );
};

export default FavouriteButton;

'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import useAuth from "@/hooks/useAuth";
import useLoginModal from "@/hooks/useLoginModal";
import { API_URL } from "@/lib/config";

interface ContactHostProps {
    landlordId: string;
    propertyId: string;
}

const ContactHost = ({ landlordId, propertyId }: ContactHostProps) => {
    const { accessToken, user, isAuthenticated } = useAuth();
    const loginModal = useLoginModal();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const handleContact = async () => {
        if (!isAuthenticated()) { loginModal.open(); return; }
        if (user?.id === landlordId) return;

        setIsLoading(true);
        try {
            const res = await fetch(
                `${API_URL}/api/conversations/start/${landlordId}/`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${accessToken}`,
                    },
                    body: JSON.stringify({ property_id: propertyId }),
                }
            );
            const data = await res.json();
            if (res.ok) router.push(`/inbox/${data.conversation_id}`);
        } finally {
            setIsLoading(false);
        }
    };

    if (user?.id === landlordId) return null;

    return (
        <button
            onClick={handleContact}
            disabled={isLoading}
            className="mt-4 w-full py-3 px-6 bg-gray-900 text-white rounded-xl hover:bg-gray-700 transition font-semibold disabled:opacity-60"
        >
            {isLoading ? "Connecting..." : "Contact host"}
        </button>
    );
};

export default ContactHost;

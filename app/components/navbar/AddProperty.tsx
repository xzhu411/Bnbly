'use client';

import useAddPropertyModal from "@/hooks/useAddPropertyModal";
import useAuth from "@/hooks/useAuth";
import useLoginModal from "@/hooks/useLoginModal";

const AddPropertyButton = () => {
    const addPropertyModal = useAddPropertyModal();
    const loginModal = useLoginModal();
    const { isAuthenticated } = useAuth();

    const handleClick = () => {
        if (isAuthenticated()) {
            addPropertyModal.open();
        } else {
            loginModal.open();
        }
    };

    return (
        <div
            onClick={handleClick}
            className="p-2 cursor-pointer text-sm font-semibold rounded-full hover:bg-gray-200"
        >
            Bnbly your home
        </div>
    );
};

export default AddPropertyButton;

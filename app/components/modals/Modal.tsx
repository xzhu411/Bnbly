'use client'

import { useEffect, useState } from "react";

interface ModalProps {
    label:string;
    content: React.ReactElement;
    isOpen: boolean;
}

const Modal: React.FC<ModalProps> = ({ 
    label, 
    content, 
    isOpen 
}) => {
    const [showModal, setShowModal] = useState(isOpen)

    useEffect(() => {
        setShowModal(isOpen)
    }, [isOpen])

    const handleClose = () => {
        setShowModal(false)
    }

    if (!showModal) {
        return null;
    }

    return (
        <div className="flex items-center justify-center fixed inset-0 z-50 bg-black/60">
            <div className="relative w-[90%] md:w-[80%] lg:2-[700px] my-6 mx-auto h-auto">
                <div className={`translate duration-600 h-full ${showModal ? 'translate-y-0' : 'translate-y-full'} ${showModal ? 'opacity-100' : 'opacity-0'}`}>
                    <div className="w-full h-auto rounded-xl relative flex flex-col bg-white">
                        
                        <header className="h-[60px] flex items-center p-6 rounded-t justify-center relative border-b border-gray-300">
                            <button
                                type="button"
                                onClick={handleClose}
                                className="absolute left-3 rounded-full p-3 cursor-pointer hover:bg-gray-300"
                            >
                                <svg fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                </svg>
                            </button>

                            <h2 className="text-lg font-bold">{label}</h2>
                        </header>

                        <section className="p-6">
                            {content}
                        </section>

                    </div>
                </div>
            </div>
        </div>
    )
}

export default Modal;

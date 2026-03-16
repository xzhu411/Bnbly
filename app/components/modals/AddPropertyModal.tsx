'use client';

import { useState } from "react";
import Modal from "./Modal";
import CustomButton from "../forms/CustomButton";
import useAddPropertyModal from "@/hooks/useAddPropertyModal";
import useAuth from "@/hooks/useAuth";
import useLoginModal from "@/hooks/useLoginModal";
import { useRouter } from "next/navigation";

const CATEGORIES = ['Beach', 'Villas', 'Cabins', 'Tiny homes', 'City', 'Countryside'];

const AddPropertyModal = () => {
    const modal = useAddPropertyModal();
    const loginModal = useLoginModal();
    const { accessToken } = useAuth();
    const router = useRouter();

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [pricePerNight, setPricePerNight] = useState('');
    const [bedrooms, setBedrooms] = useState('1');
    const [bathrooms, setBathrooms] = useState('1');
    const [guests, setGuests] = useState('1');
    const [country, setCountry] = useState('');
    const [countryCode, setCountryCode] = useState('');
    const [category, setCategory] = useState('Beach');
    const [address, setAddress] = useState('');
    const [city, setCity] = useState('');
    const [state, setState] = useState('');
    const [lat, setLat] = useState<string>("");
    const [lng, setLng] = useState<string>("");
    const [zipCode, setZipCode] = useState('');
    const [image, setImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [extraImages, setExtraImages] = useState<File[]>([]);
    const [extraPreviews, setExtraPreviews] = useState<string[]>([]);
    const [errors, setErrors] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleExtraImages = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []).slice(0, 4);
        setExtraImages(files);
        setExtraPreviews(files.map(f => URL.createObjectURL(f)));
    };

    const validate = () => {
        const errs: string[] = [];
        if (!title.trim()) errs.push("Title is required");
        if (!description.trim()) errs.push("Description is required");
        if (!pricePerNight || Number(pricePerNight) <= 0) errs.push("Please enter a valid price");
        if (!country.trim()) errs.push("Country is required");
        if (!countryCode.trim()) errs.push("Country code is required");
        return errs;
    };

    const handleSubmit = async () => {
        if (!accessToken) { modal.close(); loginModal.open(); return; }
        const errs = validate();
        if (errs.length > 0) { setErrors(errs); return; }

        setErrors([]);
        setIsLoading(true);

        try {
            const formData = new FormData();
            formData.append('title', title);
            formData.append('description', description);
            formData.append('price_per_night', pricePerNight);
            formData.append('bedrooms', bedrooms);
            formData.append('bathrooms', bathrooms);
            formData.append('guests', guests);
            formData.append('country', country);
            formData.append('country_code', countryCode.toUpperCase());
            formData.append('category', category);
            formData.append('address', address);
            formData.append('city', city);
            formData.append('state', state);
            formData.append('zip_code', zipCode);
            if (lat) formData.append('lat', lat);
            if (lng) formData.append('lng', lng);
            if (image) formData.append('image', image);
            extraImages.forEach(img => formData.append('images', img));

            const res = await fetch('http://localhost:8000/api/properties/create/', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${accessToken}` },
                body: formData,
            });

            if (!res.ok) {
                const data = await res.json();
                const msg = Object.values(data).flat().join(', ');
                throw new Error(msg || 'Failed to create listing');
            }

            setTitle(''); setDescription(''); setPricePerNight('');
            setBedrooms('1'); setBathrooms('1'); setGuests('1');
            setCountry(''); setCountryCode(''); setAddress(''); setCity(''); setState(''); setZipCode('');
            setImage(null); setImagePreview(null); setExtraImages([]); setExtraPreviews([]);
            modal.close();
            router.refresh();
        } catch (err: unknown) {
            setErrors([err instanceof Error ? err.message : 'Failed to create listing']);
        } finally {
            setIsLoading(false);
        }
    };

    const inputClass = "w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:ring-2 focus:ring-airbnb";
    const labelClass = "block text-sm font-semibold text-gray-700 mb-1";

    const content = (
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
            {errors.length > 0 && (
                <div className="rounded-xl bg-red-50 border border-red-200 p-3 space-y-1">
                    {errors.map((e, i) => <p key={i} className="text-sm text-red-600">• {e}</p>)}
                </div>
            )}

            {/* Main photo */}
            <div>
                <label className={labelClass}>Main Photo</label>
                <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-airbnb transition overflow-hidden">
                    {imagePreview ? (
                        <img src={imagePreview} alt="preview" className="w-full h-full object-cover" />
                    ) : (
                        <div className="flex flex-col items-center text-gray-400">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                            </svg>
                            <span className="text-sm">Upload main photo</span>
                        </div>
                    )}
                    <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>
            </div>

            {/* Extra photos */}
            <div>
                <label className={labelClass}>Additional Photos (up to 4)</label>
                <label className="flex flex-col items-center justify-center w-full h-20 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-airbnb transition">
                    <span className="text-sm text-gray-400">+ Add more photos</span>
                    <input type="file" accept="image/*" multiple onChange={handleExtraImages} className="hidden" />
                </label>
                {extraPreviews.length > 0 && (
                    <div className="grid grid-cols-4 gap-2 mt-2">
                        {extraPreviews.map((src, i) => (
                            <div key={i} className="aspect-square rounded-lg overflow-hidden">
                                <img src={src} alt={`extra ${i}`} className="w-full h-full object-cover" />
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Title */}
            <div>
                <label className={labelClass}>Title</label>
                <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Property title" className={inputClass} />
            </div>

            {/* Description */}
            <div>
                <label className={labelClass}>Description</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe your property..." rows={3} className={`${inputClass} resize-none`} />
            </div>

            {/* Price */}
            <div>
                <label className={labelClass}>Price per night ($)</label>
                <input type="number" value={pricePerNight} onChange={e => setPricePerNight(e.target.value)} placeholder="200" min="1" className={inputClass} />
            </div>

            {/* Bedrooms / Bathrooms / Guests */}
            <div className="grid grid-cols-3 gap-3">
                <div>
                    <label className={labelClass}>Bedrooms</label>
                    <input type="number" value={bedrooms} onChange={e => setBedrooms(e.target.value)} min="1" className={inputClass} />
                </div>
                <div>
                    <label className={labelClass}>Bathrooms</label>
                    <input type="number" value={bathrooms} onChange={e => setBathrooms(e.target.value)} min="1" className={inputClass} />
                </div>
                <div>
                    <label className={labelClass}>Max guests</label>
                    <input type="number" value={guests} onChange={e => setGuests(e.target.value)} min="1" className={inputClass} />
                </div>
            </div>

            {/* Location */}
            <div className="border border-gray-200 rounded-xl p-4 space-y-3">
                <p className="text-sm font-bold text-gray-700">📍 Location</p>
                <div>
                    <label className={labelClass}>Address</label>
                    <input type="text" value={address} onChange={e => setAddress(e.target.value)} placeholder="123 Ocean Drive" className={inputClass} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className={labelClass}>City</label>
                        <input type="text" value={city} onChange={e => setCity(e.target.value)} placeholder="Miami" className={inputClass} />
                    </div>
                    <div>
                        <label className={labelClass}>State / Province</label>
                        <input type="text" value={state} onChange={e => setState(e.target.value)} placeholder="Florida" className={inputClass} />
                    </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-2">
                        <label className={labelClass}>Country</label>
                        <input type="text" value={country} onChange={e => setCountry(e.target.value)} placeholder="United States" className={inputClass} />
                    </div>
                    <div>
                        <label className={labelClass}>Code</label>
                        <input type="text" value={countryCode} onChange={e => setCountryCode(e.target.value)} placeholder="US" maxLength={3} className={inputClass} />
                    </div>
                </div>
                <div>
                    <label className={labelClass}>Zip Code</label>
                    <input type="text" value={zipCode} onChange={e => setZipCode(e.target.value)} placeholder="33139" className={inputClass} />
                </div>
            </div>

            {/* Category */}
            <div>
                <label className={labelClass}>Category</label>
                <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map(cat => (
                        <button key={cat} type="button" onClick={() => setCategory(cat)}
                            className={`px-4 py-2 rounded-full text-sm border transition ${category === cat ? 'bg-airbnb text-white border-airbnb' : 'border-gray-300 hover:border-gray-400'}`}>
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            <CustomButton label={isLoading ? "Submitting..." : "List your property"} onClick={handleSubmit} className="w-full mt-2" />
        </div>
    );

    return (
        <Modal label="List your property" content={content} isOpen={modal.isOpen} onClose={modal.close} />
    );
};

export default AddPropertyModal;

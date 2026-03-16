'use client';

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import useAuth from "@/hooks/useAuth";
import { authFetch } from "@/lib/axios";

const CATEGORIES = ['Beach', 'Villas', 'Cabins', 'Tiny homes', 'City', 'Countryside'];

interface ExistingImage {
    id: string;
    image: string;
}

const EditPropertyPage = () => {
    const { accessToken, isAuthenticated } = useAuth();
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;

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
    const [zipCode, setZipCode] = useState('');

    // Main image
    const [currentImage, setCurrentImage] = useState<string | null>(null);
    const [newMainImage, setNewMainImage] = useState<File | null>(null);
    const [newMainPreview, setNewMainPreview] = useState<string | null>(null);

    // Extra images
    const [existingImages, setExistingImages] = useState<ExistingImage[]>([]);
    const [newExtraImages, setNewExtraImages] = useState<File[]>([]);
    const [newExtraPreviews, setNewExtraPreviews] = useState<string[]>([]);

    const [errors, setErrors] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);

    useEffect(() => {
        if (!id) return;
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/properties/${id}/`)
            .then(res => res.json())
            .then(data => {
                setTitle(data.title || '');
                setDescription(data.description || '');
                setPricePerNight(String(data.price_per_night || ''));
                setBedrooms(String(data.bedrooms || 1));
                setBathrooms(String(data.bathrooms || 1));
                setGuests(String(data.guests || 1));
                setCountry(data.country || '');
                setCountryCode(data.country_code || '');
                setCategory(data.category || 'Beach');
                setAddress(data.address || '');
                setCity(data.city || '');
                setState(data.state || '');
                setZipCode(data.zip_code || '');
                if (data.image) {
                    setCurrentImage(data.image.startsWith('http') ? data.image : `${process.env.NEXT_PUBLIC_API_URL}${data.image}`);
                }
                if (data.images) {
                    setExistingImages(data.images.map((img: { id: string; image: string }) => ({
                        id: img.id,
                        image: img.image.startsWith('http') ? img.image : `${process.env.NEXT_PUBLIC_API_URL}${img.image}`,
                    })));
                }
                setIsFetching(false);
            });
    }, [id]);

    const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) { setNewMainImage(file); setNewMainPreview(URL.createObjectURL(file)); }
    };

    const handleExtraImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        setNewExtraImages(prev => [...prev, ...files].slice(0, 4));
        setNewExtraPreviews(prev => [...prev, ...files.map(f => URL.createObjectURL(f))].slice(0, 4));
    };

    const removeNewExtra = (index: number) => {
        setNewExtraImages(prev => prev.filter((_, i) => i !== index));
        setNewExtraPreviews(prev => prev.filter((_, i) => i !== index));
    };

    const deleteExistingImage = async (imageId: string) => {
        const res = await authFetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/properties/${id}/images/${imageId}/delete/`,
            { method: 'DELETE', headers: { Authorization: `Bearer ${accessToken}` } }
        );
        if (res.ok) {
            setExistingImages(prev => prev.filter(img => img.id !== imageId));
        }
    };

    const handleSubmit = async () => {
        if (!isAuthenticated()) { router.push('/'); return; }
        setIsLoading(true);
        setErrors([]);

        try {
            // 1. Update main property info + main image
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
            if (newMainImage) formData.append('image', newMainImage);

            const res = await authFetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/properties/${id}/update/`,
                { method: 'PATCH', headers: { Authorization: `Bearer ${accessToken}` }, body: formData }
            );

            if (!res.ok) {
                const data = await res.json();
                throw new Error(Object.values(data).flat().join(', ') || 'Update failed');
            }

            // 2. Upload new extra images if any
            if (newExtraImages.length > 0) {
                const imgFormData = new FormData();
                newExtraImages.forEach(img => imgFormData.append('images', img));
                await authFetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/properties/${id}/images/`,
                    { method: 'POST', headers: { Authorization: `Bearer ${accessToken}` }, body: imgFormData }
                );
            }

            router.push(`/properties/${id}`);
        } catch (err: unknown) {
            setErrors([err instanceof Error ? err.message : 'Failed to update property']);
        } finally {
            setIsLoading(false);
        }
    };

    const inputClass = "w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:ring-2 focus:ring-airbnb";
    const labelClass = "block text-sm font-semibold text-gray-700 mb-1";

    if (isFetching) return (
        <main className="max-w-[800px] mx-auto px-6 py-8">
            <p className="text-gray-400">Loading...</p>
        </main>
    );

    return (
        <main className="max-w-[800px] mx-auto px-6 py-8">
            <div className="flex items-center gap-4 mb-8">
                <button onClick={() => router.back()} className="text-gray-500 hover:text-gray-900">← Back</button>
                <h1 className="text-2xl font-bold">Edit Property</h1>
            </div>

            <div className="space-y-5">
                {errors.length > 0 && (
                    <div className="rounded-xl bg-red-50 border border-red-200 p-3">
                        {errors.map((e, i) => <p key={i} className="text-sm text-red-600">• {e}</p>)}
                    </div>
                )}

                {/* Main photo */}
                <div>
                    <label className={labelClass}>Main Photo</label>
                    <div className="flex items-start gap-4">
                        <div className="w-32 h-32 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                            {newMainPreview ? (
                                <img src={newMainPreview} alt="new" className="w-full h-full object-cover" />
                            ) : currentImage ? (
                                <img src={currentImage} alt="current" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">No photo</div>
                            )}
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-xl text-sm font-semibold hover:bg-gray-50 transition">
                                📷 {currentImage || newMainPreview ? 'Replace main photo' : 'Upload main photo'}
                                <input type="file" accept="image/*" onChange={handleMainImageChange} className="hidden" />
                            </label>
                            {(currentImage || newMainPreview) && (
                                <button type="button"
                                    onClick={() => { setNewMainImage(null); setNewMainPreview(null); setCurrentImage(null); }}
                                    className="inline-flex items-center gap-2 px-4 py-2 border border-red-200 text-red-500 rounded-xl text-sm font-semibold hover:bg-red-50 transition">
                                    🗑 Remove main photo
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Extra photos */}
                <div>
                    <label className={labelClass}>Additional Photos</label>

                    {/* Existing extra images */}
                    {existingImages.length > 0 && (
                        <div className="grid grid-cols-4 gap-2 mb-3">
                            {existingImages.map(img => (
                                <div key={img.id} className="relative group aspect-square rounded-xl overflow-hidden">
                                    <img src={img.image} alt="extra" className="w-full h-full object-cover" />
                                    <button
                                        type="button"
                                        onClick={() => deleteExistingImage(img.id)}
                                        className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition flex items-center justify-center"
                                    >✕</button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* New extra images to upload */}
                    {newExtraPreviews.length > 0 && (
                        <div className="grid grid-cols-4 gap-2 mb-3">
                            {newExtraPreviews.map((src, i) => (
                                <div key={i} className="relative group aspect-square rounded-xl overflow-hidden">
                                    <img src={src} alt={`new ${i}`} className="w-full h-full object-cover" />
                                    <button type="button" onClick={() => removeNewExtra(i)}
                                        className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full text-xs flex items-center justify-center">✕</button>
                                </div>
                            ))}
                        </div>
                    )}

                    <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 border border-dashed border-gray-300 rounded-xl text-sm font-semibold hover:border-airbnb hover:text-airbnb transition">
                        + Add more photos (up to 4)
                        <input type="file" accept="image/*" multiple onChange={handleExtraImagesChange} className="hidden" />
                    </label>
                </div>

                <div>
                    <label className={labelClass}>Title</label>
                    <input type="text" value={title} onChange={e => setTitle(e.target.value)} className={inputClass} />
                </div>

                <div>
                    <label className={labelClass}>Description</label>
                    <textarea value={description} onChange={e => setDescription(e.target.value)} rows={4} className={`${inputClass} resize-none`} />
                </div>

                <div>
                    <label className={labelClass}>Price per night ($)</label>
                    <input type="number" value={pricePerNight} onChange={e => setPricePerNight(e.target.value)} min="1" className={inputClass} />
                </div>

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

                <div className="border border-gray-200 rounded-xl p-4 space-y-3">
                    <p className="text-sm font-bold text-gray-700">📍 Location</p>
                    <div>
                        <label className={labelClass}>Address</label>
                        <input type="text" value={address} onChange={e => setAddress(e.target.value)} className={inputClass} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className={labelClass}>City</label>
                            <input type="text" value={city} onChange={e => setCity(e.target.value)} className={inputClass} />
                        </div>
                        <div>
                            <label className={labelClass}>State / Province</label>
                            <input type="text" value={state} onChange={e => setState(e.target.value)} className={inputClass} />
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                        <div className="col-span-2">
                            <label className={labelClass}>Country</label>
                            <input type="text" value={country} onChange={e => setCountry(e.target.value)} className={inputClass} />
                        </div>
                        <div>
                            <label className={labelClass}>Code</label>
                            <input type="text" value={countryCode} onChange={e => setCountryCode(e.target.value)} maxLength={3} className={inputClass} />
                        </div>
                    </div>
                    <div>
                        <label className={labelClass}>Zip Code</label>
                        <input type="text" value={zipCode} onChange={e => setZipCode(e.target.value)} className={inputClass} />
                    </div>
                </div>

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

                <div className="flex gap-3 pt-4">
                    <button onClick={() => router.back()}
                        className="flex-1 py-3 rounded-xl border border-gray-300 text-sm font-semibold hover:bg-gray-50 transition">
                        Cancel
                    </button>
                    <button onClick={handleSubmit} disabled={isLoading}
                        className="flex-1 py-3 rounded-xl bg-airbnb text-white text-sm font-semibold hover:bg-airbnb-dark transition disabled:opacity-60">
                        {isLoading ? 'Saving...' : 'Save changes'}
                    </button>
                </div>
            </div>
        </main>
    );
};

export default EditPropertyPage;

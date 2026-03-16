import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReservationSideBar from "@/app/components/properties/ReservationSideBar";
import ContactHost from "@/app/components/properties/ContactHost";
import FavouriteButton from "@/app/components/properties/FavouriteButton";
import PropertyMap from "@/app/components/properties/PropertyMap";

interface Landlord {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
}

interface PropertyImage {
    id: string;
    image: string;
    order: number;
}

interface Property {
    id: string;
    title: string;
    description: string;
    price_per_night: number;
    bedrooms: number;
    bathrooms: number;
    guests: number;
    country: string;
    city: string;
    state: string;
    address: string;
    zip_code: string;
    category: string;
    image: string | null;
    images: PropertyImage[];
    landlord: Landlord;
    lat: number | null;
    lng: number | null;
}

async function getProperty(id: string): Promise<Property | null> {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/properties/${id}/`, { cache: "no-store" });
        if (!res.ok) return null;
        return await res.json();
    } catch { return null; }
}

const PropertyDetailPage = async ({ params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    const property = await getProperty(id);
    if (!property) notFound();

    const allImages = [
        property.image,
        ...property.images.map(img => img.image),
    ].filter(Boolean).slice(0, 5) as string[];

    const locationParts = [property.address, property.city, property.state, property.country].filter(Boolean);
    const locationString = locationParts.join(', ');

    return (
        <main className="max-w-[1500px] mx-auto px-6 pb-6">
            <h1 className="my-4 text-3xl font-bold">{property.title}</h1>
            <div className="flex items-center justify-between mb-4">
                <p className="text-gray-600">
                    {property.city && `${property.city}, `}{property.state && `${property.state}, `}{property.country}
                </p>
                <FavouriteButton propertyId={property.id} />
            </div>

            {/* Photo grid */}
            <div className="w-full mb-6 rounded-2xl overflow-hidden">
                {allImages.length === 0 ? (
                    <div className="w-full h-[60vh] bg-gray-200 flex items-center justify-center rounded-2xl">
                        <p className="text-gray-400">No photos available</p>
                    </div>
                ) : allImages.length === 1 ? (
                    <div className="w-full h-[60vh] relative">
                        <Image fill src={allImages[0]} alt={property.title} className="object-cover" sizes="100vw" />
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-2 h-[60vh]">
                        <div className="relative">
                            <Image fill src={allImages[0]} alt={property.title} className="object-cover rounded-l-2xl" sizes="50vw" />
                        </div>
                        <div className={`grid gap-2 ${allImages.length >= 4 ? 'grid-cols-2 grid-rows-2' : 'grid-rows-' + (allImages.length - 1)}`}>
                            {allImages.slice(1, 5).map((src, i) => {
                                const total = allImages.slice(1, 5).length;
                                const isTopRight = i === 0 || (i === 1 && total <= 2);
                                const isBottomRight = i === total - 1;
                                return (
                                    <div key={i} className={`relative overflow-hidden
                                        ${i === 0 && total === 1 ? 'rounded-r-2xl' : ''}
                                        ${i === 0 && total > 1 ? 'rounded-tr-2xl' : ''}
                                        ${isBottomRight && total > 1 ? 'rounded-br-2xl' : ''}
                                    `}>
                                        <Image fill src={src} alt={`photo ${i + 2}`} className="object-cover" sizes="25vw" />
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
                <div className="py-6 pr-6 col-span-3">
                    <span className="mb-6 block text-lg text-gray-600">
                        {property.guests} guests · {property.bedrooms} bedrooms · {property.bathrooms} baths
                    </span>

                    <hr className="border-0 border-t border-gray-300" />

                    <div className="py-4 flex items-center space-x-4">
                        <Link href={`/landlords/${property.landlord.id}`}>
                            <div className="h-16 w-16 overflow-hidden rounded-full bg-airbnb flex items-center justify-center text-white text-2xl font-bold cursor-pointer hover:opacity-80 transition">
                                {property.landlord.avatar ? (
                                    <Image src={property.landlord.avatar} alt={property.landlord.name} width={64} height={64} className="h-full w-full object-cover" />
                                ) : property.landlord.name?.charAt(0).toUpperCase()}
                            </div>
                        </Link>
                        <div>
                            <p><strong>{property.landlord.name}</strong> is your host</p>
                            <p className="text-sm text-gray-500">{property.country}</p>
                        </div>
                    </div>

                    <ContactHost landlordId={property.landlord.id} propertyId={property.id} />

                    <hr className="border-0 border-t border-gray-300 mt-6" />

                    <div className="mt-4 mb-2">
                        <span className="inline-block px-3 py-1 rounded-full bg-airbnb/10 text-airbnb text-sm font-medium">
                            {property.category}
                        </span>
                    </div>

                    <p className="mt-4 text-lg text-gray-700 leading-relaxed whitespace-pre-wrap">{property.description}</p>

                    {/* Location + Map */}
                    {locationString && (
                        <>
                            <hr className="border-0 border-t border-gray-300 mt-6" />
                            <div className="mt-6">
                                <h3 className="text-xl font-semibold mb-1">Where you'll be</h3>
                                <p className="text-gray-600 mb-4">📍 {locationString}{property.zip_code ? ` ${property.zip_code}` : ''}</p>
                                {property.lat && property.lng ? (
                                    <PropertyMap
                                        lat={Number(property.lat)}
                                        lng={Number(property.lng)}
                                        title={property.title}
                                    />
                                ) : (
                                    <div className="w-full h-[300px] bg-gray-100 rounded-2xl flex items-center justify-center">
                                        <p className="text-gray-400 text-sm">Map not available for this property</p>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>

                <div className="col-span-2">
                    <ReservationSideBar
                        propertyId={property.id}
                        pricePerNight={property.price_per_night}
                        landlordId={property.landlord.id}
                    />
                </div>
            </div>
        </main>
    );
};

export default PropertyDetailPage;

import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { API_URL } from "@/lib/config";

interface Landlord {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
}

interface Property {
    id: string;
    title: string;
    image: string | null;
    price_per_night: number;
    country: string;
    category: string;
}

async function getLandlord(id: string): Promise<Landlord | null> {
    try {
        const res = await fetch(`${API_URL}/api/auth/landlord/${id}/`, {
            cache: "no-store",
        });
        if (!res.ok) return null;
        return await res.json();
    } catch {
        return null;
    }
}

async function getLandlordProperties(id: string): Promise<Property[]> {
    try {
        const res = await fetch(`${API_URL}/api/properties/landlord/${id}/`, {
            cache: "no-store",
        });
        if (!res.ok) return [];
        return await res.json();
    } catch {
        return [];
    }
}

const LandlordDetailPage = async ({ params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    const [landlord, properties] = await Promise.all([
        getLandlord(id),
        getLandlordProperties(id),
    ]);

    if (!landlord) notFound();

    return (
        <main className="mt-4 max-w-[1500px] mx-auto px-6 pb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* 左侧：房东信息 */}
                <aside className="col-span-1 mb-4">
                    <div className="flex flex-col items-center p-6 rounded-xl border border-gray-300 shadow-xl">
                        <div className="mb-4 h-[120px] w-[120px] overflow-hidden rounded-full bg-airbnb flex items-center justify-center text-white text-5xl font-bold">
                            {landlord.avatar ? (
                                <Image
                                    src={landlord.avatar.startsWith("http") ? landlord.avatar : `${API_URL}${landlord.avatar}`}
                                    alt={landlord.name}
                                    width={120}
                                    height={120}
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                landlord.name?.charAt(0).toUpperCase()
                            )}
                        </div>

                        <h1 className="text-2xl font-bold">{landlord.name}</h1>
                        <p className="text-sm text-gray-500 mt-1">{landlord.email}</p>

                        <div className="mt-4 text-center text-sm text-gray-500">
                            <p>{properties.length} {properties.length === 1 ? "property" : "properties"}</p>
                        </div>

                        <Link
                            href={`/inbox?landlord=${landlord.id}`}
                            className="mt-4 w-full py-3 px-6 bg-airbnb text-white rounded-xl hover:bg-airbnb-dark transition text-center font-semibold"
                        >
                            Contact
                        </Link>
                    </div>
                </aside>

                {/* 右侧：房源列表 */}
                <div className="col-span-1 md:col-span-3 pl-0 md:pl-6">
                    {properties.length === 0 ? (
                        <div className="text-center py-20 text-gray-400">
                            <p>This person has no properties available.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
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
                    )}
                </div>
            </div>
        </main>
    );
};

export default LandlordDetailPage;

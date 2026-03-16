import Image from "next/image";
import ReservationSideBar from "@/app/components/properties/ReservationSideBar";

const PropertyDetailPage = () => {
    return (
        <main className="max-w-[1500px] mx-auto px-6 pb-6">
            <div className="w-full h-[64vh] mb-4 overflow-hidden rounded-xl relative">
                <Image
                    fill
                    src="/villa2.jpeg"
                    sizes="(max-width: 768px) 768px, (max-width: 1200px) 768px, 768px"
                    alt="Modern villa"
                    className="object-cover w-full h-full"
                />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
                <div className="py-6 pr-6 col-span-3">
                    <h1 className="mb-4 text-4xl">Property Name</h1>
                    <span className="mb-6 block text-lg text-gray-600">
                        4 guests · 2 bedrooms · 3 beds · 2 baths
                    </span>

                    <hr className="border-0 border-t border-gray-300" />

                    <div className="py-4 flex items-center space-x-4">
                        <div className="h-16 w-16 overflow-hidden rounded-full">
                            <Image
                            src="/xz_profile.jpg"
                            alt="Xiaoai Zhu"
                            width={64}
                            height={64}
                            className="h-full w-full object-cover"
                            />
                        </div>

                        <p>
                            <strong>Xiaoai Zhu</strong> is your host
                        </p>
                    </div>

                    <hr className="border-0 border-t border-gray-300" />


                    <p className="mt-6 text-lg">jdbscuhsbcsih</p>


                </div>

                <div className="col-span-2">
                    <ReservationSideBar />
                </div>
            </div>
            {/* Property Detail Page */}
        </main>
    )
}

export default PropertyDetailPage;

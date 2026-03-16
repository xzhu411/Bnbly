import Image from "next/image";
import ContactButton from "@/app/components/ContactButton";
import PropertyList from "@/app/components/properties/PropertyList";

const MyReservationsPage = () => {
    return (
        <main className="max-w-[1500px] mx-auto px-6 pb-6">
            <h1 className="my-6 text-2xl">My reservations</h1>
            
            <div className="space-y-4">
                <div className="p-5 grid grid-cols-1 md:grid-cols-4 gap-4 shadow-md border border-gray-300 rounded-xl">
                    <div className="col-span-1">
                        <div className="relative overflow-hidden aspect-square rounded-xl">
                            <Image
                                fill
                                src="/beach1.jpeg"
                                className="hover:scale-110 object-cover transition h-full w-full"
                                alt="beach house"
                            />
                        </div>
                    </div>

                    <div className="col-span-1 md:col-span-3">
                        <h2 className="text-xl mb-4">Property Name</h2>
                        <p className="mb-2"><strong>Check in date:</strong>14/2/2026</p>
                        <p className="mb-2"><strong>Check out date:</strong> 20/2/2026</p>
                        <p className="mb-2"><strong>Guests:</strong> 2</p>
                        <p className="mb-2"><strong>Total Price:</strong> $1000</p>

                        <div className="mt-6 text-center inline-block cursor-pointer py-4 px-6 bg-airbnb text-white rounded-xl hover:bg-airbnb-dark">
                            Go to property
                        </div>
                        {/* <ContactButton /> */}
                    </div>
                </div>

                <div className="p-5 grid grid-cols-1 md:grid-cols-4 gap-4 shadow-md border border-gray-300 rounded-xl">
                    <div className="col-span-1">
                        <div className="relative overflow-hidden aspect-square rounded-xl">
                            <Image
                                fill
                                src="/beach2.jpeg"
                                className="hover:scale-110 object-cover transition h-full w-full"
                                alt="beach house"
                            />
                        </div>
                    </div>

                    <div className="col-span-1 md:col-span-3 space-y-2">
                        <h2 className="text-xl mb-4">Property Name</h2>
                        <p className="mb-2"><strong>Check in date:</strong>14/4/2026</p>
                        <p className="mb-2"><strong>Check out date:</strong> 20/4/2026</p>
                        <p className="mb-2"><strong>Guests:</strong> 2</p>
                        <p className="mb-2"><strong>Total Price:</strong> $1200</p>
                        <div className="mt-6 text-center inline-block cursor-pointer py-4 px-6 bg-airbnb text-white rounded-xl hover:bg-airbnb-dark">
                            Go to property
                        </div>
                        {/* <ContactButton /> */}
                    </div>

                </div>
            </div>
        </main>
    )
}

export default MyReservationsPage;
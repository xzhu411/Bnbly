const ReservationSideBar = () => {
    return (
        <aside className="mt-6 p-6 col-span-2 rounded-xl border border-gray-300 shadow-xl">
            <h2 className="mb-5 text-2xl">$200 per night</h2>
            <div className="mb-6 p-3 border border-gray-400 rounded-xl">
                <label className="block text-xs font-bold text-gray-700 mb-1">
                    Guests
                </label>
                <select className="w-full -ml-1 text-xm" name="" id="">
                    <option value="1">1 guest</option>
                    <option value="2">2 guests</option>
                    <option value="3">3 guests</option>
                    <option value="4">4 guests</option>
                </select>
            </div>

            <div className="w-full mb-6 py-4 text-center text-white bg-airbnb rounded-xl hover:bg-airbnb-dark">Book</div>

            <div className="mb-4 flex justify-between align-center">
                <p>$200</p>
                <p>per night</p>
            </div>

            <div className="mb-4 flex justify-between align-center">
                <p>Bnbly fee</p>
                <p>$40</p>
            </div>
            <hr className="border-t border-gray-300"/>
            <div className="mt-4 flex justify-between align-center font-bold">
                <p className="text-lg">Total</p>
                <p className="text-lg">$240</p>
            </div>

        </aside>
        // <div className="bg-white rounded-xl shadow-md p-4">
        //     <p className="text-2xl font-bold">Price: $200/night</p>
        //     <p className="text-sm text-gray-500 mt-2">Includes taxes and fees</p>

        //     <button className="w-full mt-4 bg-airbnb text-white py-2 rounded-lg hover:bg-airbnb-dark transition-colors duration-300">
        //         Reserve
        //     </button>
        // </div>
    )
}

export default ReservationSideBar;
'use client';

import { useState } from "react";
import useAuth from "@/hooks/useAuth";
import useLoginModal from "@/hooks/useLoginModal";

interface ReservationSideBarProps {
    propertyId: string;
    pricePerNight: number;
    landlordId: string;
}

const ReservationSideBar = ({ propertyId, pricePerNight, landlordId }: ReservationSideBarProps) => {
    const [guests, setGuests] = useState(1);
    const [checkIn, setCheckIn] = useState('');
    const [checkOut, setCheckOut] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const { accessToken, user } = useAuth();
    const loginModal = useLoginModal();

    const nights = checkIn && checkOut
        ? Math.max(0, Math.round(
            (new Date(checkOut).getTime() - new Date(checkIn).getTime())
            / (1000 * 60 * 60 * 24)
          ))
        : 0;

    const bnblyFee = nights > 0 ? Math.round(pricePerNight * nights * 0.2) : 0;
    const total = nights > 0 ? pricePerNight * nights + bnblyFee : 0;

    const handleBook = async () => {
        if (!accessToken) {
            loginModal.open();
            return;
        }

        if (user?.id === landlordId) {
            setError('不能预订自己的房源');
            return;
        }

        if (!checkIn || !checkOut) {
            setError('请选择入住和退房日期');
            return;
        }

        setIsLoading(true);
        setError('');
        setSuccess('');

        try {
            const res = await fetch(
                `http://localhost:8000/api/reservations/create/${propertyId}/`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${accessToken}`,
                    },
                    body: JSON.stringify({
                        check_in: checkIn,
                        check_out: checkOut,
                        guests,
                        total_price: total,
                    }),
                }
            );

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || '预订失败，请重试');
            }

            setSuccess('🎉 预订成功！');
            setCheckIn('');
            setCheckOut('');
            setGuests(1);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : '预订失败，请重试';
            setError(message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <aside className="mt-6 p-6 col-span-2 rounded-xl border border-gray-300 shadow-xl">
            <h2 className="mb-5 text-2xl font-bold">
                ${pricePerNight} <span className="text-lg font-normal text-gray-500">/ night</span>
            </h2>

            {/* 日期选择 */}
            <div className="mb-4 grid grid-cols-2 gap-2">
                <div className="p-3 border border-gray-400 rounded-xl">
                    <label className="block text-xs font-bold text-gray-700 mb-1">Check in</label>
                    <input
                        type="date"
                        value={checkIn}
                        onChange={e => { setCheckIn(e.target.value); setError(''); setSuccess(''); }}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full text-sm outline-none"
                    />
                </div>
                <div className="p-3 border border-gray-400 rounded-xl">
                    <label className="block text-xs font-bold text-gray-700 mb-1">Check out</label>
                    <input
                        type="date"
                        value={checkOut}
                        onChange={e => { setCheckOut(e.target.value); setError(''); setSuccess(''); }}
                        min={checkIn || new Date().toISOString().split('T')[0]}
                        className="w-full text-sm outline-none"
                    />
                </div>
            </div>

            {/* 客人数 */}
            <div className="mb-6 p-3 border border-gray-400 rounded-xl">
                <label className="block text-xs font-bold text-gray-700 mb-1">Guests</label>
                <select
                    value={guests}
                    onChange={e => setGuests(Number(e.target.value))}
                    className="w-full text-sm outline-none"
                >
                    {[1,2,3,4,5,6,7,8].map(n => (
                        <option key={n} value={n}>{n} guest{n > 1 ? 's' : ''}</option>
                    ))}
                </select>
            </div>

            {/* 预订按钮 */}
            <button
                onClick={handleBook}
                disabled={isLoading}
                className="w-full mb-4 py-4 text-center text-white bg-airbnb rounded-xl hover:bg-airbnb-dark transition disabled:opacity-60 font-semibold"
            >
                {isLoading ? '处理中...' : accessToken ? 'Book' : 'Login to Book'}
            </button>

            {/* 错误提示 */}
            {error && (
                <p className="mb-4 text-center text-sm text-red-500">{error}</p>
            )}

            {/* 成功提示 */}
            {success && (
                <p className="mb-4 text-center text-sm text-green-600 font-semibold">{success}</p>
            )}

            {/* 价格明细 */}
            {nights > 0 && (
                <>
                    <div className="mb-4 flex justify-between text-gray-700">
                        <p>${pricePerNight} × {nights} nights</p>
                        <p>${pricePerNight * nights}</p>
                    </div>
                    <div className="mb-4 flex justify-between text-gray-700">
                        <p>Bnbly fee</p>
                        <p>${bnblyFee}</p>
                    </div>
                    <hr className="border-t border-gray-300"/>
                    <div className="mt-4 flex justify-between font-bold">
                        <p className="text-lg">Total</p>
                        <p className="text-lg">${total}</p>
                    </div>
                </>
            )}
        </aside>
    );
};

export default ReservationSideBar;

'use client';

import { useState, useEffect } from "react";
import useAuth from "@/hooks/useAuth";
import useLoginModal from "@/hooks/useLoginModal";
import { API_URL } from "@/lib/config";

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
    const [bookedDates, setBookedDates] = useState<Set<string>>(new Set());
    const [showCalendar, setShowCalendar] = useState(false);
    const [selectingCheckIn, setSelectingCheckIn] = useState(true);
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const { accessToken, user } = useAuth();
    const loginModal = useLoginModal();

    const parseDateKey = (dateStr: string) => {
        const [year, month, day] = dateStr.split('-').map(Number);
        return new Date(year, month - 1, day);
    };

    const formatDateKey = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const addDays = (date: Date, days: number) => {
        const next = new Date(date);
        next.setDate(next.getDate() + days);
        return next;
    };

    // Load booked dates
    useEffect(() => {
        fetch(`${API_URL}/api/reservations/booked-dates/${propertyId}/`)
            .then(res => res.json())
            .then(data => {
                const dates = new Set<string>();
                if (Array.isArray(data)) {
                    data.forEach((range: { check_in: string; check_out: string }) => {
                        const start = parseDateKey(range.check_in);
                        const end = parseDateKey(range.check_out);

                        // Reservation end date is checkout day, so mark dates before it as unavailable.
                        for (let d = new Date(start); d < end; d = addDays(d, 1)) {
                            dates.add(formatDateKey(d));
                        }
                    });
                }
                setBookedDates(dates);
            })
            .catch(() => {});
    }, [propertyId]);

    const nights = checkIn && checkOut
        ? Math.max(0, Math.round(
            (parseDateKey(checkOut).getTime() - parseDateKey(checkIn).getTime())
            / (1000 * 60 * 60 * 24)
          ))
        : 0;

    const bnblyFee = nights > 0 ? Math.round(pricePerNight * nights * 0.2) : 0;
    const total = nights > 0 ? pricePerNight * nights + bnblyFee : 0;

    const isBooked = (dateStr: string) => bookedDates.has(dateStr);
    const isPast = (dateStr: string) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return parseDateKey(dateStr) < today;
    };
    const isDisabled = (dateStr: string) => isBooked(dateStr) || isPast(dateStr);

    const isInRange = (dateStr: string) => {
        if (!checkIn || !checkOut) return false;
        return dateStr > checkIn && dateStr < checkOut;
    };

    const handleDateClick = (dateStr: string) => {
        if (isDisabled(dateStr)) return;

        if (selectingCheckIn) {
            setCheckIn(dateStr);
            setCheckOut('');
            setSelectingCheckIn(false);
            setError('');
        } else {
            if (dateStr <= checkIn) {
                setCheckIn(dateStr);
                setCheckOut('');
                return;
            }
            // Check no booked dates in range
            const start = parseDateKey(checkIn);
            const end = parseDateKey(dateStr);
            let hasConflict = false;
            for (let d = addDays(start, 1); d < end; d = addDays(d, 1)) {
                if (bookedDates.has(formatDateKey(d))) {
                    hasConflict = true;
                    break;
                }
            }
            if (hasConflict) {
                setError('Selected range includes unavailable dates');
                return;
            }
            setCheckOut(dateStr);
            setSelectingCheckIn(true);
            setShowCalendar(false);
            setError('');
        }
    };

    const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

    const renderCalendar = (monthOffset: number) => {
        const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + monthOffset, 1);
        const year = date.getFullYear();
        const month = date.getMonth();
        const daysInMonth = getDaysInMonth(year, month);
        const firstDay = getFirstDayOfMonth(year, month);
        const monthName = date.toLocaleString('default', { month: 'long', year: 'numeric' });

        const days = [];
        for (let i = 0; i < firstDay; i++) days.push(null);
        for (let i = 1; i <= daysInMonth; i++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
            days.push(dateStr);
        }

        return (
            <div className="flex-1">
                <p className="text-center font-semibold mb-3">{monthName}</p>
                <div className="grid grid-cols-7 gap-1 text-center">
                    {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => (
                        <div key={d} className="text-xs text-gray-400 font-medium pb-1">{d}</div>
                    ))}
                    {days.map((dateStr, i) => {
                        if (!dateStr) return <div key={`empty-${i}`} />;
                        const disabled = isDisabled(dateStr);
                        const isCheckIn = dateStr === checkIn;
                        const isCheckOut = dateStr === checkOut;
                        const inRange = isInRange(dateStr);
                        const booked = isBooked(dateStr);

                        return (
                            <button
                                key={dateStr}
                                onClick={() => handleDateClick(dateStr)}
                                disabled={disabled}
                                className={`
                                    relative text-sm py-1.5 rounded-full transition
                                    ${disabled ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-gray-100 cursor-pointer'}
                                    ${booked ? 'line-through text-gray-300' : ''}
                                    ${isCheckIn || isCheckOut ? 'bg-gray-900 text-white hover:bg-gray-800' : ''}
                                    ${inRange ? 'bg-gray-100' : ''}
                                `}
                            >
                                {parseInt(dateStr.split('-')[2])}
                                {booked && !isPast(dateStr) && (
                                    <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-red-300 rounded-full" />
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>
        );
    };

    const handleBook = async () => {
        if (!accessToken) { loginModal.open(); return; }
        if (user?.id === landlordId) { setError('Cannot book your own property'); return; }
        if (!checkIn || !checkOut) { setError('Please select check-in and check-out dates'); return; }
        if (nights <= 0) { setError('Check-out must be after check-in'); return; }

        setIsLoading(true);
        setError('');
        setSuccess('');

        try {
            const res = await fetch(`${API_URL}/api/reservations/create/${propertyId}/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                },
                body: JSON.stringify({ check_in: checkIn, check_out: checkOut, guests, total_price: total }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || data.detail || 'Failed to book');
            setSuccess('🎉 Booking successful!');
            setCheckIn(''); setCheckOut(''); setGuests(1);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to book');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <aside className="mt-6 p-6 col-span-2 rounded-xl border border-gray-300 shadow-xl">
            <h2 className="mb-5 text-2xl font-bold">
                ${pricePerNight} <span className="text-lg font-normal text-gray-500">/ night</span>
            </h2>

            {/* Date picker trigger */}
            <div
                className="mb-4 grid grid-cols-2 border border-gray-400 rounded-xl overflow-hidden cursor-pointer"
                onClick={() => setShowCalendar(!showCalendar)}
            >
                <div className="p-3 border-r border-gray-300">
                    <label className="block text-xs font-bold text-gray-700 mb-1">CHECK-IN</label>
                    <p className={`text-sm ${checkIn ? 'text-gray-900' : 'text-gray-400'}`}>
                        {checkIn || 'Add date'}
                    </p>
                </div>
                <div className="p-3">
                    <label className="block text-xs font-bold text-gray-700 mb-1">CHECKOUT</label>
                    <p className={`text-sm ${checkOut ? 'text-gray-900' : 'text-gray-400'}`}>
                        {checkOut || 'Add date'}
                    </p>
                </div>
            </div>

            {/* Calendar */}
            {showCalendar && (
                <div className="mb-4 p-4 border border-gray-200 rounded-2xl shadow-lg bg-white">
                    <p className="text-center text-sm font-medium text-gray-500 mb-3">
                        {selectingCheckIn ? 'Select check-in date' : 'Select check-out date'}
                    </p>

                    <div className="flex items-center justify-between mb-3">
                        <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                            className="p-1 hover:bg-gray-100 rounded-full">‹</button>
                        <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                            className="p-1 hover:bg-gray-100 rounded-full">›</button>
                    </div>

                    <div className="flex gap-6">
                        {renderCalendar(0)}
                        {renderCalendar(1)}
                    </div>

                    {/* Legend */}
                    <div className="mt-3 flex items-center gap-4 text-xs text-gray-400">
                        <div className="flex items-center gap-1">
                            <span className="w-2 h-2 bg-red-300 rounded-full inline-block" />
                            <span>Booked</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <span className="w-4 h-4 bg-gray-900 rounded-full inline-block" />
                            <span>Selected</span>
                        </div>
                    </div>

                    <div className="mt-3 flex justify-between">
                        <button onClick={() => { setCheckIn(''); setCheckOut(''); setSelectingCheckIn(true); }}
                            className="text-sm underline text-gray-500">Clear dates</button>
                        <button onClick={() => setShowCalendar(false)}
                            className="px-4 py-1.5 bg-gray-900 text-white rounded-xl text-sm font-semibold">Close</button>
                    </div>
                </div>
            )}

            {/* Guests */}
            <div className="mb-6 p-3 border border-gray-400 rounded-xl">
                <label className="block text-xs font-bold text-gray-700 mb-1">GUESTS</label>
                <select value={guests} onChange={e => setGuests(Number(e.target.value))} className="w-full text-sm outline-none">
                    {[1,2,3,4,5,6,7,8].map(n => (
                        <option key={n} value={n}>{n} guest{n > 1 ? 's' : ''}</option>
                    ))}
                </select>
            </div>

            <button onClick={handleBook} disabled={isLoading}
                className="w-full mb-4 py-4 text-center text-white bg-airbnb rounded-xl hover:bg-airbnb-dark transition disabled:opacity-60 font-semibold">
                {isLoading ? 'Processing...' : accessToken ? 'Book' : 'Login to Book'}
            </button>

            {error && <p className="mb-4 text-center text-sm text-red-500">{error}</p>}
            {success && <p className="mb-4 text-center text-sm text-green-600 font-semibold">{success}</p>}

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

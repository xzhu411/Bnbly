'use client';

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

type ActivePanel = 'where' | 'when' | 'who' | null;

interface DateRange {
    from: Date | null;
    to: Date | null;
}

interface PlaceSuggestion {
    display_name: string;
    place_id: string;
}

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

const isSameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

const isInRange = (date: Date, from: Date | null, to: Date | null) => {
    if (!from || !to) return false;
    return date > from && date < to;
};

const MiniCalendar = ({ year, month, dateRange, onSelectDate, today }: {
    year: number; month: number; dateRange: DateRange;
    onSelectDate: (d: Date) => void; today: Date;
}) => {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells: (number | null)[] = [...Array(firstDay).fill(null), ...Array.from({length: daysInMonth}, (_, i) => i + 1)];
    while (cells.length % 7 !== 0) cells.push(null);

    return (
        <div className="w-[280px]">
            <div className="grid grid-cols-7 mb-1">
                {DAYS.map(d => (
                    <div key={d} className="text-center text-xs font-medium text-gray-400 py-1">{d}</div>
                ))}
            </div>
            <div className="grid grid-cols-7">
                {cells.map((day, i) => {
                    if (!day) return <div key={i} />;
                    const date = new Date(year, month, day);
                    const isPast = date < today && !isSameDay(date, today);
                    const isStart = dateRange.from && isSameDay(date, dateRange.from);
                    const isEnd = dateRange.to && isSameDay(date, dateRange.to);
                    const inRange = isInRange(date, dateRange.from, dateRange.to);
                    const isToday = isSameDay(date, today);
                    return (
                        <div key={i} className={`relative flex items-center justify-center h-10 ${inRange ? 'bg-red-50' : ''} ${isStart && dateRange.to ? 'rounded-l-full' : ''} ${isEnd && dateRange.from ? 'rounded-r-full' : ''}`}>
                            <button
                                onClick={() => !isPast && onSelectDate(date)}
                                disabled={isPast}
                                className={`w-9 h-9 rounded-full text-sm transition flex items-center justify-center
                                    ${isPast ? 'text-gray-200 cursor-not-allowed' : 'hover:bg-gray-100 cursor-pointer'}
                                    ${isStart || isEnd ? 'bg-airbnb text-white hover:bg-airbnb-dark' : ''}
                                    ${isToday && !isStart && !isEnd ? 'font-bold' : ''}
                                    ${inRange ? 'text-airbnb' : ''}`}
                            >{day}</button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const SearchFilters = () => {
    const router = useRouter();
    const [activePanel, setActivePanel] = useState<ActivePanel>(null);
    const [where, setWhere] = useState('');
    const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [dateRange, setDateRange] = useState<DateRange>({ from: null, to: null });
    const [guests, setGuests] = useState(0);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const [calendarBase, setCalendarBase] = useState({ year: today.getFullYear(), month: today.getMonth() });

    const month2 = calendarBase.month === 11
        ? { year: calendarBase.year + 1, month: 0 }
        : { year: calendarBase.year, month: calendarBase.month + 1 };

    // Nominatim 自动补全
    useEffect(() => {
        if (!where || where.length < 2) {
            setSuggestions([]);
            return;
        }
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(async () => {
            setIsSearching(true);
            try {
                const res = await fetch(
                    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(where)}&format=json&limit=5&addressdetails=1`,
                    { headers: { 'Accept-Language': 'en' } }
                );
                const data = await res.json();
                setSuggestions(data.map((item: { display_name: string; place_id: string }) => ({
                    display_name: item.display_name,
                    place_id: item.place_id,
                })));
            } catch {
                setSuggestions([]);
            } finally {
                setIsSearching(false);
            }
        }, 400);
    }, [where]);

    const handleSelectPlace = (name: string) => {
        // 只取前两个部分，比如 "Paris, France"
        const short = name.split(',').slice(0, 2).join(',').trim();
        setWhere(short);
        setSuggestions([]);
        togglePanel('when');
    };

    const handleSelectDate = (date: Date) => {
        if (!dateRange.from || (dateRange.from && dateRange.to)) {
            setDateRange({ from: date, to: null });
        } else {
            if (date < dateRange.from) {
                setDateRange({ from: date, to: dateRange.from });
            } else {
                setDateRange({ from: dateRange.from, to: date });
            }
        }
    };

    const formatDateRange = () => {
        if (!dateRange.from) return 'Add dates';
        const from = dateRange.from.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        if (!dateRange.to) return from;
        const to = dateRange.to.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        return `${from} – ${to}`;
    };

    const togglePanel = (panel: ActivePanel) => {
        setActivePanel(prev => prev === panel ? null : panel);
    };

    const handleSearch = () => {
        const params = new URLSearchParams();
        if (where) params.set('search', where);
        if (guests > 0) params.set('guests', String(guests));
        if (dateRange.from) params.set('check_in', dateRange.from.toISOString().split('T')[0]);
        if (dateRange.to) params.set('check_out', dateRange.to.toISOString().split('T')[0]);
        router.push(`/?${params.toString()}`);
        setActivePanel(null);
    };

    const handleClear = () => {
        setWhere('');
        setDateRange({ from: null, to: null });
        setGuests(0);
        setSuggestions([]);
        router.push('/');
        setActivePanel(null);
    };

    return (
        <div className="relative">
            {/* 主搜索栏 */}
            <div className="flex h-[56px] items-center rounded-full border border-gray-300 shadow-sm bg-white divide-x divide-gray-200">
                <button
                    onClick={() => togglePanel('where')}
                    className={`h-full px-6 flex flex-col justify-center rounded-l-full text-left hover:bg-gray-100 transition min-w-[200px] ${activePanel === 'where' ? 'bg-gray-100' : ''}`}
                >
                    <span className="text-xs font-bold text-gray-900">Where</span>
                    <span className={`text-sm truncate ${where ? 'text-gray-900' : 'text-gray-400'}`}>
                        {where || 'Search destinations'}
                    </span>
                </button>

                <button
                    onClick={() => togglePanel('when')}
                    className={`h-full px-6 flex flex-col justify-center text-left hover:bg-gray-100 transition min-w-[180px] ${activePanel === 'when' ? 'bg-gray-100' : ''}`}
                >
                    <span className="text-xs font-bold text-gray-900">When</span>
                    <span className={`text-sm ${dateRange.from ? 'text-gray-900' : 'text-gray-400'}`}>
                        {formatDateRange()}
                    </span>
                </button>

                <button
                    onClick={() => togglePanel('who')}
                    className={`h-full px-6 flex flex-col justify-center text-left hover:bg-gray-100 transition min-w-[140px] ${activePanel === 'who' ? 'bg-gray-100' : ''}`}
                >
                    <span className="text-xs font-bold text-gray-900">Who</span>
                    <span className={`text-sm ${guests > 0 ? 'text-gray-900' : 'text-gray-400'}`}>
                        {guests > 0 ? `${guests} guest${guests > 1 ? 's' : ''}` : 'Add guests'}
                    </span>
                </button>

                <div className="px-3">
                    <button
                        onClick={handleSearch}
                        className="flex items-center gap-2 bg-airbnb hover:bg-airbnb-dark text-white px-5 py-3 rounded-full transition font-semibold text-sm"
                    >
                        <svg viewBox="0 0 32 32" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={4}>
                            <path d="m20.666 20.666 10 10"></path>
                            <path d="m24 12.667c0 6.259-5.074 11.333-11.333 11.333C6.408 24 1.333 18.926 1.333 12.667 1.333 6.408 6.408 1.333 12.667 1.333 18.926 1.333 24 6.408 24 12.667z"></path>
                        </svg>
                        Search
                    </button>
                </div>
            </div>

            {activePanel && (
                <div className="fixed inset-0 z-10" onClick={() => setActivePanel(null)} />
            )}

            {/* Where 面板 */}
            {activePanel === 'where' && (
                <div className="absolute top-[68px] left-0 w-[400px] bg-white rounded-3xl shadow-2xl border border-gray-100 p-6 z-20">
                    <p className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-3">Search destinations</p>
                    <input
                        autoFocus
                        type="text"
                        value={where}
                        onChange={e => setWhere(e.target.value)}
                        placeholder="Search destinations"
                        className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-airbnb"
                    />

                    {/* 自动补全结果 */}
                    {isSearching && (
                        <div className="mt-3 text-sm text-gray-400 px-2">Searching...</div>
                    )}

                    {suggestions.length > 0 && (
                        <div className="mt-2 space-y-1">
                            {suggestions.map((s) => (
                                <button
                                    key={s.place_id}
                                    onClick={() => handleSelectPlace(s.display_name)}
                                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition text-left"
                                >
                                    <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-lg shrink-0">📍</div>
                                    <span className="text-sm text-gray-700 line-clamp-1">{s.display_name}</span>
                                </button>
                            ))}
                        </div>
                    )}

                    {/* 没有输入时显示热门目的地 */}
                    {!where && suggestions.length === 0 && (
                        <div className="mt-4 space-y-1">
                            <p className="text-xs text-gray-400 mb-2 px-1">Popular destinations</p>
                            {['United States', 'Japan', 'France', 'Australia', 'Italy'].map(place => (
                                <button
                                    key={place}
                                    onClick={() => handleSelectPlace(place)}
                                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition text-left"
                                >
                                    <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-lg shrink-0">🌍</div>
                                    <span className="text-sm font-medium">{place}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* When 面板 */}
            {activePanel === 'when' && (
                <div className="absolute top-[68px] left-1/2 -translate-x-1/2 bg-white rounded-3xl shadow-2xl border border-gray-100 p-6 z-20">
                    <p className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-4 text-center">When's your trip?</p>
                    <div className="flex items-center justify-between mb-4">
                        <button onClick={() => setCalendarBase(prev => prev.month === 0 ? { year: prev.year - 1, month: 11 } : { year: prev.year, month: prev.month - 1 })}
                            className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-xl transition">‹</button>
                        <div className="flex gap-8">
                            <span className="text-sm font-semibold w-[280px] text-center">{MONTHS[calendarBase.month]} {calendarBase.year}</span>
                            <span className="text-sm font-semibold w-[280px] text-center">{MONTHS[month2.month]} {month2.year}</span>
                        </div>
                        <button onClick={() => setCalendarBase(prev => prev.month === 11 ? { year: prev.year + 1, month: 0 } : { year: prev.year, month: prev.month + 1 })}
                            className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-xl transition">›</button>
                    </div>
                    <div className="flex gap-8">
                        <MiniCalendar year={calendarBase.year} month={calendarBase.month} dateRange={dateRange} onSelectDate={handleSelectDate} today={today} />
                        <div className="w-px bg-gray-100" />
                        <MiniCalendar year={month2.year} month={month2.month} dateRange={dateRange} onSelectDate={handleSelectDate} today={today} />
                    </div>
                    <div className="flex justify-between mt-4 pt-4 border-t border-gray-100">
                        <button onClick={() => setDateRange({ from: null, to: null })} className="text-sm font-semibold underline text-gray-600 hover:text-gray-900">Clear dates</button>
                        <button onClick={() => togglePanel('who')} className="bg-airbnb text-white px-6 py-2 rounded-full text-sm font-semibold hover:bg-airbnb-dark transition">Next →</button>
                    </div>
                </div>
            )}

            {/* Who 面板 */}
            {activePanel === 'who' && (
                <div className="absolute top-[68px] right-0 w-[360px] bg-white rounded-3xl shadow-2xl border border-gray-100 p-6 z-20">
                    <p className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-4">Who's coming?</p>
                    <div className="flex items-center justify-between py-4 border-b border-gray-100">
                        <div>
                            <p className="font-semibold text-sm">Guests</p>
                            <p className="text-xs text-gray-400 mt-0.5">Ages 2 or above</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <button onClick={() => setGuests(Math.max(0, guests - 1))} disabled={guests === 0}
                                className="w-9 h-9 rounded-full border border-gray-300 flex items-center justify-center text-xl font-light hover:border-gray-600 transition disabled:opacity-30 disabled:cursor-not-allowed">−</button>
                            <span className="w-5 text-center font-semibold text-sm">{guests}</span>
                            <button onClick={() => setGuests(guests + 1)}
                                className="w-9 h-9 rounded-full border border-gray-300 flex items-center justify-center text-xl font-light hover:border-gray-600 transition">+</button>
                        </div>
                    </div>
                    <div className="flex justify-between items-center mt-5">
                        <button onClick={handleClear} className="text-sm font-semibold underline text-gray-600 hover:text-gray-900">Clear all</button>
                        <button onClick={handleSearch} className="flex items-center gap-2 bg-airbnb text-white px-6 py-3 rounded-full text-sm font-semibold hover:bg-airbnb-dark transition">
                            <svg viewBox="0 0 32 32" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={4}>
                                <path d="m20.666 20.666 10 10"></path>
                                <path d="m24 12.667c0 6.259-5.074 11.333-11.333 11.333C6.408 24 1.333 18.926 1.333 12.667 1.333 6.408 6.408 1.333 12.667 1.333 18.926 1.333 24 6.408 24 12.667z"></path>
                            </svg>
                            Search
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SearchFilters;

'use client';

import { useEffect, useState } from "react";

interface PropertyMapProps {
    lat: number;
    lng: number;
    title: string;
}

const PropertyMap = ({ lat, lng, title }: PropertyMapProps) => {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) return (
        <div className="w-full h-[400px] bg-gray-100 rounded-2xl flex items-center justify-center">
            <p className="text-gray-400">Loading map...</p>
        </div>
    );

    // 动态 import Leaflet 避免 SSR 问题
    const Map = require('./LeafletMap').default;
    return <Map lat={lat} lng={lng} title={title} />;
};

export default PropertyMap;

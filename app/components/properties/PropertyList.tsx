import PropertyListItem from "./PropertyListItem";

interface Property {
  id: string;
  title: string;
  price_per_night: number;
  image: string | null;
  country: string;
  category: string;
}

interface PropertyListProps {
  searchParams?: {
    search?: string;
    category?: string;
    min_price?: string;
    max_price?: string;
    guests?: string;
    check_in?: string;
    check_out?: string;
  };
}

const PropertyList = async ({ searchParams }: PropertyListProps) => {
  let properties: Property[] = [];

  try {
    const params = new URLSearchParams();
    if (searchParams?.search) params.set('search', searchParams.search);
    if (searchParams?.category) params.set('category', searchParams.category);
    if (searchParams?.min_price) params.set('min_price', searchParams.min_price);
    if (searchParams?.max_price) params.set('max_price', searchParams.max_price);
    if (searchParams?.guests) params.set('guests', searchParams.guests);
    if (searchParams?.check_in) params.set('check_in', searchParams.check_in);
    if (searchParams?.check_out) params.set('check_out', searchParams.check_out);

    const query = params.toString();
    const url = `${process.env.NEXT_PUBLIC_API_URL}/api/properties/${query ? `?${query}` : ''}`;

    const res = await fetch(url, { cache: "no-store" });
    if (res.ok) properties = await res.json();
  } catch (err) {
    console.error("获取房源失败:", err);
  }

  if (properties.length === 0) {
    return (
      <div className="col-span-full text-center py-20 text-gray-400">
        <p className="text-lg">No properties found</p>
        <p className="text-sm mt-2">Try adjusting your search filters</p>
      </div>
    );
  }

  return (
    <>
      {properties.map((property) => (
        <PropertyListItem
          key={property.id}
          id={property.id}
          imageSrc={property.image ?? "/beach1.jpeg"}
          imageAlt={property.title}
          name={property.title}
          pricePerNight={property.price_per_night}
        />
      ))}
    </>
  );
};

export default PropertyList;

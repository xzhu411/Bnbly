import Image from "next/image";

interface PropertyListItemProps {
  imageSrc: string;
  imageAlt: string;
  name: string;
  pricePerNight: number;
}

const PropertyListItem = ({
  imageSrc,
  imageAlt,
  name,
  pricePerNight,
}: PropertyListItemProps) => {
  return (
    <div className="cursor-pointer">
        <div className="relative overflow-hidden aspect-square rounded-xl">
            <Image
                fill
                src={imageSrc}
                sizes="(max-width: 768px) 768px, (max-width: 1200px) 768px, 768px"
                alt={imageAlt}
                className="object-cover w-full h-full transition-transform ease-in-out hover:scale-110"
            />
        </div>

        <div className="mt-2">
            <p className="text-lg font-bold">{name}</p>
        </div>

        <div className="mt-2">
            <p className="text-sm text-gray-500">
              <strong>${pricePerNight}</strong> / night
            </p>
        </div>
    </div>
  )
};

export default PropertyListItem;

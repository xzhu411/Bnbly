import PropertyListItem from "./PropertyListItem";

const properties = [
  {
    imageSrc: "/beach1.jpeg",
    imageAlt: "Beach house interior",
    name: "Oceanview Retreat",
    pricePerNight: 200,
  },
  {
    imageSrc: "/villa1.jpeg",
    imageAlt: "Modern villa",
    name: "Sunset Villa",
    pricePerNight: 630,
  },
  {
    imageSrc: "/cabin1.jpeg",
    imageAlt: "Cozy cabin",
    name: "Forest Cabin",
    pricePerNight: 180,
  },
  {
    imageSrc: "/tiny1.jpeg",
    imageAlt: "Tiny home stay",
    name: "Tiny Home Escape",
    pricePerNight: 145,
  },
  {
    imageSrc: "/beach2.jpeg",
    imageAlt: "Beachfront stay",
    name: "Coastal Breeze",
    pricePerNight: 500,
  },
  {
    imageSrc: "/villa2.jpeg",
    imageAlt: "Modern villa",
    name: "Sunset Villa",
    pricePerNight: 800,
  },
  {
    imageSrc: "/cabin2.jpeg",
    imageAlt: "Cozy cabin",
    name: "Forest Cabin",
    pricePerNight: 180,
  },
  {
    imageSrc: "/tiny2.jpeg",
    imageAlt: "Tiny home stay",
    name: "Tiny Home Escape",
    pricePerNight: 180,
  },
];

const PropertyList = () => {
  return (
        <>
            {properties.map((property) => (
              <PropertyListItem
                key={property.imageSrc}
                imageSrc={property.imageSrc}
                imageAlt={property.imageAlt}
                name={property.name}
                pricePerNight={property.pricePerNight}
              />
            ))}
        </>
       
    
  );
};

export default PropertyList;

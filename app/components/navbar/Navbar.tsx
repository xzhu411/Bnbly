import Link from "next/link";
import Image from "next/image";
import SearchFilters from "./SearchFilters";
import UserNav from "./UserNav";
import AddPropertyButton from "./AddProperty";

const Navbar = () => {
  return (
    <nav className="w-full fixed top-0 left-0 py-4 border-b bg-white z-10 border-gray-300">
      <div className="max-w-[1500px] mx-auto px-6">
        <div className="flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold text-airbnb">
                <Image
                    src="/bnbly_logo.png"
                    alt="Bnbly Logo"
                    width={220}
                    height={120}
                />
            </Link>

            <div className="flex space-x-6">
                <SearchFilters />
            </div>

            <div className="flex items-center space-x-6">
                <AddPropertyButton />
                <UserNav/>
            </div>

            {/* <div className="rounded-full bg-airbnb px-4 py-2 text-white hover:bg-airbnb-dark">
                <AddPropertyButton />
            </div> */}


        </div>
      </div>
    </nav>
  );
};

export default Navbar;
'use client';

interface MenuLinkProps {
    label: string;
    href: string;
    onClick?: () => void;
}

const MenuLink: React.FC<MenuLinkProps> =({ label, href, onClick }) => {
    return (
        <a 
            href={href} 
            onClick={onClick} 
            className="px-4 py-2 cursor-pointer text-sm text-gray-700 hover:bg-gray-100 rounded-md"
            >
            {label}
        </a>
    )
}

export default MenuLink;
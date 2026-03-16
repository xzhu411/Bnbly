interface CustomButtonProps {
  label: string;
  onClick?: () => void;
  className?: string;
  type?: "button" | "submit" | "reset";
}

const CustomButton: React.FC<CustomButtonProps> = ({
  label,
  onClick,
  className,
  type = "button",
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`flex items-center justify-center cursor-pointer rounded-xl bg-airbnb py-4 text-center text-white transition hover:bg-airbnb-dark ${className ?? ""}`}
    >
      {label}
    </button>
  );
};

export default CustomButton;

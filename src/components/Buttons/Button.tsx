import { MouseEventHandler } from "react";
const Button = ({
  onClick,
  text,
  type,
  loading,
}: {
  onClick: MouseEventHandler<HTMLButtonElement>;
  text: string;
  type: "primary" | "secondary";
  loading: boolean;
}) => {
  const primaryStyles =
    "bg-main-blue text-white hover:text-main-blue hover:border-2 hover:border-main-blue hover:bg-white";
  const secondaryStyles =
    "bg-white text-main-blue border-2 border-main-blue hover:bg-main-blue hover:text-white hover:border-none";
  return (
    <button
      disabled={loading}
      onClick={onClick}
      className={`${
        type === "primary" ? primaryStyles : secondaryStyles
      } rounded-[4px] px-10 w-64 h-12 mt-5 transition-colors duration-300 ${
        loading && "!bg-gray-300 !text-black !border-none"
      }`}
    >
      {loading ? "Loading.." : text}
    </button>
  );
};

export default Button;

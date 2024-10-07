import React, { MouseEventHandler } from "react";

const ToggleMediaButton = ({
  children,
  status,
  onClick,
  title,
}: {
  children: React.ReactNode;
  status: "on" | "off" | "error";
  onClick: MouseEventHandler<HTMLDivElement>;
  title?: string;
}) => {
  return (
    <div
      title={title}
      onClick={onClick}
      className={`w-12 h-12 m-3 rounded-full flex justify-center items-center text-xl font-bold text-white 
        cursor-pointer hover:scale-110 active:scale-105 transition-all duration-200 ${
          status === "on"
            ? "bg-main-blue"
            : status === "off"
            ? "bg-main-red"
            : "bg-main-yellow"
        }`}
    >
      {children}
    </div>
  );
};

export default ToggleMediaButton;

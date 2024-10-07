import React, { MouseEventHandler } from "react";

const ToggleButton = ({
  toggle,
  icon,
  onClick,
  bottom,
  className,
}: {
  toggle: boolean;
  icon: React.ReactNode;
  onClick: MouseEventHandler<HTMLDivElement>;
  bottom: number;
  className?: string;
}) => {
  return (
    <div
      style={{ bottom: bottom }}
      className={`${
        toggle ? "bg-main-red" : "bg-main-blue"
      }  w-12 h-12 absolute right-6 bottom-[166px] z-20 rounded-full
       cursor-pointer hover:scale-110 active:scale-100 transition-all duration-300 flex justify-center items-center text-2xl text-white ${className}`}
      onClick={onClick}
    >
      {icon}
    </div>
  );
};

export default ToggleButton;

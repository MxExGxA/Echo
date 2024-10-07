import React from "react";
import coverImage from "@/assets/images/interview.png";

const EchoCover = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="relative h-screen w-full overflow-hidden flex">
      <div className="left h-full w-1/2 border-l-8 border-main-blue max-lg:hidden">
        <img
          src={coverImage}
          alt="interview image"
          className="h-full w-full object-cover object-top"
        />
      </div>
      <div className="right h-full w-2/3 max-lg:w-full flex flex-col justify-center items-center">
        {children}
      </div>
    </div>
  );
};

export default EchoCover;

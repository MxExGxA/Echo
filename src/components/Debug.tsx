import { stateType } from "@/redux/store";
import { useSelector } from "react-redux";

export const Debug = () => {
  const debugList = useSelector((state: stateType) => state.debug.debugList);
  return (
    <div className="absolute h-screen w-full top-0 left-0 z-50 pointer-events-none">
      {debugList!.map((d, index) => (
        <p key={index} className="text-xs text-yellow-400 ml-1">
          {d}
        </p>
      ))}
    </div>
  );
};

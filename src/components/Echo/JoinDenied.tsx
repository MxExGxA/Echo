import { Icon } from "@iconify/react";
import rejectedTone from "@/assets/sounds/rejected.wav";
import { useEffect, useRef } from "react";

const JoinDenied = () => {
  const handleRetry = (): void => {
    window.location.reload();
  };
  const eleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    eleRef.current!.click();
    const audio = new Audio(rejectedTone);
    audio.play();
    return () => audio.remove();
  }, []);

  return (
    <div ref={eleRef} className="flex flex-col justify-center items-center">
      <Icon icon="line-md:phone-off" className="text-6xl text-main-red mb-5" />
      <h1>Your Join Request has been Denied!</h1>
      <button className="text-main-red" onClick={handleRetry}>
        Retry
      </button>
    </div>
  );
};

export default JoinDenied;

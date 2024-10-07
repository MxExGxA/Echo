import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";

const LimitReached = () => {
  const navigate = useNavigate();
  const [counter, setCounter] = useState<number>(5);

  useEffect(() => {
    const i = setInterval(() => {
      setCounter((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(i);
  }, []);

  useEffect(() => {
    if (counter === 0) {
      navigate("/", { replace: true });
    }
  }, [counter]);

  return (
    <div className="flex flex-col justify-center items-center">
      <Icon icon="line-md:gauge-full" className="text-6xl text-main-red mb-5" />
      <h1>This Echo is Full!</h1>
      <h2 className="text-main-red">Redirecting to home page in {counter}</h2>
    </div>
  );
};

export default LimitReached;

import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { GiBootKick } from "react-icons/gi";

const Kicked = () => {
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
    <div className="h-screen w-full flex flex-col justify-center items-center ">
      <GiBootKick className="text-6xl text-main-red mb-5" />
      <h1>Oops! You have been kicked from this echo.</h1>
      <h2 className="text-main-red">Redirecting to home page in {counter}</h2>
    </div>
  );
};

export default Kicked;

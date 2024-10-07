import { useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";

const InvalidData = () => {
  const navigate = useNavigate();
  const handleHomeRedirect = (): void => {
    navigate("/", { replace: true });
  };

  return (
    <div className="flex flex-col justify-center items-center">
      <Icon
        icon="line-md:emoji-frown"
        className="text-6xl text-main-red mb-5"
      />

      <h1>Invalid Data Entered</h1>
      <button className="text-main-red" onClick={handleHomeRedirect}>
        return to home?
      </button>
    </div>
  );
};

export default InvalidData;

import { useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";

const NotExist = () => {
  const navigate = useNavigate();

  const handleCreateNewOne = (): void => {
    navigate("/echo/create");
  };
  return (
    <div className="flex flex-col justify-center items-center">
      <Icon
        icon="line-md:close-circle-twotone"
        className="text-6xl text-main-red mb-5"
      />
      <h1>This Echo is not exist!</h1>
      <button className="text-main-blue" onClick={handleCreateNewOne}>
        Create a new one?
      </button>
    </div>
  );
};

export default NotExist;

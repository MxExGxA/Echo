import { Icon } from "@iconify/react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";

const EchoExists = () => {
  const { echoID } = useParams();
  const navigate = useNavigate();

  const handleJoinEcho = (): void => {
    navigate(`/echo/join?invitation=${echoID}`);
  };

  return (
    <div className="flex flex-col justify-center items-center">
      <Icon
        icon="line-md:search-filled"
        className="text-6xl text-main-red mb-5"
      />
      <h1>This Echo is already exist</h1>
      <button className="text-main-blue" onClick={handleJoinEcho}>
        Join?
      </button>
    </div>
  );
};

export default EchoExists;

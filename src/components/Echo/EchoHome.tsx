import Button from "@/components/Buttons/Button";
import EchoCover from "@/components/Echo/EchoCover";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import bannerImage from "@/assets/images/banner.svg";

const EchoHome = () => {
  const [creationLoading, setCreationLoading] = useState<boolean>(false);
  const [joiningLoading, setJoiningLoading] = useState<boolean>(false);

  const navigate = useNavigate();

  const handleCreateEcho = () => {
    setCreationLoading(true);
    navigate("/echo/create");
  };

  const handleJoinEcho = () => {
    setJoiningLoading(true);
    navigate("/echo/join");
  };

  return (
    <main className="h-screen w-full overflow-hidden">
      <EchoCover>
        <div className="banner">
          <img src={bannerImage} className="w-[500px]" alt="banner" />
        </div>
        <div className="buttons flex flex-col items-center mt-10 *:transition-colors *:duration-300">
          <Button
            text={"Create a new echo"}
            type="primary"
            onClick={handleCreateEcho}
            loading={creationLoading}
          />
          <Button
            text={"Join an existing one"}
            type="secondary"
            onClick={handleJoinEcho}
            loading={joiningLoading}
          />
        </div>
      </EchoCover>
    </main>
  );
};

export default EchoHome;

import { useSelector } from "react-redux";
import { stateType } from "@/redux/store";
import { EchoUtils } from "@/utils/Utiliteis";
import DialogsColumn from "../JoinDialog/DialogsColumn";
import Messaging from "../Messaging/Messaging";
import DynamicLayout from "../DynamicLayout/DynamicLayout";
import Members from "../Members/Members";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const EchoDashboard = ({ echoUtils }: { echoUtils: EchoUtils }) => {
  const navigate = useNavigate();
  const requestsSelector = useSelector(
    (state: stateType) => state.joinReqs.requests
  );

  useEffect(() => {
    // echoUtils.echoSocket.on("disconnect", () => {
    //   navigate("/kicked");
    // });
  }, []);

  return (
    <div className="relative h-screen w-full flex justify-center items-center overflow-hidden">
      <Messaging echoUtils={echoUtils} />
      <Members echoUtils={echoUtils} />
      <DynamicLayout echoUtils={echoUtils} />
      {requestsSelector ? (
        <DialogsColumn joinRequests={requestsSelector} />
      ) : (
        ""
      )}
    </div>
  );
};

export default EchoDashboard;

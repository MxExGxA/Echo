import { removeJoinRequest } from "@/redux/joinRequestsSlice";
import { joinRequest } from "@/utils/types";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";

const JoinReqDialog = ({ request }: { request: joinRequest }) => {
  const [denyCounter, setDenyCounter] = useState<number>(10);
  const dispatch = useDispatch();

  const handleApproveRequest = (): void => {
    request.echoUtils.approveJoinRequest({
      echoID: request.echoID,
      member: request.member,
    });

    dispatch(removeJoinRequest(request.member.id));
  };
  const handleDenyRequest = (): void => {
    request.echoUtils.denyJoinRequest({
      echoID: request.echoID,
      member: request.member,
    });

    dispatch(removeJoinRequest(request.member.id));
  };

  useEffect(() => {
    const i = setInterval(() => {
      setDenyCounter((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(i);
  }, []);

  useEffect(() => {
    denyCounter === 0 && handleDenyRequest();
  }, [denyCounter]);

  return (
    <div
      className={`bg-white relative shadow-lg flex flex-col items-center w-96 rounded-tr-md rounded-br-md border border-l-[10px] border-main-blue z-50`}
    >
      <h2 className="py-4">{request.member.name} Requesting to Join.</h2>
      <div className="controls flex justify-between items-center pb-4 *:w-32 *:h-10 *:px-4 *:mx-4 *:rounded-sm *:transition-colors *:duration-300 ">
        <button
          className="bg-main-blue text-white border-main-blue hover:text-main-blue hover:bg-white border"
          onClick={handleApproveRequest}
        >
          Approve
        </button>
        <button
          className="border border-main-blue text-main-blue hover:bg-main-blue hover:text-white"
          onClick={handleDenyRequest}
        >
          Deny {denyCounter}
        </button>
      </div>
    </div>
  );
};

export default JoinReqDialog;

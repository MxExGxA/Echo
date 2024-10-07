import { joinRequest } from "@/utils/types";
import JoinReqDialog from "./JoinReqDialog";

const DialogsColumn = ({ joinRequests }: { joinRequests: joinRequest[] }) => {
  return (
    <div className="absolute left-0 bottom-0 w-fit *:my-5">
      {joinRequests?.map((request) => (
        <JoinReqDialog request={request} key={request.member.id} />
      ))}
    </div>
  );
};

export default DialogsColumn;

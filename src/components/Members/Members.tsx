import { stateType } from "@/redux/store";
import { Admin, Member } from "@/utils/types";
import { useEffect, useState } from "react";
import { FaUserFriends } from "react-icons/fa";
import { IoIosClose } from "react-icons/io";
import { MdOutlineContentCopy } from "react-icons/md";
import { useSelector } from "react-redux";
import { EchoUtils } from "@/utils/Utiliteis";
import Notify from "../Notify/Notify";
import ToggleButton from "../Buttons/ToggleButton";

const Members = ({ echoUtils }: { echoUtils: EchoUtils }) => {
  const [toggleMembers, setToggleMembers] = useState<boolean>(false);
  const handleToggleMembers = (): void => {
    setToggleMembers(!toggleMembers);
  };
  const membersSelector = useSelector(
    (state: stateType) => state.members.members as Admin[]
  );

  const [amIAdmin, setAmIAdmin] = useState<boolean>(false);

  const [notify, setNotify] = useState<{ type: string; message: string }>({
    message: "",
    type: "",
  });

  const handleKickMember = (member: Member): void => {
    if (amIAdmin) {
      echoUtils.kickMember(echoUtils.echoID, member);
    }
  };

  const handleCopyInvitationLink = async () => {
    const inviteLink = `${
      import.meta.env.VITE_PUBLIC_HOSTNAME
    }/echo/join?invitation=${echoUtils.echoID}`;
    try {
      window.navigator.clipboard.writeText(inviteLink);
      setNotify({
        type: "info",
        message: "invitation link copied to your clipboard",
      });
    } catch (err) {
      setNotify({
        type: "error",
        message: "couldn't copy invitation link!",
      });
    }
  };

  useEffect(() => {
    setAmIAdmin(echoUtils.adminID === echoUtils.echoSocket.id);
  }, [membersSelector]);

  return (
    <div className="absolute w-full h-full flex justify-center items-center">
      <ToggleButton
        toggle={toggleMembers}
        icon={<FaUserFriends />}
        onClick={handleToggleMembers}
        bottom={96}
      />

      {toggleMembers ? (
        <div className="members-dialog relative px-5 w-80 h-96 bg-gray-100 shadow-md border rounded-lg z-50">
          <div className="header flex justify-between items-center border-b py-4">
            <h1 className="text-gray-700 font-bold text-lg">Members</h1>
            <IoIosClose
              className="text-3xl text-main-red cursor-pointer"
              onClick={() => setToggleMembers(false)}
            />
          </div>
          <div className="border my-3 bg-white px-2 rounded-md">
            <ul>
              {membersSelector.map((member) => (
                <div
                  key={member.id}
                  className="flex justify-between items-center"
                >
                  <li className="my-2 flex items-center">
                    <span
                      className={`${
                        member.id === echoUtils.echoSocket.id
                          ? "text-main-blue"
                          : "text-black"
                      }`}
                    >
                      {member.name}
                    </span>
                    {member.id === echoUtils.adminID && (
                      <span className="text-xs text-main-red"> (Admin⛊)</span>
                    )}
                  </li>
                  {!member.isAdmin && amIAdmin && (
                    <button
                      onClick={() => handleKickMember(member)}
                      className="text-sm text-main-red"
                    >
                      Kick
                    </button>
                  )}
                </div>
              ))}
            </ul>
          </div>
          <div className="absolute bg-white border bottom-0 left-0 m-5 rounded-md text-sm p-2 flex justify-center items-center">
            {echoUtils.echoID}
            <MdOutlineContentCopy
              className="text-2xl text-gray-700 cursor-pointer active:text-main-blue"
              onClick={handleCopyInvitationLink}
              title="copy invitation link"
            />
          </div>
        </div>
      ) : (
        ""
      )}
      <Notify notify={notify} setNotify={setNotify} />
    </div>
  );
};

export default Members;

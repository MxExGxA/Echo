import { stateType } from "@/redux/store";
import { Admin, MessageType, socketClient } from "@/utils/types";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

const Message = ({
  message,
  socket,
}: {
  message: MessageType;
  socket: socketClient;
}) => {
  const membersSelector = useSelector(
    (state: stateType) => state.members.members
  );
  const from = membersSelector.find((m) => m.id === message.fromID) as Admin;
  const [link, setLink] = useState<string>("");

  useEffect(() => {
    if (message.type === "file") {
      const pathFromMessage = message.message.split("::")[1];
      setLink(
        `http://${import.meta.env.VITE_PUBLIC_SERVER}/file/${pathFromMessage}`
      );
    }
  }, []);

  useEffect(() => {
    console.log(link);
  }, [link]);
  return (
    <li className={`text-sm py-1`}>
      <span
        className={`font-bold ${
          message.type !== "info" && message.fromID === socket.id
            ? "text-main-blue"
            : message.type === "info"
            ? "text-gray-400"
            : "text-gray-600"
        }`}
      >
        {message.fromName}
        {from?.isAdmin && message.type !== "info" ? (
          <span className="text-xs text-main-red">(Admin⛊)</span>
        ) : (
          ""
        )}
      </span>
      <span
        className={`break-words ${
          message.type === "info" ? "text-gray-400" : "text-gray-600"
        }`}
      >
        {" "}
        {link ? (
          <Link className="border-b border-black" to={link} target="_blank">
            {message.message.split("::")[0]}
          </Link>
        ) : (
          message.message
        )}
      </span>
    </li>
  );
};

export default Message;

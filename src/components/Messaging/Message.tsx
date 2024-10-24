import { stateType } from "@/redux/store";
import { Admin, MessageType, socketClient } from "@/utils/types";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { checkLinkProtocol, checkMedia } from "./utils";
import { MediaContainer } from "./MediaContainer";
import validator from "validator";
import { IoMdDownload } from "react-icons/io";
import { FiExternalLink } from "react-icons/fi";

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
  const [isImage, setIsImage] = useState<boolean>(false);
  const [isVideo, setIsVideo] = useState<boolean>(false);

  useEffect(() => {
    if (message.type === "file") {
      const pathFromMessage = message.message.split("::")[1];
      setLink(`${import.meta.env.VITE_PUBLIC_SERVER}/file/${pathFromMessage}`);
      checkMedia(setIsImage, setIsVideo, message);
    }

    const isLink = validator.isURL(message.message);
    if (isLink) {
      const linkWithProtocol = checkLinkProtocol(message.message);
      setLink(linkWithProtocol);
    }
  }, []);

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
          <div className="text-main-blue">
            {!isImage && !isVideo ? (
              <a
                href={link}
                target="_blank"
                className="flex items-center break-all"
              >
                {message.message.split("::")[0]}{" "}
                <FiExternalLink className="ml-2 flex-shrink-0" />
              </a>
            ) : (
              <div className="relative border-8 rounded-md border-main-blue w-fit">
                <a
                  title="donwload"
                  href={link}
                  target="_blank"
                  className="absolute -right-2 -bottom-6 rounded-bl-md rounded-br-md text-white text-sm bg-main-blue px-2 py-1 z-10"
                >
                  <IoMdDownload />
                </a>
                {isImage ? (
                  <a href={link} target="_blank">
                    <MediaContainer
                      isImage={isImage}
                      isVideo={isVideo}
                      alt={message.message.split("::")[0]}
                      source={link}
                    />
                  </a>
                ) : (
                  <MediaContainer
                    isImage={isImage}
                    isVideo={isVideo}
                    alt={message.message.split("::")[0]}
                    source={link}
                  />
                )}
              </div>
            )}
          </div>
        ) : (
          message.message
        )}
      </span>
    </li>
  );
};

export default Message;

import { MdMessage } from "react-icons/md";
import { IoMdClose, IoMdSend } from "react-icons/io";
import { RiAttachment2 } from "react-icons/ri";
import { GrEmoji } from "react-icons/gr";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { addMessage } from "@/redux/messagesSlice";
import { useSelector } from "react-redux";
import { stateType } from "@/redux/store";
import { MessageType } from "@/utils/types";
import { EchoUtils } from "@/utils/Utiliteis";
import Message from "./Message";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import Notify from "../Notify/Notify";

const Messaging = ({ echoUtils }: { echoUtils: EchoUtils }) => {
  const [toggleMessages, setToggleMessages] = useState<boolean>(false);
  const [messageVal, setMessageVal] = useState<string>("");
  const [unread, setUnread] = useState<boolean>(false);
  const [toggleEmoji, setToggleEmoji] = useState<boolean>(false);
  const [notify, setNotify] = useState<{ type: string; message: string }>({
    message: "",
    type: "",
  });
  const messagesBodyRef = useRef<HTMLDivElement>(null);
  const messagesinputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dispatch = useDispatch();
  const messagesSelector = useSelector((state: stateType) => state.messages);
  const membersSelector = useSelector(
    (state: stateType) => state.members.members
  );

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setMessageVal(e.target.value);
  };

  const handleSendMessage = () => {
    const fromName = membersSelector.find(
      (member) => member.id === echoUtils.echoSocket.id
    )?.name as string;

    echoUtils.sendMessage({
      type: "chat",
      fromID: echoUtils.echoSocket.id as string,
      fromName: fromName,
      message: messageVal.trim(),
    });

    dispatch(
      addMessage({
        type: "chat",
        fromID: echoUtils.echoSocket.id,
        fromName: fromName,
        message: messageVal.trim(),
      })
    );
    setMessageVal("");
  };

  const handleMessagesButton = () => {
    if (!messageVal.trim()) {
      setToggleMessages(!toggleMessages);
    } else {
      handleSendMessage();
    }
  };

  const handleEnterKey = (e: KeyboardEvent) => {
    if (e.code === "Enter" || e.code === "NumpadEnter") {
      e.preventDefault();
      if (toggleMessages && messageVal.trim()) {
        handleSendMessage();
      }
    }
  };

  const handleSendFile = (e: ChangeEvent) => {
    e.preventDefault();
    const input = e.target as HTMLInputElement;
    if (input.files?.length) {
      //check if the file > 20 mb
      if (input.files[0].size > 20 * 1024 * 1024) {
        setNotify({ message: "max file size is 20 mb", type: "info" });
      } else {
        //sending file to store it on the server
        setNotify({ message: "sending file...", type: "info" });
        const file = input.files[0];
        const fileExtention = file.name.split(".").pop();

        echoUtils.echoSocket.emit(
          "upload",
          {
            echoID: echoUtils.echoID,
            fromID: echoUtils.echoSocket.id,
            fileName: file.name,
            fileType: file.type,
            fileExtention,
            fileSize: file.size,
            fileData: file,
          },
          (status: { state: string; message: MessageType }) => {
            if (status.state === "success") {
              dispatch(addMessage(status.message));
              setNotify({ message: "file Sent", type: "success" });
            } else {
              setNotify({ message: "sending file failed!", type: "error" });
            }
          }
        );
      }
      input.value = "";
    }
  };

  useEffect(() => {
    messagesinputRef.current?.addEventListener("keypress", handleEnterKey);
    return () =>
      messagesinputRef.current?.removeEventListener("keypress", handleEnterKey);
  }, [messageVal]);

  useEffect(() => {
    if (toggleMessages) {
      setUnread(false);
      messagesinputRef.current?.focus();
    }
  }, [toggleMessages]);

  useEffect(() => {
    //scroll down on new message
    messagesBodyRef.current?.scroll({
      top: messagesBodyRef.current.scrollHeight,
    });
    if (
      !toggleMessages &&
      messagesSelector.messages[messagesSelector.messages.length - 1].type ===
        "chat"
    ) {
      setUnread(true);
    }
  }, [messagesSelector]);

  return (
    <>
      <div
        className={`absolute right-0 bottom-0 z-40 ${
          !toggleMessages && "hidden"
        }`}
      >
        <div
          className={`messages bg-white relative h-screen w-96 shadow-lg border border-gray-200`}
        >
          <h1 className="absolute left-7 top-6 text-2xl font-bold text-gray-700">
            Messages
          </h1>
          <div
            ref={messagesBodyRef}
            className="messages-body scroll-bar-clip absolute border border-gray-200 left-5 top-20 right-5 h-[calc(100%-178px)] rounded-xl p-5 text-gray-500 overflow-y-scroll overflow-x-hidden"
          >
            <ul>
              {messagesSelector.messages.map((message, index) => (
                <Message
                  key={index}
                  message={message}
                  socket={echoUtils.echoSocket}
                />
              ))}
            </ul>
          </div>

          <input
            ref={messagesinputRef}
            type="text"
            placeholder="Type a message..."
            className="h-14 pl-16 pr-16 absolute bottom-5 left-5 right-5 rounded-full outline-none border border-gray-200"
            onChange={handleInputChange}
            value={messageVal}
          />
          <div
            className={`absolute bottom-[95px] right-0 flex justify-center w-96 ${
              toggleEmoji
                ? "translate-x-0 opacity-100"
                : "translate-x-96 opacity-0"
            } transition-all duration-300`}
          >
            <Picker
              data={data}
              onEmojiSelect={(e: any) =>
                setMessageVal((prev) => prev + e.native)
              }
              onClickOutside={() => toggleEmoji && setToggleEmoji(false)}
            />
          </div>
          <GrEmoji
            className={`absolute h-5 w-5 bottom-[38px] left-8 text-gray-400 hover:text-gray-600 cursor-pointer z-10`}
            onClick={() => setToggleEmoji(!toggleEmoji)}
          />
          <RiAttachment2
            className="absolute h-5 w-5 bottom-[38px] left-14  text-gray-400 hover:text-gray-600 cursor-pointer z-10"
            onClick={() => fileInputRef.current?.click()}
          />
          <input
            ref={fileInputRef}
            onChange={handleSendFile}
            type="file"
            className="opacity-0"
          />
        </div>
      </div>
      <div
        className={`btn-msg absolute flex justify-center items-center w-12 h-12 right-6 bottom-[25px] z-50 ${
          toggleMessages
            ? messageVal.trim()
              ? "bg-main-blue"
              : "bg-main-red"
            : "bg-main-blue"
        }  rounded-full text-3xl p-3 text-white shadow-md cursor-pointer hover:scale-110 transition-all duration-300 active:scale-100`}
        onClick={handleMessagesButton}
      >
        {unread ? (
          <div className="absolute top-0 left-0 unread w-4 h-4 rounded-full bg-main-red"></div>
        ) : (
          ""
        )}
        {toggleMessages ? (
          messageVal.trim() ? (
            <IoMdSend />
          ) : (
            <IoMdClose />
          )
        ) : (
          <MdMessage />
        )}
      </div>
      <Notify notify={notify} setNotify={setNotify} />
    </>
  );
};

export default Messaging;

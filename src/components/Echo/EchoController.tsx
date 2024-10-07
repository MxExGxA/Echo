import EchoExists from "@/components/Echo/EchoExists";
import JoinDenied from "@/components/Echo/JoinDenied";
import Loader from "@/components/Loader/Loader";
import NotExist from "@/components/Echo/NotExist";
import TimedOut from "@/components/Echo/TimedOut";
import InvalidData from "@/components/Echo/InvalidData";
import LimitReached from "@/components/Echo/LimitReached";
import type { Admin, Member, statusType } from "@/utils/types";
import { EchoUtils } from "@/utils/Utiliteis";
import { useSearchParams, useNavigate, useParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { useDispatch } from "react-redux";
import { setMembers } from "@/redux/membersSlice";
import { addJoinRequest } from "@/redux/joinRequestsSlice";
import { addMessage, setMessages } from "@/redux/messagesSlice";
import { setMedia } from "@/redux/mediaSlice";
import EchoDashboard from "@/components/Echo/EchoDashboard";

const EchoController = () => {
  const echoUtilsRef = useRef<EchoUtils>();
  const [queries] = useSearchParams();
  const name = queries.get("name");
  const action = queries.get("action");
  const [status, setStatus] = useState<statusType>({
    joined: false,
    denied: false,
    notExist: false,
    created: false,
    echoExist: false,
    timedOut: false,
    invalidData: false,
    echoIsFull: false,
  });
  const dispatch = useDispatch();
  const timeOutRef = useRef<number>();
  const navigate = useNavigate();
  const updateStatus = (key: string, value: boolean) => {
    setStatus((prev) => ({ ...prev, [key]: value }));
  };
  const initJoinCounter = () => {
    return setTimeout(() => {
      updateStatus("timedOut", true);
    }, 15000);
  };

  const params = useParams();

  useEffect(() => {
    const socket = io(
      `${import.meta.env.VITE_PUBLIC_SERVER}:${
        import.meta.env.VITE_PUBLIC_SERVER_PORT
      }`
    );

    socket.on("connect", () => {
      const echoUtils = new EchoUtils(socket);
      echoUtilsRef.current = echoUtils;
      if (action === "create") {
        echoUtils.createEcho(
          params.echoID as string,
          {
            name: name,
            id: socket.id,
          } as Admin
        );
      } else if (action === "join") {
        echoUtils.joinEcho(
          params.echoID as string,
          {
            name: name,
            id: socket.id,
          } as Member
        );
        timeOutRef.current = initJoinCounter();
      }
      socket.on("echoCreated", (opts) => {
        updateStatus("created", true);
        dispatch(setMembers(opts.members));
        dispatch(setMessages(opts.messages));
      });
      socket.on("joinRequestApproved", (opts) => {
        updateStatus("joined", true);
        dispatch(setMembers(opts.members));
        dispatch(setMessages(opts.messages));
        dispatch(setMedia(opts.media));
        clearTimeout(timeOutRef.current);
      });
      socket.on("memberJoined", (opts) => {
        dispatch(setMembers(opts.echo.members));
        dispatch(setMessages(opts.echo.messages));
        dispatch(setMedia(opts.echo.media));
      });
      socket.on("memberLeft", (opts) => {
        dispatch(setMembers(opts.members));
        dispatch(setMessages(opts.messages));
        dispatch(setMedia(opts.media));
      });
      socket.on("media", (opts) => {
        dispatch(setMedia(opts));
      });
      socket.on("joinRequestDenied", () => {
        updateStatus("denied", true);
        clearTimeout(timeOutRef.current);
      });
      socket.on("echoExists", () => {
        updateStatus("echoExist", true);
      });
      socket.on("echoNotFound", () => {
        updateStatus("notExist", true);
      });
      socket.on("invalidData", () => {
        updateStatus("invalidData", true);
      });
      socket.on("limitReached", () => {
        updateStatus("echoIsFull", true);
      });
      socket.on("joinRequest", (opts: { echoID: string; member: Member }) => {
        dispatch(
          addJoinRequest({
            echoID: opts.echoID,
            echoUtils,
            member: opts.member,
          })
        );
      });
      socket.on("echoMessage", (opts) => {
        dispatch(addMessage(opts));
      });
      socket.on("memberKicked", (opts) => {
        if (opts.member.id === echoUtils.echoSocket.id) {
          socket.disconnect();
          navigate(`/kicked/?echo=${opts.echoID}`, { replace: true });
        }
      });
    });
    return () => {
      echoUtilsRef.current?.leaveEcho();
      socket.off("connect");
      socket.off("echoCreated");
      socket.off("joinRequestApproved");
      socket.off("memberJoined");
      socket.off("memberLeft");
      socket.off("joinRequestDenied");
      socket.off("echoExists");
      socket.off("invalidData");
      socket.off("limitReached");
      socket.off("joinRequest");
      socket.off("echoMessage");
      socket.off("memberKicked");
      socket.off("media");
    };
  }, []);
  return (
    <div className="h-screen flex flex-col justify-center items-center">
      {action === "join" && !status.joined ? (
        status.denied ? (
          <JoinDenied />
        ) : status.notExist ? (
          <NotExist />
        ) : status.timedOut ? (
          <TimedOut />
        ) : status.invalidData ? (
          <InvalidData />
        ) : status.echoIsFull ? (
          <LimitReached />
        ) : (
          <Loader action={action} />
        )
      ) : (
        action === "join" && (
          <EchoDashboard echoUtils={echoUtilsRef.current as EchoUtils} />
        )
      )}
      {action === "create" && !status.created ? (
        status.echoExist ? (
          <EchoExists />
        ) : status.invalidData ? (
          <InvalidData />
        ) : (
          <Loader action={action} />
        )
      ) : (
        action === "create" && (
          <EchoDashboard echoUtils={echoUtilsRef.current as EchoUtils} />
        )
      )}
    </div>
  );
};
export default EchoController;

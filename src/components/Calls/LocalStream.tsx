import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { stateType } from "@/redux/store";
import { Draggable } from "gsap/Draggable";
import { EchoUtils } from "@/utils/Utiliteis";
import CallPlaceholder from "./CallPlaceholder";
import gsap from "gsap";

const LocalStream = ({
  stream,
  echoUtils,
  peers,
}: {
  stream: MediaStream | null;
  echoUtils: EchoUtils;
  peers: { [key: string]: RTCPeerConnection };
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const screenShareRef = useRef<HTMLVideoElement>(null);
  const [togglePlaceholder, setTogglePlaceholder] = useState<boolean>(true);
  const [localScreenShared, setLocalScreenShared] = useState<boolean>(false);
  const [memberName, setMemberName] = useState<string>("");
  const membersSelector = useSelector(
    (state: stateType) => state.members.members
  );
  const [audio, setAudio] = useState<MediaStream>();

  useEffect(() => {
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0];
      const audioTrack = stream.getAudioTracks()[0];

      if (videoTrack && videoTrack.enabled) {
        setTogglePlaceholder(false);
      }

      if (videoTrack) {
        videoTrack.onmute = () => {
          setTogglePlaceholder(true);
        };
        videoTrack.onunmute = () => {
          setTogglePlaceholder(false);
        };
      }

      if (videoTrack) {
        const newStream = new MediaStream([videoTrack as MediaStreamTrack]);
        videoRef.current!.srcObject = newStream;
      }

      if (audioTrack) {
        const audioStream = new MediaStream();
        audioStream.addTrack(audioTrack);
        setAudio(audioStream);
      }

      console.log("stream", stream);
    }
  }, [stream]);

  useEffect(() => {
    const member = membersSelector.find(
      (member) => member.id === echoUtils.echoSocket.id
    );
    if (member) {
      setMemberName(member.name);
    }
  }, [membersSelector]);

  useEffect(() => {
    if (peers) {
      Object.keys(peers).forEach((peer) => {
        if (stream) {
          //check if this peer has audio track on it
          const audioTransceiver = peers[peer]
            .getTransceivers()
            .find((t) => t.sender.track && t.sender.track.kind === "audio");
          // if it has no  audio track, add our localstream audio track to it
          if (!audioTransceiver) {
            try {
              const audioTrack = stream?.getAudioTracks()[0];
              if (audioTrack) {
                peers[peer].addTransceiver(audioTrack, {
                  direction: "sendrecv",
                });
              }
            } catch (err) {
              throw new Error(
                `Error: couldn't add audio track to peer ${peers[peer]}`
              );
            }
          }
          // // check if this peer has video track on it
          const videoTransceiver = peers[peer]
            .getTransceivers()
            .find((t) => t.sender.track && t.sender.track.kind === "video");

          //if it has no  video track, add our localstream video track to it
          if (!videoTransceiver) {
            try {
              console.log("adding video transceiver");
              const videoTrack = stream?.getVideoTracks()[0];
              if (videoTrack) {
                peers[peer].addTransceiver(videoTrack, {
                  direction: "sendrecv",
                });
              }
            } catch (err) {
              throw new Error(
                `Error: couldn't add video track to peer ${peers[peer]}`
              );
            }
          }
          // //if local screen shared
          if (localScreenShared) {
            try {
              const screenTrack = stream
                ?.getVideoTracks()
                .find(
                  (t) => t.getCapabilities().displaySurface
                ) as MediaStreamTrack;
              if (
                !peers[peer]
                  .getSenders()
                  .find((sender) => sender.track === screenTrack)
              ) {
                peers[peer].addTransceiver(screenTrack, {
                  direction: "sendrecv",
                });
              }
            } catch (err) {
              console.log(err);
              throw new Error(
                `Error: couldn't add screen track to peer ${peers[peer]}`
              );
            }
          }
        }
      });
    }
  }, [peers, stream]);

  useEffect(() => {
    Draggable.create(".draggable", {
      bounds: ".localContainer",
      zIndexBoost: false,
      cursor: "default",
    });

    echoUtils.echoSocket.on("screenShare", (opts) => {
      opts.memberID === echoUtils.echoSocket.id && setLocalScreenShared(true);
    });

    echoUtils.echoSocket.on("stopScreenShare", (opts) => {
      opts.memberID === echoUtils.echoSocket.id && setLocalScreenShared(false);
    });
  }, []);

  useEffect(() => {
    if (localScreenShared) {
      const vt = stream
        ?.getVideoTracks()
        .find((t) => t.getSettings().displaySurface) as MediaStreamTrack;
      if (vt) {
        const screenShareStream = new MediaStream([vt]);
        screenShareRef.current!.srcObject = screenShareStream;
      }
    } else {
      gsap.to(".draggable", { x: 0, y: 0, duration: 0 });
    }
  }, [localScreenShared]);

  return (
    <div className={`localContainer relative grid-item overflow-hidden`}>
      {/* Camera and placeholder */}

      <div
        className={`draggable absolute w-full h-full  overflow-hidden z-10 ${
          localScreenShared
            ? "!w-1/4 !h-1/4  aspect-video right-0 top-0 rounded-lg border-2 m-2"
            : "w-full right-0 top-0"
        }`}
      >
        {togglePlaceholder && (
          <CallPlaceholder
            className={`absolute w-full h-full z-10 bg-black flex justify-center items-center text-white ${
              localScreenShared && "*:!text-xl"
            }`}
            memberName={memberName}
            audio={audio as MediaStream}
          />
        )}
        <video
          ref={videoRef}
          className={`absolute z-10 ${togglePlaceholder && "hidden"}`}
          autoPlay
          muted
        />
      </div>

      {/* screen sharing */}
      <video
        ref={screenShareRef}
        className={`absolute right-0 top-0  w-full ${
          localScreenShared ? "" : "hidden"
        }`}
        autoPlay
        muted
      />
    </div>
  );
};

export default LocalStream;

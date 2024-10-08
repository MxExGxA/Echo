import { stateType } from "@/redux/store";
import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { Draggable } from "gsap/Draggable";
import { CiMicrophoneOff } from "react-icons/ci";
import { EchoUtils } from "@/utils/Utiliteis";
import CallPlaceholder from "./CallPlaceholder";
import gsap from "gsap";

const RemoteStream = ({
  className,
  peer,
  echoUtils,
  id,
}: {
  className?: string;
  peer: RTCPeerConnection;
  echoUtils: EchoUtils;
  id: string;
}) => {
  const [toggleVideo, setToggleVideo] = useState<boolean>(false);
  const [toggleAudio, setToggleAudio] = useState<boolean>(false);
  const [memberName, setMemberName] = useState<string>("");
  const [audio, setAudio] = useState<MediaStream>();
  const [remoteScreenShared, setRemoteScreenShared] = useState<boolean>(false);
  const [videoTrackList, setVideoTrackList] = useState<MediaStreamTrack[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const screenShareRef = useRef<HTMLVideoElement>(null);

  const mediaSelector = useSelector((state: stateType) => state.media.media);
  const membersSelector = useSelector(
    (state: stateType) => state.members.members
  );

  useEffect(() => {
    mediaSelector.forEach((media) => {
      if (Object.entries(media)[0][0] === id) {
        const mediaConf = Object.entries(media)[0][1];
        console.log(Object.entries(media)[0]);

        setToggleVideo(mediaConf.camera.toggle);
        setToggleAudio(mediaConf.mic.toggle);
        setRemoteScreenShared(mediaConf.screen.toggle);

        if (videoTrackList.length) {
          if (mediaConf.camera.toggle) {
            const cameraTrack = videoTrackList.find(
              (track) => track.id === mediaConf.camera.id
            );
            if (cameraTrack) {
              const cameraStream = new MediaStream([cameraTrack]);
              videoRef.current!.srcObject = cameraStream;
            }
          }
          if (mediaConf.screen.toggle) {
            const screenTrack = videoTrackList.find(
              (track) => track.id === mediaConf.screen.id
            );
            if (screenTrack) {
              const screenStream = new MediaStream([screenTrack]);
              screenShareRef.current!.srcObject = screenStream;
            }
          }
        }
      }
    });
  }, [mediaSelector, videoTrackList]);

  useEffect(() => {
    if (membersSelector) {
      const name = membersSelector.find((member) => member.id === id)?.name;
      if (name) {
        setMemberName(name);
      }
    }
  }, [membersSelector]);

  useEffect(() => {
    if (peer) {
      peer.ontrack = (event: RTCTrackEvent) => {
        console.log("new track", event);

        if (event.track.kind === "video") {
          if (!videoTrackList.some((track) => track.id === event.track.id)) {
            setVideoTrackList((prev) => [...prev, event.track]);
          }
        }

        if (event.track.kind === "audio") {
          const audioStream = new MediaStream([event.track]);
          setAudio(audioStream);
          audioRef.current!.srcObject = audioStream;
        }
      };

      echoUtils.echoSocket.on("screenShare", (opts) => {
        opts.memberID === id && setRemoteScreenShared(true);
      });

      echoUtils.echoSocket.on("stopScreenShare", (opts) => {
        opts.memberID === id && setRemoteScreenShared(false);
      });
    }
  }, [peer, screenShareRef.current, videoRef.current]);

  useEffect(() => {
    if (!remoteScreenShared) {
      gsap.to(`.remoteDraggable${id}`, { x: 0, y: 0, duration: 0 });
    } else {
      Draggable.create(`.remoteDraggable${id}`, {
        bounds: `.remoteContainer${id}`,
        zIndexBoost: false,
        cursor: "default",
      });
    }
  }, [remoteScreenShared]);

  useEffect(() => {
    if (audio) {
      audio.getTracks().forEach((track) => (track.enabled = toggleAudio));
    }
  }, [toggleAudio]);

  return (
    <div
      className={`remoteContainer${id} relative grid-item overflow-hidden ${className}`}
    >
      <p className="absolute text-white right-5 top-5 z-20">{memberName}</p>
      {!toggleAudio && (
        <CiMicrophoneOff className="absolute top-5 left-5 text-main-red text-3xl z-40" />
      )}
      {/* camera and placeholder */}
      <div
        className={`remoteDraggable${id} absolute w-full h-full overflow-hidden z-10 ${
          remoteScreenShared
            ? "!w-1/4 !h-1/4 right-0 top-0 rounded-lg border-2 m-2"
            : "w-full right-0"
        }`}
      >
        <video
          ref={videoRef}
          className={`absolute z-10 ${toggleVideo ? "" : "hidden"}`}
          autoPlay
          onDoubleClick={() => {
            videoRef.current?.requestFullscreen({ navigationUI: "hide" });
          }}
          muted
        />

        {!toggleVideo && (
          <CallPlaceholder
            className={`absolute w-full h-full z-10 bg-black flex justify-center items-center text-white ${
              remoteScreenShared && "*:!text-xl"
            }`}
            memberName={memberName}
            audio={audio as MediaStream}
          />
        )}
      </div>
      <audio autoPlay ref={audioRef}></audio>

      {/* screen sharing */}
      <video
        ref={screenShareRef}
        className={`absolute right-0 top-0 w-full ${
          remoteScreenShared ? "" : "hidden"
        }`}
        onDoubleClick={() => screenShareRef.current?.requestFullscreen()}
        autoPlay
        muted
      />
    </div>
  );
};

export default RemoteStream;

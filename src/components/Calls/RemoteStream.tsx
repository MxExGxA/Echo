import { stateType } from "@/redux/store";
import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { Draggable } from "gsap/Draggable";
import { CiMicrophoneOff } from "react-icons/ci";
import { EchoUtils } from "@/utils/Utiliteis";
import CallPlaceholder from "./CallPlaceholder";
import gsap from "gsap";
import { types } from "mediasoup-client";
import { consumeMedia } from "@/utils/mediasoup/helpers";
import { mediaType } from "@/utils/types";

const RemoteStream = ({
  className,
  echoUtils,
  consumerTransport,
  device,
  id,
}: {
  className?: string;
  echoUtils: EchoUtils;
  consumerTransport: types.Transport;
  device: types.Device;
  id: string;
}) => {
  const [toggleVideo, setToggleVideo] = useState<boolean>(false);
  const [toggleAudio, setToggleAudio] = useState<boolean>(false);
  const [memberName, setMemberName] = useState<string>("");
  const [audio, setAudio] = useState<MediaStream>();
  const [remoteScreenShared, setRemoteScreenShared] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const screenShareRef = useRef<HTMLVideoElement>(null);
  const mediaSelector = useSelector((state: stateType) => state.media.media);
  const membersSelector = useSelector(
    (state: stateType) => state.members.members
  );
  const producers = useSelector(
    (state: stateType) => state.producers.producers
  );

  const mediaConfRef = useRef<mediaType>();

  useEffect(() => {
    mediaSelector.forEach((media) => {
      if (Object.entries(media)[0][0] === id) {
        const mediaConf = Object.entries(media)[0][1];
        mediaConfRef.current = mediaConf;
        setToggleVideo(mediaConf.camera.toggle);
        setToggleAudio(mediaConf.mic.toggle);
        setRemoteScreenShared(mediaConf.screen.toggle);
      }
    });
  }, [mediaSelector]);

  useEffect(() => {
    if (membersSelector) {
      const name = membersSelector.find((member) => member.id === id)?.name;
      if (name) {
        setMemberName(name);
      }
    }
  }, [membersSelector]);

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

  //when another user joins
  useEffect(() => {
    echoUtils.echoSocket.on("incommingMedia", async (opts) => {
      if (consumerTransport && opts.memberID === id) {
        console.log("incomming media", opts);

        const consumer = await consumeMedia(
          echoUtils.echoSocket,
          device,
          consumerTransport,
          opts.producerId as string
        );

        if (consumer) {
          if (consumer.kind === "audio") {
            const audioStream = new MediaStream();
            audioStream.addTrack(consumer.track);
            audioRef.current!.srcObject = audioStream;
            setAudio(audioStream);
          }
          if (consumer.kind === "video") {
            const videoStream = new MediaStream();
            videoStream.addTrack(consumer.track);
            if (opts.appData.trackType === "screen") {
              screenShareRef.current!.srcObject = videoStream;
            } else {
              videoRef.current!.srcObject = videoStream;
            }
          }
        }
      }
    });
  }, [consumerTransport]);

  //when this user joins
  useEffect(() => {
    const producersArr = producers[id];
    if (producersArr && device && consumerTransport) {
      producersArr.forEach(async (producer) => {
        const consumer = await consumeMedia(
          echoUtils.echoSocket,
          device,
          consumerTransport,
          producer?.id as string
        );

        if (consumer) {
          if (consumer.kind === "audio") {
            const audioStream = new MediaStream();
            audioStream.addTrack(consumer.track);
            audioRef.current!.srcObject = audioStream;
            setAudio(audioStream);
          }
          if (consumer.kind === "video") {
            const videoStream = new MediaStream();
            videoStream.addTrack(consumer.track);
            if (producer?.appData.trackType === "screen") {
              screenShareRef.current!.srcObject = videoStream;
            } else {
              videoRef.current!.srcObject = videoStream;
            }
          }
        }
      });
    }
  }, [producers, device, consumerTransport]);

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

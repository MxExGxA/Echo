import { stateType } from "@/redux/store";
import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { Draggable } from "gsap/Draggable";
import { CiMicrophoneOff } from "react-icons/ci";
import { EchoUtils } from "@/utils/Utiliteis";
import CallPlaceholder from "./CallPlaceholder";
import gsap from "gsap";
import { types } from "mediasoup-client";

const RemoteStream = ({
  className,
  echoUtils,
  consumerTransport,
  device,
  // peer,
  id,
}: {
  className?: string;
  echoUtils: EchoUtils;
  consumerTransport: types.Transport;
  device: types.Device;
  // peer: peerType;
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

  useEffect(() => {
    mediaSelector.forEach((media) => {
      if (Object.entries(media)[0][0] === id) {
        const mediaConf = Object.entries(media)[0][1];
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

  useEffect(() => {
    echoUtils.echoSocket.on("incommingMedia", async (opts) => {
      if (consumerTransport && opts.memberID === id) {
        echoUtils.echoSocket.emit(
          "consume",
          {
            rtpCapabilities: device!.rtpCapabilities,
            producerId: opts.producerId,
          },
          async ({
            consumerId,
            producerId,
            kind,
            rtpParameters,
            error,
          }: {
            consumerId: string;
            producerId: string;
            kind: types.MediaKind;
            rtpParameters: types.RtpParameters;
            error: any;
          }) => {
            if (error) {
              return;
            }

            const consumer = await consumerTransport?.consume({
              id: consumerId,
              producerId: producerId,
              kind,
              rtpParameters,
            });

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
                videoRef.current!.srcObject = videoStream;
              }
            }
            echoUtils.echoSocket.emit("resumeConsumer");
          }
        );
      }
    });
  }, [consumerTransport]);

  useEffect(() => {
    const producersArr = producers[id];
    console.log("=================<<<<<<<<<>>>>>>>>>", device);
    console.log("=================<<<<<<<<<>>>>>>>>>", consumerTransport);

    if (producersArr && device && consumerTransport) {
      producersArr.forEach((producer) => {
        console.log(producer);

        echoUtils.echoSocket.emit(
          "consume",
          {
            rtpCapabilities: device.rtpCapabilities,
            producerId: producer,
          },
          async ({
            consumerId,
            producerId,
            kind,
            rtpParameters,
            error,
          }: {
            consumerId: string;
            producerId: string;
            kind: types.MediaKind;
            rtpParameters: types.RtpParameters;
            error: any;
          }) => {
            if (error) {
              return;
            }
            console.log("triggered!!!!!!!!!");

            const consumer = await consumerTransport?.consume({
              id: consumerId,
              producerId: producerId,
              kind,
              rtpParameters,
            });

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
                videoRef.current!.srcObject = videoStream;
              }
            }
            echoUtils.echoSocket.emit("resumeConsumer");
          }
        );
      });
    }
  }, [producers]);

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

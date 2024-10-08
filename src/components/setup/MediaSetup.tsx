import { getLocalAudio, getLocalVideo } from "@/utils/streamFunctions";
import { useEffect, useRef, useState } from "react";
import ToggleMediaButton from "../Buttons/ToggleMediaButton";
import { CiMicrophoneOn, CiMicrophoneOff } from "react-icons/ci";
import { CiVideoOn, CiVideoOff } from "react-icons/ci";
import CallPlaceholder from "../Calls/CallPlaceholder";
import Notify from "../Notify/Notify";

const MediaSetup = ({
  name,
  setMedia,
}: {
  name: string;
  setMedia: Function;
}) => {
  const [localStream, setLocalStream] = useState<MediaStream | null>();
  const [micPermission, setMicPermission] = useState<boolean>(false);
  const [cameraPermission, setCameraPermission] = useState<boolean>();

  const [toggleMic, setToggleMic] = useState<boolean>(false);
  const [toggleCamera, setToggleCamera] = useState<boolean>(false);

  const [audio, setAudio] = useState<MediaStream>();
  const videoRef = useRef<HTMLVideoElement>(null);

  const [notify, setNotify] = useState<{ message: string; type: string }>({
    message: "",
    type: "",
  });

  const handleToggleMic = () => {
    if (micPermission) {
      setToggleMic(!toggleMic);
    } else {
      setNotify({
        message: "please allow mic permissions in order to use it",
        type: "info",
      });
    }
  };

  const handleToggleCamera = () => {
    if (cameraPermission) {
      setToggleCamera(!toggleCamera);
    } else {
      setNotify({
        message: "please allow camera permissions in order to use it",
        type: "info",
      });
    }
  };

  useEffect(() => {
    Promise.allSettled([getLocalVideo(), getLocalAudio()]).then((results) => {
      const videoTrack = results[0];
      const audioTrack = results[1];
      const localMediaStream = new MediaStream();

      if (audioTrack.status === "fulfilled") {
        localMediaStream.addTrack(audioTrack.value);
        setMicPermission(true);
        setToggleMic(true);
      } else {
        console.log("no mic permissions");
      }

      if (videoTrack.status === "fulfilled") {
        localMediaStream.addTrack(videoTrack.value);
        setCameraPermission(true);
        setToggleCamera(true);
      } else {
        console.log("no camera permissions");
      }

      setLocalStream(localMediaStream);
    });
  }, []);

  useEffect(() => {
    if (localStream) {
      videoRef.current!.srcObject = localStream;
      const audioStream = new MediaStream();
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioStream.addTrack(audioTrack);
        setAudio(audioStream);
      }
    }

    return () => {
      localStream?.getTracks().forEach((track) => track.stop());
    };
  }, [localStream, videoRef.current]);

  useEffect(() => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = toggleCamera;
      }

      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = toggleMic;
      }
    }

    setMedia({ camera: toggleCamera, mic: toggleMic });
  }, [toggleCamera, toggleMic, localStream]);
  return (
    <>
      <div className="relative w-9/12 max-md:w-full aspect-video m-10 border rounded-md overflow-hidden bg-gray-200">
        <video
          ref={videoRef}
          autoPlay
          muted
          className={`absolute top-0 left-0 w-full h-full object-cover ${
            cameraPermission && toggleCamera ? "" : "hidden"
          }`}
        ></video>

        <CallPlaceholder
          memberName={name}
          audio={audio as MediaStream}
          className={`${
            !toggleCamera ? "" : "hidden"
          }  absolute w-full h-full flex justify-center items-center bg-black`}
        />

        <div className="absolute bottom-0 left-0">
          <ToggleMediaButton
            onClick={handleToggleMic}
            status={!micPermission ? "error" : toggleMic ? "on" : "off"}
            title={
              !micPermission
                ? "no microphone permission"
                : toggleMic
                ? "turn microphone off"
                : "turn microphone on"
            }
          >
            {toggleMic ? <CiMicrophoneOn /> : <CiMicrophoneOff />}
          </ToggleMediaButton>
          <ToggleMediaButton
            onClick={handleToggleCamera}
            status={!cameraPermission ? "error" : toggleCamera ? "on" : "off"}
            title={
              !cameraPermission
                ? "no camera permission"
                : toggleMic
                ? "turn camera off"
                : "turn camera on"
            }
          >
            {toggleCamera ? <CiVideoOn /> : <CiVideoOff />}
          </ToggleMediaButton>
        </div>
      </div>
      <Notify notify={notify} setNotify={setNotify} />
    </>
  );
};

export default MediaSetup;

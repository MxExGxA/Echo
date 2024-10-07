import { useEffect, useRef, useState } from "react";
import { MdCallEnd } from "react-icons/md";
import { CiMicrophoneOn, CiMicrophoneOff } from "react-icons/ci";
import { CiVideoOn, CiVideoOff } from "react-icons/ci";
import { LuScreenShare, LuScreenShareOff } from "react-icons/lu";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getLocalDisplay } from "@/utils/streamFunctions";
import { EchoUtils } from "@/utils/Utiliteis";

const CallControls = ({
  echoUtils,
  stream,
  peers,
  micPermission,
  cameraPermission,
}: {
  echoUtils: EchoUtils;
  stream: MediaStream | null;
  peers: { [key: string]: RTCPeerConnection };
  micPermission: boolean;
  cameraPermission: boolean;
}) => {
  const [toggleAudio, setToggleAudio] = useState<boolean>(false);
  const [toggleVideo, setToggleVideo] = useState<boolean>(false);
  const [toggleShareScreen, setToggleShareScreen] = useState<boolean>(false);
  const screenStreamRef = useRef<MediaStream>();
  const screenShareTrack = useRef<MediaStreamTrack | null>(null);
  const navigate = useNavigate();
  const [queries] = useSearchParams();

  const cameraQuery = queries.get("camera") === "true" ? true : false;
  const micQuery = queries.get("mic") === "true" ? true : false;

  const handleShareScreen = (): void => {
    //if share screen is off, turn it on
    if (!toggleShareScreen) {
      if (stream) {
        try {
          //get user screen display stream
          getLocalDisplay().then((screenStream) => {
            screenStreamRef.current = screenStream;

            //get screen display video track and add it to our main stream
            const vt = screenStream.getVideoTracks()[0];
            stream.addTrack(vt as MediaStreamTrack);
            screenShareTrack.current = vt;

            //emit share screen event to socket server
            echoUtils.echoSocket.emit("screenShare", {
              echoID: echoUtils.echoID,
              memberID: echoUtils.echoSocket.id,
            });
            setToggleShareScreen(true);

            //on screen display video track is stopped or ended, remove it from the main stream
            screenStreamRef.current!.getVideoTracks()[0].onended = () => {
              stream?.removeTrack(screenStreamRef.current!.getVideoTracks()[0]);
              echoUtils.echoSocket.emit("stopScreenShare", {
                echoID: echoUtils.echoID,
                memberID: echoUtils.echoSocket.id,
              });
              setToggleShareScreen(false);
            };
          });
        } catch (err) {
          setToggleShareScreen(false);
          console.error(err);
        }
      }
      //if share screen is on, turn it off
    } else {
      const track =
        screenStreamRef.current?.getVideoTracks()[0] as MediaStreamTrack;

      //remove share screen video track from main stream and stop it
      echoUtils.echoSocket.emit("stopScreenShare", {
        echoID: echoUtils.echoID,
        memberID: echoUtils.echoSocket.id,
      });
      stream?.removeTrack(track);
      track?.stop();
      setToggleShareScreen(false);
    }
  };

  //handling mute/unmute microphone
  const handleToggleAudio = () => {
    if (micPermission) {
      setToggleAudio(!toggleAudio);
    }
  };

  //handling end the call
  const handleEndCall = (): void => {
    echoUtils.leaveEcho();
    navigate("/");
  };

  //handling enable/disable camera video
  const handleToggleVideo = (): void => {
    if (cameraPermission) {
      setToggleVideo(!toggleVideo);
    }
  };

  //emitting media event to server when new track added or removed
  const emitMedia = (
    mediaType: string,
    mediaVal: boolean,
    trackID?: string
  ): void => {
    echoUtils.echoSocket.emit("media", {
      echoID: echoUtils.echoID,
      memberID: echoUtils.echoSocket.id,
      mediaType,
      mediaVal,
      trackID,
    });
  };

  useEffect(() => {
    if (stream) {
      const audio = stream.getAudioTracks()[0];

      if (audio) {
        audio!.enabled = toggleAudio;
        audio.dispatchEvent(new Event(toggleAudio ? "unmute" : "mute"));

        const audioTrackId = audio.id;
        toggleAudio
          ? emitMedia("mic", true, audioTrackId)
          : emitMedia("mic", false);
      }
    }
  }, [toggleAudio, stream]);

  useEffect(() => {
    if (stream) {
      const video = stream
        .getVideoTracks()
        .find(
          (track) => !track.getCapabilities().displaySurface
        ) as MediaStreamTrack;

      if (video) {
        video!.enabled = toggleVideo;
        video.dispatchEvent(new Event(toggleVideo ? "unmute" : "mute"));

        const videoTrackId = video.id;

        toggleVideo
          ? emitMedia("camera", true, videoTrackId)
          : emitMedia("camera", false);
      }
    }
  }, [toggleVideo, stream]);

  useEffect(() => {
    if (screenShareTrack.current) {
      const screenTrackId = screenShareTrack.current?.id;
      toggleShareScreen
        ? emitMedia("screen", true, screenTrackId)
        : emitMedia("screen", false);
    }
  }, [toggleShareScreen, screenShareTrack]);

  useEffect(() => {
    cameraPermission && cameraQuery
      ? setToggleVideo(true)
      : setToggleVideo(false);
    micPermission && micQuery ? setToggleAudio(true) : setToggleAudio(false);
  }, [cameraPermission, micPermission]);

  useEffect(() => {
    if (toggleShareScreen) {
      Object.keys(peers).forEach((peer) => {
        if (screenShareTrack.current) {
          try {
            console.log(peers[peer].getTransceivers());
            peers[peer].addTransceiver(screenShareTrack.current, {
              direction: "sendonly",
              streams: [screenStreamRef.current as MediaStream],
            });
          } catch (err) {
            console.log(err);
          }
        }
      });
    } else {
      Object.keys(peers).forEach((peer) => {
        if (screenShareTrack.current) {
          try {
            console.log(peers[peer].getTransceivers());
            const screenShareSender = peers[peer]
              .getSenders()
              .find((sender) => sender.track === screenShareTrack.current);

            if (screenShareSender) peers[peer].removeTrack(screenShareSender);

            peers[peer].getTransceivers().forEach((t) => {
              if (t.currentDirection === "inactive") {
                t.stop();
              }
            });
          } catch (err) {
            console.log(err);
          }
        }
      });
    }
  }, [toggleShareScreen]);

  useEffect(() => {
    return () => stream?.getTracks().forEach((t) => t.stop());
  }, []);

  const CallControlsStyle = `absolute bottom-2 left-1/2 z-20 -translate-x-1/2 flex justify-center items-center text-xl text-white rounded-full py-2 bg-white shadow-md
    *:h-10 *:w-10 *:flex *:justify-center *:items-center *:rounded-full *:mx-2 *:cursor-pointer hover:*:scale-105 active:*:scale-100 *:transition-all *:duration-300`;

  return (
    <div className={CallControlsStyle}>
      <div
        onClick={handleShareScreen}
        className={`${
          toggleShareScreen ? "bg-main-red" : "bg-main-blue"
        } max-md:hidden`}
        title={`${
          toggleShareScreen
            ? "turn off screen sharing"
            : "turn on screen sharing"
        }`}
      >
        {toggleShareScreen ? <LuScreenShareOff /> : <LuScreenShare />}
      </div>
      <div
        onClick={handleToggleAudio}
        className={`${toggleAudio ? "bg-main-blue" : "bg-main-red"} ${
          !micPermission &&
          "bg-main-yellow text-gray-700 border border-gray-700"
        }`}
        title={`${
          micPermission
            ? toggleAudio
              ? "turn microphone off"
              : "turn microphone on"
            : "microphone permission is not granted!"
        }`}
      >
        {toggleAudio ? <CiMicrophoneOn /> : <CiMicrophoneOff />}
      </div>

      <div onClick={handleEndCall} title="end the call" className="bg-main-red">
        <MdCallEnd />
      </div>

      <div
        onClick={handleToggleVideo}
        className={`${toggleVideo ? "bg-main-blue" : "bg-main-red"} ${
          !cameraPermission &&
          "bg-main-yellow text-gray-700 border border-gray-700"
        }`}
        title={`${
          cameraPermission
            ? toggleVideo
              ? "turn camera off"
              : "turn camera on"
            : "camera permission is not granted!"
        }`}
      >
        {toggleVideo ? <CiVideoOn /> : <CiVideoOff />}
      </div>
    </div>
  );
};

export default CallControls;

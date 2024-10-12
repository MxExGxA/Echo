import { useEffect, useRef, useState } from "react";
import { getLocalAudio, getLocalVideo } from "@/utils/streamFunctions";
import { pcConfig } from "@/utils/constrains";
import { clearMembers } from "@/redux/membersSlice";
import { clearMessages } from "@/redux/messagesSlice";
import { useDispatch } from "react-redux";
import { Draggable } from "gsap/Draggable";
import { EchoUtils } from "@/utils/Utiliteis";
import CallControls from "./CallControls";
import LocalStream from "./LocalStream";
import RemoteStream from "./RemoteStream";
import gsap from "gsap";
import sdpTransform from "sdp-transform";

const Call = ({
  editorToggled,
  echoUtils,
}: {
  editorToggled: boolean;
  echoUtils: EchoUtils;
}) => {
  gsap.registerPlugin(Draggable);

  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const localStreamRef = useRef<MediaStream>();
  const peers = useRef<{ [key: string]: RTCPeerConnection }>({});
  const [connectionPeers, setConnectionPeers] = useState<{
    [key: string]: RTCPeerConnection;
  }>({});
  const [micPermission, setMicPermission] = useState<boolean>(false);
  const [cameraPermission, setCameraPermission] = useState<boolean>(false);
  const listenerMap = useRef(new Map());

  const [connectionState, setConnectionState] = useState<string>();

  // const [negotaitionState, setNegotiationState] = useState<{
  //   inProgress: boolean;
  //   shouldNegotiate: boolean;
  //   canNegotiate: boolean;
  // }>({ inProgress: false, shouldNegotiate: false, canNegotiate: true });

  const dispatch = useDispatch();
  const adjustLayout = (count: number): string => {
    if (count === 1) return "50%";
    if (count === 3 || count === 4) return "49%";

    if (editorToggled) {
      if (count === 2) {
        return "50%";
      }
    } else {
      if (count === 2) {
        return "49%";
      }
    }
    return "";
  };

  //on peer negotiation needed event
  const handleNegotiation = async (peer: string) => {
    const pc = peers.current[peer];
    console.log("negotiation for :", peer, "has triggered");

    if (pc) {
      try {
        const offer = await pc.createOffer();
        console.log(
          "created offer sdp:",
          sdpTransform.parse(offer.sdp as string)
        );
        await pc.setLocalDescription(new RTCSessionDescription(offer));
        echoUtils.echoSocket.emit("signal", {
          to: peer,
          from: echoUtils.echoSocket.id,
          type: offer.type,
          sdp: offer.sdp,
        });
      } catch (err) {
        console.error("error while negotation!", err);
      }
    }
  };

  // const addLocalTracksToPeer = (peer: string, stream: MediaStream) => {
  //   return new Promise((resolve) => {
  //     const audioTrack = stream?.getAudioTracks()[0];
  //     const videoTrack = stream?.getVideoTracks()[0];

  //     const audioTransceiver = peers.current[peer]!.getTransceivers().find(
  //       (t) => t.sender.track && t.sender.track.kind === "audio"
  //     );
  //     // if it has no  audio track, add our localstream audio track to it
  //     if (!audioTransceiver) {
  //       try {
  //         if (audioTrack) {
  //           console.log("adding audio track !!!");

  //           peers.current[peer].addTransceiver(audioTrack, {
  //             direction: "sendrecv",
  //           });
  //         }
  //       } catch (err) {
  //         throw new Error(
  //           `Error: couldn't add audio track to peer ${peers.current[peer]}`
  //         );
  //       }
  //     }

  //     const videoTransceiver = peers.current[peer]!.getTransceivers().find(
  //       (t) => t.sender.track && t.sender.track.kind === "video"
  //     );

  //     //if it has no  video track, add our localstream video track to it
  //     if (!videoTransceiver) {
  //       try {
  //         if (videoTrack) {
  //           console.log("adding video track !!!");
  //           peers.current[peer].addTransceiver(videoTrack, {
  //             direction: "sendrecv",
  //           });
  //         }
  //       } catch (err) {
  //         throw new Error(
  //           `Error: couldn't add video track to peer ${peers.current[peer]}`
  //         );
  //       }
  //     }

  //     resolve([audioTransceiver, videoTransceiver]);
  //   });
  // };

  // function canRenegotiate(peerConnection: RTCPeerConnection) {
  //   // Check if signaling state is stable
  //   const isSignalingStateGood = peerConnection.signalingState === "stable";

  //   // Check if ICE gathering is complete
  //   const isIceGatheringComplete =
  //     peerConnection.iceGatheringState === "complete";

  //   // Check if both local and remote descriptions are set
  //   const hasDescriptions =
  //     peerConnection.localDescription && peerConnection.remoteDescription;

  //   // Check if ICE connection is either connected or completed
  //   const isIceConnectionGood =
  //     peerConnection.iceConnectionState === "connected" ||
  //     peerConnection.iceConnectionState === "completed";

  //   console.log(isIceConnectionGood);

  //   return (
  //     isSignalingStateGood &&
  //     isIceGatheringComplete &&
  //     hasDescriptions &&
  //     isIceConnectionGood
  //   );
  // }

  useEffect(() => {
    //get local stream
    Promise.allSettled([getLocalAudio(), getLocalVideo()]).then((results) => {
      const localMediaStream = new MediaStream();
      const audioTrack = results[0];
      const videoTrack = results[1];

      if (audioTrack.status === "fulfilled") {
        localMediaStream.addTrack(audioTrack.value);
        setMicPermission(true);
      } else {
        console.log("no mic permissions");
      }

      if (videoTrack.status === "fulfilled") {
        localMediaStream.addTrack(videoTrack.value);
        setCameraPermission(true);
      } else {
        console.log("no camera permissions");
      }

      setLocalStream(localMediaStream);
      localStreamRef.current = localMediaStream;

      console.log("1- got the localstream", localStreamRef.current.getTracks());
    });

    //webrtc call process
    echoUtils.echoSocket.on("memberJoined", async (opts) => {
      const pc = new RTCPeerConnection(pcConfig);

      setTimeout(() => {
        handleNegotiation(opts.member.id);
      }, 5000);

      peers.current[opts.member.id] = pc;
      setConnectionPeers((prev) => ({ ...prev, [opts.member.id]: pc }));

      // await addLocalTracksToPeer(opts.member.id, localStreamRef.current);
      pc.onconnectionstatechange = () => {
        setConnectionState(pc.connectionState);
      };

      //initiate call
      const offer = await pc.createOffer();
      try {
        await pc.setLocalDescription(new RTCSessionDescription(offer));
      } catch (err) {
        console.error(err);
      }
      echoUtils.echoSocket.emit("signal", {
        to: opts.member.id,
        from: echoUtils.echoSocket.id,
        type: offer.type,
        sdp: offer.sdp,
      });

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          console.log(event.candidate);

          echoUtils.echoSocket.emit("signal", {
            to: opts.member.id,
            from: echoUtils.echoSocket.id,
            type: "candidate",
            candidate: event.candidate,
          });
        }
      };

      console.log("calling:", opts.member.id);
    });

    //handle signals
    echoUtils.echoSocket.on("signal", async (opts) => {
      let pc = peers.current[opts.from] || new RTCPeerConnection(pcConfig);

      peers.current[opts.from] = pc;
      setConnectionPeers((prev) => ({ ...prev, [opts.from]: pc }));

      // await addLocalTracksToPeer(opts.from, localStreamRef.current);
      pc.onconnectionstatechange = () => {
        setConnectionState(pc.connectionState);
      };

      if (opts.type === "offer") {
        console.log("signaling state:", pc.signalingState);

        try {
          await pc.setRemoteDescription(
            new RTCSessionDescription({ type: opts.type, sdp: opts.sdp })
          );
        } catch (err) {
          console.error(err);
        }

        const answer = await pc.createAnswer();
        try {
          await pc.setLocalDescription(new RTCSessionDescription(answer));
        } catch (err) {
          console.error(err);
        }

        echoUtils.echoSocket.emit("signal", {
          to: opts.from,
          from: echoUtils.echoSocket.id,
          type: answer.type,
          sdp: answer.sdp,
        });
        console.log("received call from:", opts.from);
      }

      if (opts.type === "answer") {
        try {
          console.log(
            "remote answer sdp:",
            sdpTransform.parse(opts.sdp as string)
          );
          await pc.setRemoteDescription(
            new RTCSessionDescription({ type: opts.type, sdp: opts.sdp })
          );
        } catch (err) {
          console.error(err);
        }
      }

      if (opts.type === "candidate") {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(opts.candidate));
          console.log(opts.candidate);
        } catch (error) {
          console.error("Error adding ICE candidate:", error);
        }
      }
    });

    echoUtils.echoSocket.on("memberLeft", (opts) => {
      const memberPeer = peers.current[opts.id];
      if (memberPeer) {
        memberPeer.close();

        delete peers.current[opts.id];
        setConnectionPeers((prev) => {
          const { [opts.id]: _, ...newPeers } = prev;
          return newPeers;
        });
      }
    });

    return () => {
      //closing peers connections, turnoff socket events, cleaning states
      console.log("cleaning");

      Object.keys(connectionPeers).forEach((peer) => {
        const pc = connectionPeers[peer];
        if (pc) {
          // Remove negotiationneeded event listener if it exists
          const negotiationListener = listenerMap.current.get(peer);
          if (negotiationListener) {
            pc.removeEventListener("negotiationneeded", negotiationListener);
            listenerMap.current.delete(peer);
          }

          pc.close();
        }
      });

      peers.current = {};
      setConnectionPeers({});
      listenerMap.current.clear();

      echoUtils.echoSocket.off("memberJoined");
      echoUtils.echoSocket.off("signal");
      echoUtils.echoSocket.off("memberLeft");
      echoUtils.echoSocket.disconnect();

      dispatch(clearMembers());
      dispatch(clearMessages());

      localStreamRef.current?.getTracks().forEach((t) => {
        t.stop();
      });
    };
  }, []);

  useEffect(() => {
    Object.keys(connectionPeers).forEach((peer) => {
      if (!listenerMap.current.has(peer)) {
        //create a listener function
        const negotiationListener = () => {
          // handleNegotiation(peer);
        };

        //store the listener function inside map to remove it later
        listenerMap.current.set(peer, negotiationListener);

        //listen for negotiationneeded event
        connectionPeers[peer].addEventListener(
          "negotiationneeded",
          negotiationListener
        );
      }
    });

    return () =>
      Object.keys(connectionPeers).forEach((peer) => {
        //get the listener function which stored in the map
        const negotiationListener = listenerMap.current.get(peer);

        if (negotiationListener) {
          //remove the event listener for this function
          connectionPeers[peer].removeEventListener(
            "negotiationneeded",
            negotiationListener
          );

          //delete the function from the map
          listenerMap.current.delete(peer);
        }
      });
  }, [connectionPeers]);

  useEffect(() => {
    console.log(connectionState);
  }, [connectionState]);

  return (
    <div
      style={{
        gridColumnStart: editorToggled ? 7 : 1,
        gridColumnEnd: 13,
        gridRowStart: 1,
        gridRowEnd: 13,
      }}
      className="relative max-h-full max-md:!col-start-1"
    >
      <div
        className="video-grid"
        style={{
          gridTemplateColumns: `repeat(auto-fill, minmax(${adjustLayout(
            Object.keys(connectionPeers).length + 1
          )}, 1fr))`,
        }}
      >
        <LocalStream
          echoUtils={echoUtils}
          stream={localStreamRef.current as MediaStream}
          peers={connectionPeers}
        />
        {Object.keys(connectionPeers).map((p, index) => (
          <RemoteStream
            key={index}
            echoUtils={echoUtils}
            peer={connectionPeers[p]}
            id={p}
            className={`${
              index === 1 && Object.keys(connectionPeers).length === 2
                ? "third-grid-item"
                : ""
            }`}
          />
        ))}
      </div>
      <CallControls
        echoUtils={echoUtils}
        stream={localStream as MediaStream}
        peers={peers.current}
        micPermission={micPermission}
        cameraPermission={cameraPermission}
      />
    </div>
  );
};
export default Call;

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

const Call = ({
  editorToggled,
  echoUtils,
}: {
  editorToggled: boolean;
  echoUtils: EchoUtils;
}) => {
  gsap.registerPlugin(Draggable);

  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const peers = useRef<{ [key: string]: RTCPeerConnection }>({});
  const [connectionPeers, setConnectionPeers] = useState<{
    [key: string]: RTCPeerConnection;
  }>({});
  const [micPermission, setMicPermission] = useState<boolean>(false);
  const [cameraPermission, setCameraPermission] = useState<boolean>(false);

  const listenerMap = useRef(new Map());

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
  const handleNegotiation = async (e: Event, peer: string) => {
    console.log("negotiation needed!", e.currentTarget);
    const pc = e.currentTarget as RTCPeerConnection;
    if (pc) {
      try {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(new RTCSessionDescription(offer));
        echoUtils.echoSocket.emit("signal", {
          to: peer,
          from: echoUtils.echoSocket.id,
          type: offer.type,
          sdp: offer.sdp,
        });
      } catch (err) {
        console.log("error while negotation!", err);
      }
    }
  };

  // const renegotiate = async (peer: string) => {
  //   const pc = peers.current[peer];
  //   if (pc) {
  //     const offer = await pc.createOffer();
  //     await pc.setLocalDescription(new RTCSessionDescription(offer));
  //     echoUtils.echoSocket.emit("signal", {
  //       to: peer,
  //       from: echoUtils.echoSocket.id,
  //       type: offer.type,
  //       sdp: offer.sdp,
  //     });
  //   } else {
  //     console.log("peer is not found");
  //   }
  // };

  useEffect(() => {
    //get local stream
    Promise.allSettled([getLocalVideo(), getLocalAudio()]).then((results) => {
      const localMediaStream = new MediaStream();
      const videoTrack = results[0];
      const audioTrack = results[1];

      if (videoTrack.status === "fulfilled") {
        localMediaStream.addTrack(videoTrack.value);
        setCameraPermission(true);
      } else {
        console.log("no camera permissions");
      }

      if (audioTrack.status === "fulfilled") {
        localMediaStream.addTrack(audioTrack.value);
        setMicPermission(true);
      } else {
        console.log("no mic permissions");
      }

      setLocalStream(localMediaStream);
    });

    //webrtc call process
    echoUtils.echoSocket.on("memberJoined", async (opts) => {
      const pc = new RTCPeerConnection(pcConfig);

      peers.current[opts.member.id] = pc;
      setConnectionPeers((prev) => ({ ...prev, [opts.member.id]: pc }));

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

      if (opts.type === "offer") {
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
      //close all peer connections
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
    };
  }, []);

  useEffect(() => {
    Object.keys(connectionPeers).forEach((peer) => {
      if (!listenerMap.current.has(peer)) {
        //create a listener function
        const negotiationListener = (e: Event) => {
          handleNegotiation(e, peer);
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
    return () => {
      console.log("Closing stream in call component");

      localStream?.getTracks().forEach((t) => {
        t.stop();
      });
    };
  }, [localStream]);

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
          stream={localStream as MediaStream}
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

import { useEffect, useRef, useState } from "react";
import { getLocalAudio, getLocalVideo } from "@/utils/streamFunctions";
import { Draggable } from "gsap/Draggable";
import { EchoUtils } from "@/utils/Utiliteis";
import CallControls from "./CallControls";
import LocalStream from "./LocalStream";
import RemoteStream from "./RemoteStream";
import gsap from "gsap";
import { Device, types } from "mediasoup-client";
import { useSelector } from "react-redux";
import { stateType } from "@/redux/store";

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
  const [micPermission, setMicPermission] = useState<boolean>(false);
  const [cameraPermission, setCameraPermission] = useState<boolean>(false);
  const deviceRef = useRef<types.Device>();
  const [deviceState, setDeviceState] = useState<types.Device>();
  const producerTransport = useRef<types.Transport>();
  const consumerTransport = useRef<types.Transport>();
  const [consumerTransportState, setConsumerTransportState] =
    useState<types.Transport>();
  const producers = useRef<types.Producer[]>();
  // const consumers = useRef<types.Consumer[]>();
  const members = useSelector((state: stateType) => state.members.members);

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

  useEffect(() => {
    //get localstream
    (async () => {
      await Promise.allSettled([getLocalAudio(), getLocalVideo()]).then(
        (results) => {
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
        }
      );

      // get router rtp capabilities from server
      echoUtils.echoSocket.emit(
        "getRouterRtpCapabilities",
        async (rtpCapabilities: types.RtpCapabilities) => {
          //create a new device
          deviceRef.current = new Device();
          //load the device with rtp capabilities
          await deviceRef.current.load({
            routerRtpCapabilities: rtpCapabilities,
          });

          setDeviceState(deviceRef.current);
          //create producer transport
          echoUtils.echoSocket.emit(
            "createProducerTransport",
            async (transportOptions: types.TransportOptions) => {
              producerTransport.current =
                deviceRef.current!.createSendTransport(transportOptions);

              //connect the producer transport
              producerTransport.current.on(
                "connect",
                ({ dtlsParameters }, callback) => {
                  // Send the DTLS parameters to the server
                  echoUtils.echoSocket.emit(
                    "connectProducerTransport",
                    {
                      dtlsParameters,
                    },
                    (response: any) => {
                      console.log("producer transport connection:", response);
                    }
                  );
                  // Call the callback when DTLS connection is established
                  callback();
                }
              );

              producerTransport.current.on("produce", (opts, callback) => {
                console.log("producer transport started producing :)");

                echoUtils.echoSocket.emit(
                  "produce",
                  {
                    kind: opts.kind,
                    rtpParameters: opts.rtpParameters,
                  },
                  (producerId: string) => {
                    callback({ id: producerId });
                  }
                );
              });

              const streamTracks = localStreamRef.current?.getTracks();

              if (streamTracks) {
                streamTracks.forEach(async (track) => {
                  if (track && producerTransport.current) {
                    console.log("there is", track.kind);
                    console.log(
                      "producer transport",
                      producerTransport.current
                    );

                    try {
                      const producer = await producerTransport.current?.produce(
                        {
                          track: track as MediaStreamTrack,
                        }
                      );
                      console.log("Producer =========>", producer);

                      producers.current?.push(producer);
                    } catch (err) {
                      console.log("there was an error ");
                    }
                  }
                });
              }
            }
          );

          echoUtils.echoSocket.emit(
            "createConsumerTransport",
            async (transportOptions: types.TransportOptions) => {
              consumerTransport.current =
                deviceRef.current!.createRecvTransport(transportOptions);
              setConsumerTransportState(consumerTransport.current);

              consumerTransport.current.on(
                "connect",
                ({ dtlsParameters }, callback) => {
                  // Send the DTLS parameters to the server
                  console.log("connecting consmer transport");
                  echoUtils.echoSocket.emit(
                    "connectConsumerTransport",
                    {
                      dtlsParameters,
                    },
                    (response: any) => {
                      console.log("consumer transport connection:", response);
                    }
                  );

                  // Call the callback when DTLS connection is established
                  callback();
                  console.log("consumer connected");
                }
              );
            }
          );
        }
      );
      echoUtils.echoSocket.on("memberJoined", async (opts) => {
        console.log(opts);
      });

      // echoUtils.echoSocket.on("memberLeft", (opts) => {});
    })();
  }, []);

  useEffect(() => {
    return () => {
      localStream?.getTracks().forEach((track) => track.stop());
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
            Object.keys("").length + 1
          )}, 1fr))`,
        }}
      >
        <LocalStream stream={localStream} echoUtils={echoUtils} />
        {members.map(
          (member) =>
            member.id !== echoUtils.echoSocket.id && (
              <RemoteStream
                key={member.id}
                echoUtils={echoUtils}
                id={member.id}
                // peer={peers[member.id]}
                consumerTransport={consumerTransportState as types.Transport}
                device={deviceState as types.Device}
                className=""
              />
            )
        )}
      </div>

      <CallControls
        echoUtils={echoUtils}
        stream={localStream as MediaStream}
        micPermission={micPermission}
        cameraPermission={cameraPermission}
      />
    </div>
  );
};
export default Call;

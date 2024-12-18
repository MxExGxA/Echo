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
import {
  createConsumerTransport,
  createProducerTransport,
  produceMedia,
} from "@/utils/mediasoup/helpers";
import { Debug } from "@/components/Debug";

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
  const [device, setDevice] = useState<types.Device>();
  const [producerTransport, setProducerTransport] = useState<types.Transport>();
  const [consumerTransport, setConsumerTransport] = useState<types.Transport>();
  const producers = useRef<types.Producer[]>();
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
    (async () => {
      //create a new device
      const device = new Device();

      //get localstream
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
          //load the device with rtp capabilities
          try {
            await device.load({
              routerRtpCapabilities: rtpCapabilities,
            });

            setDevice(device);
          } catch (err) {
            console.error("Failed to load the Device", err);
          }
        }
      );

      // echoUtils.echoSocket.on("memberJoined", async (opts) => {
      //   console.log(opts);
      // });

      // echoUtils.echoSocket.on("memberLeft", (opts) => {});
    })();
    return () => {
      producers.current?.forEach((p) => p.close());
    };
  }, []);

  useEffect(() => {
    if (device) {
      //create producer transport
      echoUtils.echoSocket.emit(
        "createProducerTransport",
        async (transportOptions: types.TransportOptions) => {
          const prodTransport = await createProducerTransport(
            device,
            transportOptions
          );
          setProducerTransport(prodTransport);
        }
      );

      //create consumer transport
      echoUtils.echoSocket.emit(
        "createConsumerTransport",
        async (transportOptions: types.TransportOptions) => {
          const consTransport = await createConsumerTransport(
            device,
            transportOptions
          );
          setConsumerTransport(consTransport);
        }
      );
    }
  }, [device]);

  useEffect(() => {
    if (producerTransport && localStream) {
      //connect the producer transport
      producerTransport.on("connect", ({ dtlsParameters }, callback) => {
        // Send the DTLS parameters to the server
        echoUtils.echoSocket.emit(
          "connectProducerTransport",
          {
            dtlsParameters,
          },
          (response: any) => {
            if (response.status === "success") {
              // Call the callback when DTLS connection is established
              callback();
            }
          }
        );
      });

      producerTransport.on("produce", (opts, callback) => {
        echoUtils.echoSocket.emit(
          "produce",
          {
            kind: opts.kind,
            appData: opts.appData,
            rtpParameters: opts.rtpParameters,
          },
          (producerId: string) => {
            callback({ id: producerId });
          }
        );
      });

      const audioTrack = localStream.getAudioTracks()[0];
      const videoTrack = localStream.getVideoTracks()[0];

      if (audioTrack) {
        (async () => {
          const producer = await produceMedia(producerTransport, audioTrack);
          producers.current?.push(producer as types.Producer);
        })();
      }

      if (videoTrack) {
        (async () => {
          const producer = await produceMedia(producerTransport, videoTrack);
          producers.current?.push(producer as types.Producer);
        })();
      }
    }

    return () => {
      producers.current?.forEach((producer) => producer.close());
      producerTransport?.removeAllListeners();
      producerTransport?.close();
    };
  }, [producerTransport, localStream]);

  useEffect(() => {
    const handleRestartIce = async (stat: string) => {
      if (stat === "failed" || stat === "disconnected") {
        await new Promise((resolve) => setTimeout(resolve, 2000)); // Delay for 2 seconds
        console.log("restarting Producer ice");
        echoUtils.echoSocket.emit(
          "restartIce",
          { type: "producer" },
          async (response: any) => {
            if (response.iceParams) {
              await producerTransport?.restartIce({
                iceParameters: response.iceParams,
              });
            } else {
              console.log("no ice params received");
            }
          }
        );
      }
    };
    if (producerTransport) {
      producerTransport.on("connectionstatechange", handleRestartIce);
    }

    return () => {
      producerTransport?.off("connectionstatechange", handleRestartIce);
    };
  }, [producerTransport]);

  useEffect(() => {
    if (consumerTransport) {
      consumerTransport.on("connect", ({ dtlsParameters }, callback) => {
        // Send the DTLS parameters to the server
        echoUtils.echoSocket.emit(
          "connectConsumerTransport",
          {
            dtlsParameters,
          },
          (response: any) => {
            if (response.status === "success") {
              // Call the callback when DTLS connection is established
              callback();
            }
          }
        );
      });
      consumerTransport.on("connectionstatechange", async (stat) => {
        if (stat === "failed" || stat === "disconnected") {
          console.log("restarting Consumer ice..");
          echoUtils.echoSocket.emit(
            "restartIce",
            { type: "consumer" },
            async (response: any) => {
              await consumerTransport.restartIce({
                iceParameters: response.iceParams,
              });
            }
          );
        }
      });
    }

    return () => {
      consumerTransport?.removeAllListeners();
      consumerTransport?.close();
    };
  }, [consumerTransport]);

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
      <Debug />
      <div
        className="video-grid"
        style={{
          gridTemplateColumns: `repeat(auto-fill, minmax(${adjustLayout(
            Object.keys("").length + 1
          )}, 1fr))`,
        }}
      >
        <LocalStream
          stream={localStream}
          echoUtils={echoUtils}
          producerTransport={producerTransport as types.Transport}
        />
        {members.map(
          (member, index) =>
            member.id !== echoUtils.echoSocket.id && (
              <RemoteStream
                key={member.id}
                echoUtils={echoUtils}
                id={member.id}
                consumerTransport={consumerTransport as types.Transport}
                device={device as types.Device}
                className={`${
                  index === 2 && members.length === 3 ? "third-grid-item" : ""
                }`}
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

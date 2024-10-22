import { Socket } from "socket.io-client";
import { types as mediaSoupTypes } from "mediasoup-client";

export const consumeMedia = (
  socket: Socket,
  device: mediaSoupTypes.Device,
  consumerTranport: mediaSoupTypes.Transport,
  consumerOpts: {
    producerId: string;
    kind: "audio" | "video";
    rtpParameters: mediaSoupTypes.RtpParameters;
  }
) => {
  return new Promise((resolve, reject) => {
    socket.emit(
      "consume",
      {
        rtpCapabilities: device.rtpCapabilities,
        producerId: consumerOpts.producerId,
      },
      async ({ id }: { id: string }) => {
        try {
          console.log(id);

          console.log(device.rtpCapabilities);
          console.log(consumerOpts.rtpParameters);
          const consumer = await consumerTranport?.consume({
            id,
            ...consumerOpts,
          });

          resolve(consumer);
        } catch (err) {
          reject(err);
        }
      }
    );
  });
};

import { Socket } from "socket.io-client";
import { types } from "mediasoup-client";

export const produceMedia = async (
  transport: types.Transport,
  track: MediaStreamTrack,
  trackType?: string
) => {
  try {
    const producer = await transport.produce({
      track: track as MediaStreamTrack,
      appData: { trackType },
    });
    return producer;
  } catch (err) {
    console.log(err);
  }
};

export const consumeMedia = (
  socket: Socket,
  device: types.Device,
  consumerTransport: types.Transport,
  producerId: string
): Promise<types.Consumer> => {
  return new Promise((resolve, reject) => {
    socket.emit(
      "consume",
      {
        rtpCapabilities: device.rtpCapabilities,
        producerId,
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
          throw new Error(error);
        }
        try {
          const consumer = await consumerTransport?.consume({
            id: consumerId,
            producerId: producerId,
            kind,
            rtpParameters,
          });
          resolve(consumer);
        } catch (err) {
          reject(err);
        }
      }
    );
  });
};

export const createProducerTransport = (
  device: types.Device,
  transportOpts: types.TransportOptions
): Promise<types.Transport> => {
  return new Promise((resolve, reject) => {
    try {
      const transport = device.createSendTransport(transportOpts);
      resolve(transport);
    } catch (err) {
      reject(err);
    }
  });
};

export const createConsumerTransport = (
  device: types.Device,
  transportOpts: types.TransportOptions
): Promise<types.Transport> => {
  return new Promise((resolve, reject) => {
    try {
      const transport = device.createRecvTransport(transportOpts);
      resolve(transport);
    } catch (err) {
      reject(err);
    }
  });
};

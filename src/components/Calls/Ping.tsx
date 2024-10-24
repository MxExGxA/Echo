import { Icon } from "@iconify/react/dist/iconify.js";
import { useEffect, useState } from "react";
import { types } from "mediasoup-client";

export const Ping = ({
  className,
  transport,
}: {
  className: string;
  transport: types.Transport;
}) => {
  const [ping, setPing] = useState<number | null>(null);
  const [signal, setSignal] = useState<number>(0);
  const [intervals, setIntervals] = useState<number[]>([]);
  const getCallMs = async (transport: types.Transport) => {
    let ping: number = 0;
    //@ts-ignore
    const peerConnection = transport?._handler?._pc;
    if (peerConnection) {
      const stats = await peerConnection.getStats();

      stats.forEach((stat: any) => {
        if (stat.type === "candidate-pair") {
          if (typeof stat.currentRoundTripTime === "number") {
            ping = stat.currentRoundTripTime * 1000;
          }
        }
      });
    }
    return ping;
  };

  useEffect(() => {
    if (transport) {
      //set ping interval
      const i = setInterval(async () => {
        const ping = await getCallMs(transport);
        console.log(ping + "ms");
        setPing(ping);
      }, 2000);

      setIntervals((prev) => [...prev, i]);
    }
  }, [transport]);

  useEffect(() => {
    //clear ping intervals
    return () => {
      intervals.forEach((interval) => {
        clearInterval(interval);
      });
    };
  }, [transport, intervals]);

  useEffect(() => {
    if (ping !== null) {
      if (ping < 100) {
        setSignal(3);
      } else if (ping < 150) {
        setSignal(2);
      } else if (ping < 200) {
        setSignal(1);
      } else {
        setSignal(0);
      }
    } else {
      setSignal(0);
    }
  }, [ping]);

  return (
    <div className={className}>
      {signal === 0 ? (
        <Icon
          icon="pixelarticons:cellular-signal-0"
          className="text-red-800 text-2xl"
        ></Icon>
      ) : signal === 1 ? (
        <Icon
          icon="pixelarticons:cellular-signal-1"
          className="text-orange-600 text-2xl"
        ></Icon>
      ) : signal === 2 ? (
        <Icon
          icon="pixelarticons:cellular-signal-2"
          className="text-yellow-500 text-2xl"
        ></Icon>
      ) : (
        <Icon
          icon="pixelarticons:cellular-signal-3"
          className="text-green-500 text-2xl"
        ></Icon>
      )}
    </div>
  );
};

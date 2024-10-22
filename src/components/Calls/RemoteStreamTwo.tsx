import { useEffect, useRef } from "react";

export const RemoteStreamTwo = ({
  audio,
  video,
}: {
  audio: MediaStreamTrack;
  video: MediaStreamTrack;
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (audio) {
      const audioStream = new MediaStream();
      audioStream.addTrack(audio);
      audioRef.current!.srcObject = audioStream;
    }

    if (video) {
      const videoStream = new MediaStream();
      videoStream.addTrack(video);
      audioRef.current!.srcObject = videoStream;
    }
  }, [audio, video]);
  return (
    <div className="relative grid-item overflow-hidden">
      <audio ref={audioRef} autoPlay></audio>
      <video ref={videoRef} autoPlay width={500} className="z-50"></video>
    </div>
  );
};

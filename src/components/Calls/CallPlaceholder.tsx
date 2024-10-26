import { Visualizer } from "react-sound-visualizer";

const CallPlaceholder = ({
  memberName,
  audio,
  className,
}: {
  memberName: string;
  audio: MediaStream;
  className?: string;
}) => {
  return (
    <div className={className}>
      <div className="absolute text-3xl font-bold z-10 text-white">
        {memberName}
      </div>
      {audio && (
        <Visualizer audio={audio} strokeColor="#FFFFFF" autoStart>
          {({ canvasRef }) => (
            <canvas ref={canvasRef} className="absolute h-full w-full" />
          )}
        </Visualizer>
      )}
    </div>
  );
};

export default CallPlaceholder;

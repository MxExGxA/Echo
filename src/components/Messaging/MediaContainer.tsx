export const MediaContainer = ({
  isImage,
  isVideo,
  source,
}: {
  isImage: boolean;
  isVideo: boolean;
  source: string;
}) => {
  return (
    <div className="mediaContainer my-2 rounded-md overflow-hidden border border-black w-fit cursor-pointer">
      <a href={source} target="_blank">
        {isImage && <img src={source} />}
      </a>
      {isVideo && <video src={source} controls />}
    </div>
  );
};

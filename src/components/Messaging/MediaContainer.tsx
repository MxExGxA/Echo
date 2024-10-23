export const MediaContainer = ({
  isImage,
  isVideo,
  source,
  alt,
}: {
  isImage: boolean;
  isVideo: boolean;
  source: string;
  alt: string;
}) => {
  return (
    <div className="mediaContainer w-fit cursor-pointer rounded-md -m-[2px] overflow-hidden">
      {isImage && <img src={source} alt={alt} />}
      {isVideo && <video src={source} controls />}
    </div>
  );
};

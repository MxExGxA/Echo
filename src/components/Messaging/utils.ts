import { MessageType } from "@/utils/types";

export const checkMedia = (
  setIsImage: Function,
  setIsVideo: Function,
  message: MessageType
) => {
  const imageExtensions = [
    "jpg",
    "jpeg",
    "png",
    "gif",
    "bmp",
    "webp",
    "svg",
    "tiff",
  ];
  const videoExtensions = [
    "mp4",
    "mov",
    "wmv",
    "avi",
    "flv",
    "mkv",
    "webm",
    "3gp",
    "ogg",
    "m4v",
  ];
  const extention = message.message.split("::")[1].split(".")[1].toLowerCase();
  if (imageExtensions.includes(extention)) {
    setIsImage(true);
  }
  if (videoExtensions.includes(extention)) {
    setIsVideo(true);
  }
};

export const checkLinkProtocol = (link: string) => {
  if (!/^https?:\/\//i.test(link)) {
    return "https://" + link;
  }
  return link;
};

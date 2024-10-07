const getLocalAudio = (): Promise<MediaStreamTrack> => {
  return new Promise((resolve, reject) => {
    window.navigator.mediaDevices
      .getUserMedia({
        audio: true,
      })
      .then((audio) => {
        const audioTrack = audio.getAudioTracks()[0];
        resolve(audioTrack);
      })
      .catch((err) => {
        console.error("Audio permission denied:", err);
        reject(err);
      });
  });
};

const getLocalVideo = (): Promise<MediaStreamTrack> => {
  return new Promise((resolve, reject) => {
    window.navigator.mediaDevices
      .getUserMedia({
        video: {
          facingMode: {
            ideal: "user",
          },
        },
      })
      .then((video) => {
        const videoTrack = video.getVideoTracks()[0];
        resolve(videoTrack);
      })
      .catch((err) => {
        console.error("Video permission denied:", err);
        reject(err);
      });
  });
};

const getLocalDisplay = (): Promise<MediaStream> => {
  try {
    return window.navigator.mediaDevices.getDisplayMedia({
      video: { frameRate: 60 },
    });
  } catch (err) {
    throw new Error();
  }
};

export { getLocalAudio, getLocalVideo, getLocalDisplay };

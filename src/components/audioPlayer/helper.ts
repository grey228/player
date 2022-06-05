export const readAudio = (audioFile: File) => {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = function (e: ProgressEvent<FileReader>) {
      resolve(e?.target?.result);
    };

    reader.readAsArrayBuffer(audioFile);
  });
};

import React, { ReactElement, useCallback, useState, useRef } from 'react';
import PlayerContext from './context';

const PlayerProvider = ({children}: {children: ReactElement | ReactElement[]}) => {
  const [audioFile, setFile] = useState<ArrayBuffer>();
  const audioContext = useRef(new AudioContext()).current;
  const [buffer, setBuffer] = useState<AudioBuffer>();
  const [time, setTime] = useState(0)

  const decodeAudioBuffer = useCallback(async (file: ArrayBuffer) => {
    if (!file) {
      return;
    }

    const audioBuffer = await audioContext.decodeAudioData(file);
    setBuffer(audioBuffer);
  }, [audioContext]);

  const setAudioFile = useCallback((arrayBuffer: ArrayBuffer) => {
    setFile(arrayBuffer);
    decodeAudioBuffer(arrayBuffer);
  }, []);

  const contextValue = {
    audioFile,
    setAudioFile,
    buffer,
    audioContext,
    time,
    setTime,
  };

  return (
    <PlayerContext.Provider value={contextValue}>
      {children}
    </PlayerContext.Provider>
  );
};

export default PlayerProvider;

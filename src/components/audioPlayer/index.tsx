import React from 'react';
import PlayerProvider from './provider';
import FilePicker from './filePicker';
import Player from './player';
import Graphic from './graphic';

const AudioPlayer = () => {
  return (
    <PlayerProvider>
      <FilePicker />
      <Player />
      <Graphic />
    </PlayerProvider>
  );
};

export default AudioPlayer;

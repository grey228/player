import React, { ChangeEvent, useCallback, useContext, useEffect, useState} from 'react';
import PlayerContext from './provider/context';
import AudioDriver from './driver';
import playerEvents from './events';
import './styles/index.css'

const Player = () => {
  const {buffer, audioContext} = useContext<any>(PlayerContext);
  const [driver, setDriver] = useState<AudioDriver>();


  useEffect(() => {
    const onDrag = async (props?: any) => {
      await driver?.drag(props).then(() => {
        play();
      });
      // driver?.rewind(percent)
    };
    playerEvents.on('dragCursor', onDrag);
    return () => {
      playerEvents.off('dragCursor', onDrag);
    };
  });


  useEffect(() => {
    if (!buffer) {
      return;
    }

    const init = async () => {
      const audioDriver = new AudioDriver(buffer, audioContext);
      setDriver(audioDriver);
    };

    init();
  }, [buffer, audioContext]);

  const play = useCallback(() => {
    driver?.play();
  }, [driver]);

  const pause = useCallback(() => {
    driver?.pause();
  }, [driver]);

  const stop = useCallback(() => {
    driver?.pause(true);
  }, [driver]);

  //


  //

  const onVolumeChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    driver?.changeVolume(Number(event.target.value));
  }, [driver]);

  if (!buffer) {
    return null;
  }

  if (!driver) {
    return <div>Loading</div>
  }

  return (
    <div className={'player'}>
      <div className={'player-buttons'}>
        <button onClick={play}>
          Play
        </button>

        <button onClick={pause}>
          Pause
        </button>

        <button onClick={stop}>
          Stop
        </button>
      </div>

      <input
        type="range"
        onChange={onVolumeChange}
        defaultValue={1}
        min={-1}
        max={1}
        step={0.05}
        className='volumeInp'
      />

    </div>
  );
};

export default Player;

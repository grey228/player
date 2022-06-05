import playerEvents from './events';
class AudioDriver {
  private audioContext: AudioContext;
  private readonly audioBuffer?: AudioBuffer = undefined;
  private gainNode?: GainNode = undefined;

  private bufferSource?: AudioBufferSourceNode = undefined;

  private startedAt = 0;
  private pausedAt = 0;
  private cursorPos = 0;
  public interval: NodeJS.Timer | undefined;
  private isRunning = false;
  private volume = 1;
  // private timer:any = null

  constructor(buffer: AudioBuffer, context: AudioContext) {
    this.audioBuffer = buffer; // Sound data
    this.audioContext = context; // AudioContext provides us access for hardware speakers
  }


// public async rewind(percent:number) {
//
//   if (!this.bufferSource) {
//     return;
//   }
//   if (this.isRunning) {
//     clearInterval(this.timer)
//     this.pause()
//   }

//
//   this.startedAt = (this?.audioBuffer?.duration || 0)  * percent / 100
//   this.pausedAt = this.startedAt;
//
// }


  public async play() {
    if (!this.audioBuffer) {
      throw new Error(
        'Play error. Audio buffer is not exists. Try to call "init" method before Play.'
      );
    }
    if (this.isRunning) {
      return;
    }

    this.gainNode = this.audioContext.createGain(); // create a volume controller

    this.bufferSource = this.audioContext.createBufferSource(); // create buffer source which allows us to play a sound
    this.bufferSource.buffer = this.audioBuffer; // add AudioBuffer (sound data) to buffer source

    this.bufferSource.connect(this.gainNode); // connecting volume controller to buffer source
    this.bufferSource.connect(this.audioContext.destination); // connect buffer source to hardware speakers

    this.gainNode.connect(this.audioContext.destination); // connect volume controller to hardware speakers

    await this.audioContext.resume(); // resume all speakers

    this.bufferSource.start(0, this.pausedAt); // run the sound. pausedAt remembers a last pause time

    this.gainNode.gain.value = this.volume; // setup default volume

    this.startedAt = this.audioContext.currentTime - this.pausedAt; // remember the time when we run the sound
    this.pausedAt = 0;

    this.isRunning = true;

    if (this.isRunning) {
      this.interval = setInterval(() => {
        this.cursorPos = this.cursorPos + 0.1;
        playerEvents.emit('cursorPosition', this.cursorPos);
      }, this.audioBuffer.duration)
      // const per = this.audioContext.currentTime / this.audioBuffer.duration * 100
      // playerEvents.emit('play', per)
    }
  }

  async pause(reset?: boolean) {
    if (!this.bufferSource) {
      return;
    }

    await this.audioContext.suspend(); // stop using hardware speakers

    this.pausedAt = reset ? 0 : this.audioContext.currentTime - this.startedAt; // calculate pause time or reset to 0
    this.bufferSource.stop(this.pausedAt); // stop playing sound
    this.gainNode?.disconnect(); // disconnect volume controller
    this.bufferSource.disconnect(); // remove buffer source from hardware speakers. We can't reuse the same buffer source, always should be new one.
    this.isRunning = false;

    if (reset) {
      this.cursorPos = 0;
      playerEvents.emit('cursorPosition', this.cursorPos)
    }
    clearInterval(this.interval)
  }

  public changeVolume(volume: number) {
    this.volume = volume;
    if (this.gainNode) {
      this.gainNode.gain.value = volume;
    }
  }

  async drag(props?: any) {
    if (!this.bufferSource) return;

    if (this.audioBuffer)
      this.pausedAt = (props.percent * this.audioBuffer.duration) / 100;
    this.bufferSource.stop(this.pausedAt);
    this.cursorPos = props.percent;
    this.gainNode?.disconnect();
    this.bufferSource.disconnect();
    this.isRunning = false;

    clearInterval(this.interval);

    await this.audioContext.suspend().then();
  }
}
export default AudioDriver;

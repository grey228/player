export interface IChartProps {
  buffer: AudioBuffer;
  container: HTMLElement;
}

export interface IOptions {
  margin?: { top: number; bottom: number; left: number; right: number };
  height?: number;
  width?: number;
  padding?: number;
}

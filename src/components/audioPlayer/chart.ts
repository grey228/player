import * as d3 from 'd3';
import playerEvents from './events';
import {IChartProps, IOptions} from './interfaces';
class Chart {
  private readonly chartProps: IChartProps;

  private readonly audioData: number[];

  private readonly options: IOptions = {
    margin: {
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
    },
    padding: 1,
  };

  private svg = d3.create('svg');

  private xScale: d3.ScaleLinear<number, number>;

  private yScale: d3.ScaleLinear<number, number>;

  constructor(props: IChartProps, options?: IOptions) {
    this.chartProps = props;
    this.options = Object.assign(this.options, options);

    const audioData = this.clearData();
    this.audioData = audioData;
    const HTMLContainer = this.chartProps.container;

    const {
      margin = { top: 0, bottom: 0, left: 0, right: 0 },
      height = HTMLContainer.clientHeight,
      width = HTMLContainer.clientWidth
    } = this.options;

    const domain = d3.extent(audioData);

    this.xScale = d3
      .scaleLinear()
      .domain([0, audioData.length - 1])
      .range([margin.left, width - margin.right]);

    this.yScale = d3
      .scaleLinear()
      .domain(domain.map(i => Number(i)))
      .range([margin.top, height - margin.bottom]);

    this.svg
      .style('width', width)
      .style('height', height)
      .style('display', 'block');
  }

  public clearData() {
    const { buffer } = this.chartProps;
    const rawData = buffer.getChannelData(0); // We only need to work with one channel of data

    const samples = buffer.sampleRate; // Number of samples we want to have in our final data set

    const blockSize = Math.floor(rawData.length / samples); // the number of samples in each subdivision
    const filteredData = [];

    for (let i = 0; i < samples; i += 1) {
      const blockStart = blockSize * i; // the location of the first sample in the block
      let sum = 0;
      for (let j = 0; j < blockSize; j += 1) {
        sum += Math.abs(rawData[blockStart + j]); // find the sum of all the samples in the block
      }
      filteredData.push(sum / blockSize); // divide the sum by the block size to get the average
    }

    const multiplier = Math.max(...filteredData) ** -1;
    return filteredData.map(n => n * multiplier);
  }

  public showSVG() {
    const HTMLContainer = this.chartProps.container;
    HTMLContainer.appendChild(this.svg.node() as Element);
  }

  public drawGrid() {
    const HTMLContainer = this.chartProps.container;

    const height = HTMLContainer.clientHeight;
    const width = HTMLContainer.clientWidth;

    this.svg
      .append('g')
      .attr('stroke-width', 0.5)
      .attr('stroke', '#D6E5D6')
      .call((g) =>
        g
          .append('g')
          .selectAll('line')
          .data(this.xScale.ticks())
          .join('line')
          .attr('x1', (d: d3.NumberValue) => {
            return 0.5 + this.xScale(d);
          })
          .attr('x2', (d: d3.NumberValue) => 0.5 + this.xScale(d))
          .attr('y1', 0)
          .attr('y2', height)
      )
      .call((g) =>
        g
          .append('g')
          .selectAll('line')
          .data(this.yScale.ticks())
          .join('line')
          .attr('y1', (d: d3.NumberValue) => this.yScale(d))
          .attr('y2', (d: d3.NumberValue) => this.yScale(d))
          .attr('x1', 0)
          .attr('x2', width)
      );
  }

  public drawWaveform() {
    const audioData = this.audioData;
    const HTMLContainer = this.chartProps.container;

    const height = HTMLContainer.clientHeight;
    const width = HTMLContainer.clientWidth;

    const { margin = { top: 0, bottom: 0, left: 0, right: 0 }, padding = 1 } =
      this.options;

    this.svg
      .append('rect')
      .attr('width', width)
      .attr('height', height)
      .attr('fill', 'rgba(255, 255, 255, 0)');

    const group = this.svg
      .append('g')
      .attr('transform', `translate(0, ${height / 2})`)
      .attr('fill', '#03A300');

    const band = (width - margin.left - margin.right) / audioData.length;

    group
      .selectAll('rect')
      .data(audioData)
      .join('rect')
      .attr('fill', '#03A300')
      .attr('height', d => this.yScale(d))
      .attr('width', () => band * padding)
      .attr('x', (_, i) => this.xScale(i))
      .attr('y', d => -this.yScale(d) / 2)
      .attr('rx', band / 2)
      .attr('ry', band / 2);
  }

  public drawBands() {
    const HTMLContainer = this.chartProps.container;
    const width = HTMLContainer.clientWidth;

    const { margin = { top: 0, bottom: 0, left: 0, right: 0 } } = this.options;

    const bands = this.getTimeDomain();

    const bandScale = d3.scaleBand().domain(bands).range([margin.top, width]);

    this.svg
      .append('g')
      .call(g => g.select('.domain').remove())
      .attr('stroke-width', 0)
      .style('color', '#95A17D')
      .style('font-size', 11)
      .style('font-wight', 400)
      .call(d3.axisBottom(bandScale.copy()));
  }

  private getTimeDomain(step = 30) {
    const { buffer } = this.chartProps;
    const steps = Math.ceil(buffer.duration / step);

    return [...new Array(steps)].map((_, index) => {
      const date = new Date(1970, 0, 1, 0, 0, 0, 0);
      date.setSeconds(index * step);

      let minutes = date.getMinutes().toString();
      if (minutes.length === 1) {
        minutes = `0${minutes}`;
      }

      let seconds = date.getSeconds().toString();
      if (seconds.length === 1) {
        seconds = `0${seconds}`;
      }
      return `${minutes}:${seconds}`;
    });
  }

  public drawCursor() {
    const HTMLContainer = this.chartProps.container;
    const height = HTMLContainer.clientHeight;
    const { margin } = this.options;

    this.svg
      .append('g')
      .attr('class', 'cursorContainer')
      .attr('transform', `translate(${[margin?.left || 0, 0]})`)
      .call(this.dragCursor() as never)
      .call((g) => {
        g.append('line')
          .attr('x1', 0)
          .attr('x2', 0)
          .attr('y1', height)
          .style('stroke', '#DA0000');
      })
      .call((g) => {
        const shape = d3.path();

        shape.moveTo(-5, 0);
        shape.lineTo(5, 0);
        shape.lineTo(5, 7);
        shape.lineTo(0, 12);
        shape.lineTo(-5, 7);

        shape.closePath();

        g.append('path')
          .attr('id', 'cursor')
          .attr('d', shape.toString())
          .attr('fill', '#0CA6D7')

      });
  }

  public moveCursor(percent: number) {
    const HTMLContainer = this.chartProps.container;
    const width = HTMLContainer.clientWidth;
    const { left = 0, right = 0 } = this.options.margin || {};

    const xCoordinate = Math.max(left, (percent * (width - right)) / 100);
    const cursor = d3.select('.cursorContainer');
    cursor.attr('transform', `translate(${[xCoordinate, 0]})`);
  }

  private dragCursor() {
    const dragged = (event: d3.D3DragEvent<Element, undefined, undefined>) => {
      const xAxis = event.x;

      const { left = 0, right = 0 } = this.options?.margin || {};

      const HTMLContainer = this.chartProps.container;
      // HTMLContainer.onmouseup = () => {
      //   console.log('testing')
      // }
      const width = HTMLContainer.clientWidth;

      if (xAxis < left || xAxis > width - right) {
        return;
      }

      const percent = ((xAxis - left) / (width - right - left)) * 100;

      playerEvents.emit('dragCursor', {xAxis, percent});

      this.moveCursor(percent);
    };

    return d3.drag().on('drag', dragged);
  }
  // public cursorEvents() {
  //   const cursor = document.getElementById('cursor')
  //   if (cursor) {
  //     cursor.addEventListener('mouseup', () => {
  //       console.log('123456789')
  //     })
  //     console.log(cursor)
  //   }
  // }
}

export default Chart;

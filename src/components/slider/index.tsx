import React, { FC, useCallback, useMemo, useState } from 'react';
import classnames from 'classnames';
import './styles.css';

export interface ISliderProps {
  slides: string[];
}

const Slider: FC<ISliderProps> = ({slides}) => {
  const [activeSlide, setActiveSlide] = useState(0)

  const slideElements = useMemo(() => {
    const activeSlideIndex = Math.abs(activeSlide) % slides.length;

    return slides.map((image, index) => {
      return (
        <div key={image} role={'slide'} className={classnames('slide',{
          active: index === activeSlideIndex,
        })} >
          <img src={image} />
        </div>
      );
    });
  }, [slides, activeSlide]);

  const changeSlide = useCallback((num: number) => () => {
    setActiveSlide(prev => prev + num);
  }, []);

  return (
    <div id={'slider'}>
      <div className={'slides'}>
        {slideElements}
      </div>

      <div className={'navigation'}>
        <button role={'prev'} onClick={changeSlide(-1)}>Prev</button>
        <button role={'next'} onClick={changeSlide(1)}>Next</button>
      </div>
    </div>
  );
};

export default Slider;

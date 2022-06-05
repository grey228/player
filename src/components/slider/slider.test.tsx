import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import Slider from './index';

describe('Slider component', function () {
  test('Generate slide elements', async () => {
    const slides = [
      'https://store-images.s-microsoft.com/image/apps.11706.13510798887588169.0eadce39-7717-4a7e-b7d9-535985030432.0ebe3152-7a6d-4b02-a8fa-a68262aee19d?w=672&h=378&q=80&mode=letterbox&background=%23FFE4E4E4&format=jpg',
      'https://wallpapershome.ru/images/pages/pic_h/23480.jpg',
      'https://images3.alphacoders.com/276/276565.jpg',
    ];

    render(<Slider slides={slides} />);

    const slideElements = await screen.findAllByRole('slide');
    const prevButton = await screen.findByRole('prev');
    const nextButton = await screen.findByRole('next');

    expect(!!prevButton).toBeTruthy();
    expect(!!nextButton).toBeTruthy();
    expect(slideElements.length).toBe(slides.length);

    expect(slideElements[0]).toHaveClass('active');
  });

  test('Prev / next slide testing', async () => {
    const slides = [
      'https://store-images.s-microsoft.com/image/apps.11706.13510798887588169.0eadce39-7717-4a7e-b7d9-535985030432.0ebe3152-7a6d-4b02-a8fa-a68262aee19d?w=672&h=378&q=80&mode=letterbox&background=%23FFE4E4E4&format=jpg',
      'https://wallpapershome.ru/images/pages/pic_h/23480.jpg',
      'https://images3.alphacoders.com/276/276565.jpg',
    ];

    render(<Slider slides={slides} />);

    const slideElements = await screen.findAllByRole('slide');
    const prevButton = await screen.findByRole('prev');
    const nextButton = await screen.findByRole('next');

    fireEvent.click(nextButton);
    fireEvent.click(nextButton);
    expect(slideElements[2]).toHaveClass('active');

    fireEvent.click(prevButton);

    expect(slideElements[1]).toHaveClass('active');
  });

  test('Circle sliding', async () => {
    const slides = [
      'https://store-images.s-microsoft.com/image/apps.11706.13510798887588169.0eadce39-7717-4a7e-b7d9-535985030432.0ebe3152-7a6d-4b02-a8fa-a68262aee19d?w=672&h=378&q=80&mode=letterbox&background=%23FFE4E4E4&format=jpg',
      'https://wallpapershome.ru/images/pages/pic_h/23480.jpg',
      'https://images3.alphacoders.com/276/276565.jpg',
    ];

    render(<Slider slides={slides} />);

    const slideElements = await screen.findAllByRole('slide');
    const prevButton = await screen.findByRole('prev');
    const nextButton = await screen.findByRole('next');

    const nextIndex = 50;
    let index = nextIndex % slides.length;

    for(let i = 0; i < nextIndex; i++) {
      fireEvent.click(nextButton);
    }

    expect(slideElements[index]).toHaveClass('active');

    const prevIndex = -100;
    index = Math.abs(nextIndex + prevIndex) % slides.length;

    for(let i = 0; i > prevIndex; i--) {
      fireEvent.click(prevButton);
    }

    expect(slideElements[index]).toHaveClass('active');
  });
});

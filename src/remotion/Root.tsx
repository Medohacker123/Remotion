import React from 'react';
import {Composition} from 'remotion';
import {SudanDigitalPromo} from './SudanDigitalPromo';
import {
  FOUR_K_DIMENSIONS,
  HD_DIMENSIONS,
  TOTAL_FRAMES,
  VIDEO_FPS,
} from './timelineData';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="SudanDigitalPromo"
        component={SudanDigitalPromo}
        durationInFrames={TOTAL_FRAMES}
        fps={VIDEO_FPS}
        width={HD_DIMENSIONS.width}
        height={HD_DIMENSIONS.height}
        defaultProps={{scaleFactor: 1}}
      />
      <Composition
        id="SudanDigitalPromo4K"
        component={SudanDigitalPromo}
        durationInFrames={TOTAL_FRAMES}
        fps={VIDEO_FPS}
        width={FOUR_K_DIMENSIONS.width}
        height={FOUR_K_DIMENSIONS.height}
        defaultProps={{scaleFactor: 2}}
      />
    </>
  );
};

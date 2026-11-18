import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile} from 'remotion';
import {SCENES} from './timelineData';
import {
  BrandCornerBug,
  DiagonalShutterTransition,
  KineticArabicCaptions,
} from './components/MotionPrimitives';
import {Scene1Intro} from './scenes/Scene1Intro';
import {Scene2DropOff} from './scenes/Scene2DropOff';
import {Scene3Diagnosis} from './scenes/Scene3Diagnosis';
import {Scene4Solution} from './scenes/Scene4Solution';
import {Scene5Experience} from './scenes/Scene5Experience';
import {Scene6EndCard} from './scenes/Scene6EndCard';

export const SudanDigitalPromo: React.FC<{
  scaleFactor?: number;
}> = ({scaleFactor = 1}) => {
  const [intro, dropoff, diagnosis, solution, experience, endcard] = SCENES;

  const content = (
    <AbsoluteFill style={{backgroundColor: '#08070D', overflow: 'hidden'}}>
      {/* Mastered 45s Audio (Cleaned Arabic VO + Ducked Broadcast Underscore + Transition SFX) */}
      <Audio src={staticFile('assets/processed/master-audio-45s.mp3')} />

      {/* 6 Sequential Scenes totalling 2700 frames (45s @ 60fps) */}
      <Sequence from={intro.startFrame} durationInFrames={intro.durationFrames}>
        <Scene1Intro />
      </Sequence>

      <Sequence from={dropoff.startFrame} durationInFrames={dropoff.durationFrames}>
        <Scene2DropOff />
      </Sequence>

      <Sequence from={diagnosis.startFrame} durationInFrames={diagnosis.durationFrames}>
        <Scene3Diagnosis />
      </Sequence>

      <Sequence from={solution.startFrame} durationInFrames={solution.durationFrames}>
        <Scene4Solution />
      </Sequence>

      <Sequence from={experience.startFrame} durationInFrames={experience.durationFrames}>
        <Scene5Experience />
      </Sequence>

      <Sequence from={endcard.startFrame} durationInFrames={endcard.durationFrames}>
        <Scene6EndCard />
      </Sequence>

      {/* 2D Diagonal Broadcast Shutter Transitions at scene boundaries */}
      <DiagonalShutterTransition triggerFrame={dropoff.startFrame} />
      <DiagonalShutterTransition triggerFrame={diagnosis.startFrame} />
      <DiagonalShutterTransition triggerFrame={solution.startFrame} />
      <DiagonalShutterTransition triggerFrame={experience.startFrame} />
      <DiagonalShutterTransition triggerFrame={endcard.startFrame} />

      {/* Persistent Sudan Digital Brand Corner Bug & Chapter Progress */}
      <BrandCornerBug />

      {/* Synchronized Word-by-Word Arabic Kinetic Captions */}
      <KineticArabicCaptions />
    </AbsoluteFill>
  );

  if (scaleFactor === 1) {
    return content;
  }

  return (
    <AbsoluteFill style={{backgroundColor: '#08070D', overflow: 'hidden'}}>
      <div
        style={{
          width: 1080,
          height: 1920,
          transform: `scale(${scaleFactor})`,
          transformOrigin: 'top left',
        }}
      >
        {content}
      </div>
    </AbsoluteFill>
  );
};

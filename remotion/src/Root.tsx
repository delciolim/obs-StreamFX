import React from "react";
import { Composition } from "remotion";
import { StreamFXIntro } from "./StreamFXIntro";
import { StreamFXTrailer, trailerDurationInFrames } from "./Trailer";
import { CultoTrailer, cultoTrailerDuration } from "./CultoTrailer";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="CultoTrailer"
        component={CultoTrailer}
        durationInFrames={cultoTrailerDuration()}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{}}
      />
      <Composition
        id="StreamFXIntro"
        component={StreamFXIntro}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{}}
      />
      <Composition
        id="StreamFXTrailer"
        component={StreamFXTrailer}
        durationInFrames={trailerDurationInFrames()}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{}}
      />
    </>
  );
};

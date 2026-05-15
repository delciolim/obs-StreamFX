import React from "react";
import {
  AbsoluteFill,
  Sequence,
  Video,
  Audio,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
  spring,
  OffthreadVideo,
  staticFile,
} from "remotion";

// Each clip definition: file path (relative to /public), start frame, duration in frames
interface Clip {
  src: string;
  startFrom?: number; // trim: frame offset into the source video
  durationInFrames: number;
  label?: string;
}

const CLIPS: Clip[] = [
  // Add your video clips here, e.g.:
  // { src: staticFile("clips/blur-demo.mp4"), durationInFrames: 90, label: "Blur Filter" },
  // { src: staticFile("clips/3d-transform.mp4"), durationInFrames: 90, label: "3D Transform" },
  // { src: staticFile("clips/color-grade.mp4"), durationInFrames: 90, label: "Color Grade" },
];

const ClipWithLabel: React.FC<{ clip: Clip }> = ({ clip }) => {
  const frame = useCurrentFrame();

  const labelOpacity = interpolate(frame, [0, 15, Math.max(16, clip.durationInFrames - 15), clip.durationInFrames], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill>
      {clip.src && (
        <OffthreadVideo
          src={clip.src}
          startFrom={clip.startFrom ?? 0}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      )}
      {clip.label && (
        <div
          style={{
            position: "absolute",
            bottom: 80,
            left: 80,
            opacity: labelOpacity,
            background: "rgba(124, 58, 237, 0.85)",
            padding: "12px 28px",
            borderRadius: 8,
            fontSize: 28,
            fontFamily: "sans-serif",
            fontWeight: 700,
            color: "#fff",
            letterSpacing: 1,
          }}
        >
          {clip.label}
        </div>
      )}
    </AbsoluteFill>
  );
};

const Transition: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 8, 12, 20], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill
      style={{ background: "#000", opacity }}
    />
  );
};

const TRANSITION_FRAMES = 20;

export const StreamFXTrailer: React.FC = () => {
  let offset = 0;
  const sequences: React.ReactNode[] = [];

  for (let i = 0; i < CLIPS.length; i++) {
    const clip = CLIPS[i];

    sequences.push(
      <Sequence key={`clip-${i}`} from={offset} durationInFrames={clip.durationInFrames}>
        <ClipWithLabel clip={clip} />
      </Sequence>
    );

    // Add a black transition between clips
    if (i < CLIPS.length - 1) {
      const transitionStart = offset + clip.durationInFrames - TRANSITION_FRAMES / 2;
      sequences.push(
        <Sequence key={`transition-${i}`} from={transitionStart} durationInFrames={TRANSITION_FRAMES}>
          <Transition />
        </Sequence>
      );
    }

    offset += clip.durationInFrames;
  }

  return <AbsoluteFill style={{ background: "#000" }}>{sequences}</AbsoluteFill>;
};

// Total duration helper (import and use in Root.tsx)
export const trailerDurationInFrames = (): number => {
  return CLIPS.reduce((acc, c) => acc + c.durationInFrames, 0) || 300;
};

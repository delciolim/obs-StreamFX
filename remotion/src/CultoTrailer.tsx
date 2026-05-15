import React from "react";
import {
  AbsoluteFill,
  Sequence,
  OffthreadVideo,
  interpolate,
  useCurrentFrame,
  staticFile,
} from "remotion";

const FPS = 30;

// Each clip: file in public/clips, startFrom (trim seconds*fps), duration in seconds
const CLIPS = [
  { file: "MVI_8953.MP4", startFrom: 0, secs: 5 },
  { file: "MVI_8954.MP4", startFrom: 0, secs: 5 },
  { file: "MVI_8955.MP4", startFrom: 0, secs: 5 },
  { file: "MVI_8956.MP4", startFrom: 0, secs: 5 },
  { file: "MVI_8958.MP4", startFrom: 0, secs: 5 },
  { file: "MVI_8960.MP4", startFrom: 0, secs: 5 },
  { file: "MVI_8961.MP4", startFrom: 0, secs: 5 },
  { file: "MVI_8963.MP4", startFrom: 0, secs: 5 },
  { file: "MVI_8964.MP4", startFrom: 0, secs: 5 },
  { file: "MVI_8966.MP4", startFrom: 0, secs: 5 },
  { file: "MVI_8971.MP4", startFrom: 0, secs: 5 },
  { file: "MVI_8978.MP4", startFrom: 0, secs: 5 },
  { file: "MVI_8979.MP4", startFrom: 0, secs: 5 },
  { file: "MVI_8980.MP4", startFrom: 0, secs: 5 },
  { file: "MVI_8984.MP4", startFrom: 0, secs: 5 },
  { file: "MVI_8985.MP4", startFrom: 0, secs: 5 },
  { file: "MVI_8986.MP4", startFrom: 0, secs: 5 },
  { file: "MVI_8990.MP4", startFrom: 0, secs: 5 },
  { file: "MVI_8998.MP4", startFrom: 0, secs: 5 },
  { file: "MVI_9000.MP4", startFrom: 0, secs: 6 },
] as const;

const FADE_FRAMES = 15; // half-second crossfade

interface ClipProps {
  file: string;
  startFrom: number;
  durationInFrames: number;
}

const ClipSegment: React.FC<ClipProps> = ({ file, startFrom, durationInFrames }) => {
  const frame = useCurrentFrame();

  const opacity = interpolate(
    frame,
    [0, FADE_FRAMES, durationInFrames - FADE_FRAMES, durationInFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill style={{ opacity }}>
      <OffthreadVideo
        src={staticFile(`clips/${file}`)}
        startFrom={startFrom}
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
    </AbsoluteFill>
  );
};

// Animated title card at the beginning
const TitleCard: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 20, 55, 75], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const scale = interpolate(frame, [0, 20], [0.92, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(160deg, #0d0d1a 0%, #1a1030 60%, #0d0d1a 100%)",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        gap: 24,
        opacity,
        transform: `scale(${scale})`,
      }}
    >
      <div
        style={{
          fontSize: 28,
          color: "#a78bfa",
          fontFamily: "Georgia, serif",
          letterSpacing: 10,
          textTransform: "uppercase",
          fontWeight: 400,
        }}
      >
        Culto de Domingo
      </div>
      <div
        style={{
          fontSize: 80,
          fontWeight: 900,
          fontFamily: "Georgia, serif",
          color: "#f8fafc",
          letterSpacing: -2,
          textAlign: "center",
          lineHeight: 1.1,
        }}
      >
        Momentos
        <br />
        <span style={{ color: "#a78bfa" }}>Especiais</span>
      </div>
      <div
        style={{
          marginTop: 16,
          fontSize: 22,
          color: "#94a3b8",
          fontFamily: "Georgia, serif",
          letterSpacing: 3,
        }}
      >
        Uma tarde cheia de fé e alegria
      </div>
    </AbsoluteFill>
  );
};

// End card
const EndCard: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 20, 60, 75], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(160deg, #0d0d1a 0%, #1a1030 60%, #0d0d1a 100%)",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        gap: 20,
        opacity,
      }}
    >
      <div
        style={{
          fontSize: 56,
          fontWeight: 700,
          color: "#f8fafc",
          fontFamily: "Georgia, serif",
          textAlign: "center",
          lineHeight: 1.3,
        }}
      >
        Obrigado pela
        <br />
        <span style={{ color: "#a78bfa" }}>vossa presença</span>
      </div>
      <div
        style={{
          marginTop: 8,
          fontSize: 20,
          color: "#64748b",
          fontFamily: "Georgia, serif",
          letterSpacing: 2,
        }}
      >
        Até ao próximo domingo ✝
      </div>
    </AbsoluteFill>
  );
};

export const CultoTrailer: React.FC = () => {
  const TITLE_FRAMES = 90; // 3 seconds
  const END_FRAMES = 90;   // 3 seconds

  let offset = TITLE_FRAMES;
  const clipSequences: React.ReactNode[] = [];

  for (let i = 0; i < CLIPS.length; i++) {
    const c = CLIPS[i];
    const dur = c.secs * FPS;
    clipSequences.push(
      <Sequence key={`clip-${i}`} from={offset} durationInFrames={dur}>
        <ClipSegment
          file={c.file}
          startFrom={c.startFrom}
          durationInFrames={dur}
        />
      </Sequence>
    );
    offset += dur;
  }

  const totalFrames = TITLE_FRAMES + CLIPS.reduce((a, c) => a + c.secs * FPS, 0) + END_FRAMES;

  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {/* Title */}
      <Sequence from={0} durationInFrames={TITLE_FRAMES}>
        <TitleCard />
      </Sequence>

      {/* All clips */}
      {clipSequences}

      {/* End card */}
      <Sequence from={offset} durationInFrames={END_FRAMES}>
        <EndCard />
      </Sequence>
    </AbsoluteFill>
  );
};

export const cultoTrailerDuration = (): number => {
  const TITLE_FRAMES = 90;
  const END_FRAMES = 90;
  return TITLE_FRAMES + CLIPS.reduce((a, c) => a + c.secs * FPS, 0) + END_FRAMES;
};

import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";

export const StreamFXIntro: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const opacity = interpolate(frame, [0, 30, durationInFrames - 30, durationInFrames], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const scale = interpolate(frame, [0, 30], [0.8, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        opacity,
      }}
    >
      <div
        style={{
          transform: `scale(${scale})`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 24,
        }}
      >
        <h1
          style={{
            fontFamily: "sans-serif",
            fontSize: 96,
            fontWeight: 800,
            color: "#e94560",
            margin: 0,
            letterSpacing: "-2px",
          }}
        >
          StreamFX
        </h1>
        <p
          style={{
            fontFamily: "sans-serif",
            fontSize: 32,
            color: "#a8b2c1",
            margin: 0,
            fontWeight: 300,
          }}
        >
          Supercharge your OBS Studio
        </p>
      </div>
    </AbsoluteFill>
  );
};

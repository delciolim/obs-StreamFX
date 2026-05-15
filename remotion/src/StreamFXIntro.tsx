import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

export const StreamFXIntro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoScale = spring({
    fps,
    frame,
    config: { damping: 12, stiffness: 80 },
  });

  const textOpacity = interpolate(frame, [30, 60], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const taglineOpacity = interpolate(frame, [60, 90], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(135deg, #0a0a1a 0%, #1a0a2e 50%, #0a0a1a 100%)",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        gap: 32,
      }}
    >
      <div
        style={{
          transform: `scale(${logoScale})`,
          fontSize: 120,
          fontWeight: 900,
          fontFamily: "sans-serif",
          background: "linear-gradient(90deg, #7c3aed, #4f46e5, #7c3aed)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          letterSpacing: "-2px",
        }}
      >
        StreamFX
      </div>
      <div
        style={{
          opacity: textOpacity,
          fontSize: 36,
          color: "#e2e8f0",
          fontFamily: "sans-serif",
          fontWeight: 300,
          letterSpacing: 8,
          textTransform: "uppercase",
        }}
      >
        Upgrade Your Stream
      </div>
      <div
        style={{
          opacity: taglineOpacity,
          fontSize: 22,
          color: "#94a3b8",
          fontFamily: "sans-serif",
          fontWeight: 400,
          maxWidth: 800,
          textAlign: "center",
          lineHeight: 1.6,
        }}
      >
        3D effects · Blur · Color grading · Shaders · And more
      </div>
    </AbsoluteFill>
  );
};

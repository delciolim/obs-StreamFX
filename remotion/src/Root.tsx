import { Composition } from "remotion";
import { StreamFXIntro } from "./StreamFXIntro";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="StreamFXIntro"
        component={StreamFXIntro}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};

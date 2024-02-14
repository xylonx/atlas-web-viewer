import { Niivue } from "@niivue/niivue";
import React, { useEffect, useRef } from "react";

const niiFile = new URL(
  "/Users/xylonx/Documents/TUe/2IMV10/Pandora-WhiteMatterAtlas/T1/T1.nii.gz",
  import.meta.url
).href;

const NV: React.FC<{
  model: string;
  onMark: () => Promise<void>;
}> = ({}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const nvRef = useRef<Niivue>(new Niivue());

  const mountCanvas = async () => {
    await nvRef.current.attachToCanvas(
      canvasRef.current as HTMLCanvasElement,
      true
    );
  };

  useEffect(() => {
    (async () => {
      await mountCanvas();

      console.log("mount canvas");

      // nvRef.current.loadVolumes([]);

      await nvRef.current.loadVolumes([
        {
          url: niiFile,
          colorMap: "gray",
          opacity: 1,
          visible: true,
        },
      ]);

      console.log("load volumes");

      nvRef.current.setSliceType(nvRef.current.sliceTypeRender);
    })();
  }, []);

  return <canvas ref={canvasRef} height="1000" width="640" />;
};

export default NV;

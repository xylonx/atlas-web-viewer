import { Niivue } from '@niivue/niivue';
import { MutableRefObject, useEffect, useRef } from 'react';

export const NiivueCanvas: React.FC<{
  nv: MutableRefObject<Niivue>;
  renderMode?: number;
  clipPlane?: number[];
  onClipPlaneChange?: (clipPlane: number[]) => void;
  scale?: number;

  onPositionChange?: (position: number[]) => void;
}> = ({ nv, renderMode, clipPlane, onClipPlaneChange, scale, onPositionChange }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const mountCanvas = async () => {
    await nv.current.attachToCanvas(canvasRef.current!, true);
  };

  useEffect(() => {
    nv.current.resizeListener();
  });

  useEffect(() => {
    mountCanvas();

    clipPlane && nv.current.setClipPlane(clipPlane);
  }, []);

  useEffect(() => {
    const mode = renderMode ?? 0.6;
    nv.current.setVolumeRenderIllumination(mode);
  }, [renderMode]);

  useEffect(() => {
    scale && nv.current.setScale(scale);
  }, [scale]);

  useEffect(() => {
    nv.current.onClipPlaneChange = (plane) => {
      onClipPlaneChange && onClipPlaneChange(plane);
    };

    nv.current.onLocationChange = (data: any) => {
      onPositionChange && onPositionChange([data.mm['0'], data.mm['1'], data.mm['2']]);
    };
  }, []);

  return <canvas ref={canvasRef} />;
};

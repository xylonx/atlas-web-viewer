import DeleteIcon from "@mui/icons-material/Delete";
import { Box, IconButton, Typography } from "@mui/material";
import {
  DRAG_MODE,
  LabelLineTerminator,
  LabelTextAlignment,
  NVImage,
  Niivue,
  SLICE_TYPE,
} from "@niivue/niivue";
import { MutableRefObject, useEffect, useRef } from "react";

const NiivueCanvas: React.FC<{
  nv: MutableRefObject<Niivue>;
  volume?: File;
  onVolumeLoadError?: () => Promise<void>;
  renderMode?: number;
  clipPlane?: number[];
  scale?: number;
  height?: number;
  width?: number;
}> = ({
  nv,
  volume,
  onVolumeLoadError,
  renderMode,
  clipPlane,
  scale,
  height,
  width,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const mountCanvas = async () => {
    await nv.current.attachToCanvas(canvasRef.current!, true);
  };

  const loadVolume = async (volume: File) => {
    try {
      console.log(`load volume: start: ${volume}`);
      const nvVolume = await NVImage.loadFromFile({
        file: volume,
        colormap: "gray",
        opacity: 1,
        visible: true,
      });
      nv.current.setVolume(nvVolume);
      nv.current.updateGLVolume();
      console.log(`load volume: finish: ${volume}`);
    } catch (error) {
      console.log(`load volume: error: ${error}`);
      onVolumeLoadError && (await onVolumeLoadError());
    }
  };

  useEffect(() => {
    nv.current.resizeListener();
  });

  useEffect(() => {
    mountCanvas();
  }, []);

  useEffect(() => {
    volume && loadVolume(volume);
  }, [volume]);

  useEffect(() => {
    const mode = renderMode ?? 0.6;
    nv.current.setVolumeRenderIllumination(mode);
  }, [renderMode]);

  useEffect(() => {
    clipPlane && nv.current.setClipPlane(clipPlane);
  }, [clipPlane]);

  useEffect(() => {
    scale && nv.current.setScale(scale);
  }, [scale]);

  return (
    <Box>
      <canvas ref={canvasRef} height={height} width={width} />
    </Box>
  );
};

export const NiivueComponent: React.FC<{
  volume?: File;
  scale3D?: number;
}> = ({ volume, scale3D }) => {
  const nv3DRef = useRef<Niivue>(
    new Niivue({
      logLevel: "error",
      dragAndDropEnabled: true,
      show3Dcrosshair: true,
      backColor: [0.3, 0.3, 0.3, 1],
      clipPlaneColor: [0, 0, 0, 0.2],
      isOrientCube: true,
      dragMode: DRAG_MODE.slicer3D,
      multiplanarForceRender: true,
    })
  );

  const nv2DRef = useRef<Niivue>(
    new Niivue({
      logLevel: "error",
      dragAndDropEnabled: true,
      show3Dcrosshair: false,
      backColor: [0.3, 0.3, 0.3, 1],
      isOrientCube: false,
      dragMode: DRAG_MODE.none,
      multiplanarForceRender: false,
    })
  );

  // tolerance: only 15mm from clicked location
  const isLabelExists = (point: number[], tolerance = 15) => {
    const labels = nv3DRef.current.getAllLabels();
    return labels.find((label) => {
      const lb = label.points as number[];
      const dis =
        Math.pow(lb[0] - point[0], 2) +
        Math.pow(lb[1] - point[1], 2) +
        Math.pow(lb[2] - point[2], 2);
      return dis <= Math.pow(tolerance, 2);
    });
  };

  const appendLabels = (mm: any) => {
    let xyzmm = [mm["0"], mm["1"], mm["2"]];

    if (!isLabelExists(xyzmm)) {
      nv3DRef.current.addLabel(
        "Label",
        {
          textScale: 2.0,
          textAlignment: LabelTextAlignment.CENTER,
          textColor: [0.0, 1.0, 0.0, 1.0],
          lineWidth: 3,
          lineColor: [0.0, 1.0, 0.0, 1.0],
          lineTerminator: LabelLineTerminator.NONE,
        },
        xyzmm
      );
    }
  };

  const handleClearLabels = () => {
    nv3DRef.current.document.labels = [];
    nv3DRef.current.updateGLVolume();
  };

  const hideLabels = () => {
    const labels = nv3DRef.current.getAllLabels();
    labels.forEach((val) => {
      val.style.lineWidth = val.style.lineWidth == 0 ? 4 : 0;
    });
    nv3DRef.current.document.labels = labels;
    nv3DRef.current.updateGLVolume();
  };

  // sync between 2d and 3d layer

  useEffect(() => {
    nv3DRef.current.setSliceType(SLICE_TYPE.RENDER);

    nv2DRef.current.setHighResolutionCapable(true);
    nv3DRef.current.setHighResolutionCapable(true);

    nv3DRef.current.setRadiologicalConvention(false);
    nv2DRef.current.setRadiologicalConvention(false);

    nv3DRef.current.onClipPlaneChange = (clipPlane) => {
      console.log(`on clip plane change: ${clipPlane}`);
    };

    nv3DRef.current.onLocationChange = (data: any) => {
      console.log(`3d: location change: ${JSON.stringify(data)}`);
      appendLabels(data["mm"]);
    };
    // nv2DRef.current.onLocationChange = () => {};

    nv2DRef.current.setInterpolation(false);
    nv3DRef.current.setInterpolation(false);

    // only sync 2d data
    nv2DRef.current.broadcastTo(nv3DRef.current, { "2d": true, "3d": false });
    nv3DRef.current.broadcastTo(nv2DRef.current, { "2d": true, "3d": false });
  }, []);

  const changeBundle = () => {
    nv2DRef.current.setFrame4D(nv2DRef.current.volumes[0].id,3);
    nv3DRef.current.setFrame4D(nv3DRef.current.volumes[0].id,3);
  };
  
  return (
    <Box>
      <button onClick={changeBundle}>
            change bundle from 0 to 3
      </button>
      <IconButton aria-label="delete" onClick={handleClearLabels}>
        <DeleteIcon />
      </IconButton>
      <IconButton aria-label="delete" onClick={hideLabels}>
        <DeleteIcon />
      </IconButton>
      <Typography variant="h2">3D canvas</Typography>
      <NiivueCanvas
        nv={nv3DRef}
        volume={volume}
        scale={scale3D}
        clipPlane={[-0.2, 0, 120]}
        height={800}
        width={400}
      />
      <Typography variant="h2">2D canvas</Typography>
      <NiivueCanvas nv={nv2DRef} volume={volume} height={1000} width={300} />
    </Box>
  );
};

import { Slider, Grid, Typography, Button, FormControl, InputLabel,
  Select, MenuItem
} from "@mui/material";
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import {
  DRAG_MODE,
  LabelLineTerminator,
  LabelTextAlignment,
  NVImage,
  Niivue,
  SLICE_TYPE,
} from "@niivue/niivue";
import { useState, MutableRefObject, useEffect, useRef } from "react";
import "./App.css";

// Upload Component
const FileInput: React.FC<{
  onChooseFile: (file: File) => void;
}> = ({ onChooseFile }) => {
  return (
    <Button
      component="label"
      variant="contained"
      startIcon={<CloudUploadIcon />}
    >
      Upload file
      <input
        type="file"
        onChange={(event) => {
          const file = event.target.files?.item(0);
          file && onChooseFile(file);
        }}
        hidden
      />
    </Button>
  );
};

// Niivue Canvas Component
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
    <canvas ref={canvasRef} height={height} width={width} />
  );
};

function App() {
  const [volume, setVolume] = useState<File | undefined>(undefined);

  const [scale, setScale] = useState<number>(1);

  // Create canvas instances
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

  // Monitor canvasview Grid size changes
  const gridRef3D = useRef(null);
  const [dimensions3D, setDimensions3D] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const observeTarget = gridRef3D.current;
    if (observeTarget) {
      const resizeObserver = new ResizeObserver(entries => {
        entries.forEach(entry => {
          const { width, height } = entry.contentRect;
          setDimensions3D({ width, height }); // Update height and width
        });
      });
      resizeObserver.observe(observeTarget);
      return () => resizeObserver.unobserve(observeTarget); // Clean
    }
  }, [gridRef3D]);

  return (
    <Grid container style={{ height: '100vh' }}>
      {/* Left side */}
      <Grid item xs={2} container style={{ backgroundColor: '#eee' }}>
        {/* Title & Button zone */}
        <Typography variant="h5" style={{ marginLeft: '20px' }}>NiiVue Web</Typography>
        <Grid item container xs={12} style={{ padding: '20px', backgroundColor: '#ddd' }}>
          {/* Select type */}
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Select Model Type</InputLabel>
              <Select label="Select Model Type" defaultValue="">
                <MenuItem value="">-</MenuItem>
                <MenuItem value="T1">T1</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          {/* Upload */}
          <Grid item xs={12}>
            <FileInput onChooseFile={setVolume} />
          </Grid>
          {/* Other Buttons */}
          <Grid item xs={12}>
            <Button variant="outlined" onClick={handleClearLabels}>Clear</Button>
            <Button variant="outlined" onClick={hideLabels} style={{ marginLeft: '5px' }}>Hide</Button>
          </Grid>
          {/* Slider */}
          <Grid item container xs={12}>
            <Grid item xs={3}>
              <Typography variant="body1">Scale</Typography>
            </Grid>
            <Grid item xs={9}>
              <Slider
                aria-label="Volume"
                min={0.1}
                step={0.01}
                max={8}
                value={scale}
                size="small"
                onChange={(_, val) => {
                  console.log(`scale: ${val}`);
                  setScale(val as number);
                }}
              />
            </Grid>
          </Grid>
        </Grid>
        {/* Track selection */}
        <Grid item xs={12} style={{ backgroundColor: '#aaa', height: '60%' }}>
        </Grid>
      </Grid>
      {/* Right side */}
      <Grid item xs={10} container style={{ backgroundColor: '#ccc' }}>
        {/* Upper part */}
        <Grid item xs={12} ref={gridRef3D} container style={{ backgroundColor: '#bbb' }}>
          {/* 3D views */}
          <Grid item xs={9} style={{ backgroundColor: '#eee', padding: '5px'}}>
            <NiivueCanvas
              nv={nv3DRef}
              volume={volume}
              scale={scale}
              clipPlane={[-0.2, 0, 120]}
              height={dimensions3D.height}
              width={dimensions3D.width * 0.75}
            />
          </Grid>
          {/* Labels info */}
          <Grid item xs={3} style={{ backgroundColor: '#aaa' }}>
          </Grid>
        </Grid>
        {/* Lower part - 2D views */}
        <Grid item xs={12} style={{ backgroundColor: '#ccc', height: '50%', padding: '5px'}}>
          <NiivueCanvas nv={nv2DRef} height={dimensions3D.height} width={dimensions3D.width} />
        </Grid>
      </Grid>
    </Grid>
  );
}

export default App;

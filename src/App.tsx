import { Slider } from "@mui/material";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import { useState } from "react";
import "./App.css";
import { NiivueComponent } from "./NiivueCanvas";

const FileInput: React.FC<{
  onChooseFile: (file: File) => void;
}> = ({ onChooseFile }) => {
  return (
    <Box>
      <input
        type="file"
        onChange={(event) => {
          const file = event.target.files?.item(0);
          file && onChooseFile(file);
        }}
      />
    </Box>
  );
};

function App() {
  const [volume, setVolume] = useState<File | undefined>(undefined);

  const [scale, setScale] = useState<number>(1);

  return (
    <Container>
      <Typography variant="h4">NiiVue web</Typography>

      <Box>
        <Typography variant="body1">Input file</Typography>
        <FileInput onChooseFile={setVolume} />
      </Box>

      <Box>
        <Typography variant="body1">Scale</Typography>
        <Box sx={{ width: 200 }}>
          <Slider
            aria-label="Volume"
            min={0.1}
            step={0.01}
            max={8}
            value={scale}
            onChange={(_, val) => {
              console.log(`scale: ${val}`);
              setScale(val as number);
            }}
          />
        </Box>
      </Box>

      <Box>
        <NiivueComponent volume={volume} scale3D={scale} />
      </Box>
    </Container>
  );
}

export default App;

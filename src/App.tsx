import { Slider, Grid, Typography, Button, FormControl, InputLabel,
  Select, MenuItem
} from "@mui/material";
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { useState } from "react";
import "./App.css";
import { NiivueComponent } from "./NiivueCanvas";

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

function App() {
  const [volume, setVolume] = useState<File | undefined>(undefined);

  const [scale, setScale] = useState<number>(1);

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
            <Button variant="outlined">Reset</Button>
            <Button variant="outlined" style={{ marginLeft: '5px' }}>Delete</Button>
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
        <Grid item xs={12} container style={{ backgroundColor: '#fff', height: '50%' }}>
          <Grid item xs={9} style={{ backgroundColor: '#eee' }}>
          
          </Grid>
          <Grid item xs={3} style={{ backgroundColor: '#aaa' }}>
          
          </Grid>
        </Grid>
        {/* Lower part */}
        <Grid item xs={12} container style={{ backgroundColor: '#fff', height: '50%' }}>
        </Grid>
      </Grid>
    </Grid>
  );
}

export default App;

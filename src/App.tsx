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

  const [bundleOptions, setBundleOptions] = useState<string[]>(["Corpus Callosum Forceps Major","Corpus Callosum Forceps Minor","Arcuate Fasciculus left","Cingulum - Cingulate Gyrus left","Cingulum - Hippocampal Gyrus left","Corticospinal Tract left","Inferior Occipito-frontal Fasciculus left","Inferior Longitudinal Fasciculus left","Superior Longitudinal Fasciculus left","Thalamic Radiation left","Uncinate Fasciculus left","Arcuate Fasciculus right","Cingulum - Cingulate Gyrus right","Cingulum - Hippocampal Gyrus right","Corticospinal Tract right","Inferior Occipito-frontal Fasciculus right","Inferior Longitudinal Fasciculus right","Superior Longitudinal Fasciculus right","Thalamic Radiation right","Uncinate Fasciculus right"]);


  const handleTractographyChange = (event: React.ChangeEvent<HTMLSelectElement>)=>{
    let bundle_options : string[]
    switch(event.target.value){
      case "1":
        bundle_options = ["Corpus Callosum Forceps Major","Corpus Callosum Forceps Minor","Arcuate Fasciculus left","Cingulum - Cingulate Gyrus left","Cingulum - Hippocampal Gyrus left","Corticospinal Tract left","Inferior Occipito-frontal Fasciculus left","Inferior Longitudinal Fasciculus left","Superior Longitudinal Fasciculus left","Thalamic Radiation left","Uncinate Fasciculus left","Arcuate Fasciculus right","Cingulum - Cingulate Gyrus right","Cingulum - Hippocampal Gyrus right","Corticospinal Tract right","Inferior Occipito-frontal Fasciculus right","Inferior Longitudinal Fasciculus right","Superior Longitudinal Fasciculus right","Thalamic Radiation right","Uncinate Fasciculus right"];
        break;
      case "2":
        bundle_options = ["Corpus Callosum Forceps Major","Corpus Callosum Forceps Minor","Arcuate Fasciculus left","Cingulum - Cingulate Gyrus left","Cingulum - Hippocampal Gyrus left","Corticospinal Tract left","Inferior Occipito-frontal Fasciculus left","Inferior Longitudinal Fasciculus left","Superior Longitudinal Fasciculus left","Thalamic Radiation left","Uncinate Fasciculus left","Arcuate Fasciculus right","Cingulum - Cingulate Gyrus right","Cingulum - Hippocampal Gyrus right","Corticospinal Tract right","Inferior Occipito-frontal Fasciculus right","Inferior Longitudinal Fasciculus right","Superior Longitudinal Fasciculus right","Thalamic Radiation right","Uncinate Fasciculus right"];
        break;  
      case "3":
        bundle_options = ["Arcuate Fasciculus left","Arcuate Fasciculus left","Frontal Aslant Tract left","Frontal Aslant Tract right","Cerebellum left","Cerebellum right","Corpus Callosum Major","Corpus Callosum Minor","Full corpus callosum","Corpus Callosum Mid","Corticospinal Tract left","Corticospinal Tract left","Central Tegmental Tract left","Central Tegmental Tract right","Extreme Capsule left","Extreme Capsule right","Fronto-pontine tract left","Fronto-pontine tract right","Inferior Fronto-occipital Fasciculus left","Inferior Fronto-occipital Fasciculus right","Inferior Longitudinal Fasciculus left","Inferior Longitudinal Fasciculus right","Middle Cerebellar Peduncle","Middle Longitudinal Fasciculus left","Middle Longitudinal Fasciculus right","Medial Longitudinal fasciculus left","Medial Longitudinal fasciculus right","Medial Lemniscus left","Medial Lemniscus right","Occipito Pontine Tract left","Occipito Pontine Tract right","Optic Radiation left","Optic Radiation right","Parieto Pontine Tract left","Parieto Pontine Tract right","Superior longitudinal fasciculus left","Superior longitudinal fasciculus right","Spinothalamic Tract left","Spinothalamic Tract right","Temporopontine Tract left","Temporopontine Tract right","Uncinate Fasciculus left","Uncinate Fasciculus right","Vermis"];
        break;
      case "4":
        bundle_options = ["Arcuate fascicle left","Arcuate fascicle right","Anterior Thalamic Radiation left","Anterior Thalamic Radiation right","Commissure Anterior","Rostrum","Genu","Rostral body (Premotor)","Anterior midbody (Primary Motor)","Posterior midbody (Primary Somatosensory)","Isthmus","Splenium","Corpus Callosum - all","Cingulum left","Cingulum right","Corticospinal tract left","Corticospinal tract right","Fronto-pontine tract left","Fronto-pontine tract right","Fornix left","Fornix right","Inferior cerebellar peduncle left","Inferior cerebellar peduncle right","Inferior occipito-frontal fascicle left","Inferior occipito-frontal fascicle right","Inferior longitudinal fascicle left","Inferior longitudinal fascicle right","Middle cerebellar peduncle","Middle longitudinal fascicle left","Middle longitudinal fascicle right","Optic radiation left","Optic radiation right","Parieto-occipital pontine left","Parieto-occipital pontine right","Superior cerebellar peduncle left","Superior cerebellar peduncle right","Superior longitudinal fascicle III left","Superior longitudinal fascicle III right","Superior longitudinal fascicle II left","Superior longitudinal fascicle II right","Superior longitudinal fascicle I left","Superior longitudinal fascicle I right","Striato-fronto-orbital left","Striato-fronto-orbital right","Striato-occipital left","Striato-occipital right","Striato-parietal left","Striato-parietal right","Striato-postcentral left","Striato-postcentral right","Striato-precentral left","Striato-precentral right","Striato-prefrontal left","Striato-prefrontal right","Striato-premotor left","Striato-premotor right","Superior Thalamic Radiation left","Superior Thalamic Radiation right","Thalamo-occipital left","Thalamo-occipital right","Thalamo-parietal left","Thalamo-parietal right","Thalamo-postcentral left","Thalamo-postcentral right","Thalamo-precentral left","Thalamo-precentral right","Thalamo-prefrontal left","Thalamo-prefrontal right","Thalamo-premotor left","Thalamo-premotor right","Uncinate fascicle left","Uncinate fascicle right"];
        break;
      case "5":
        bundle_options = ["Corpus Callosum Forceps Major","Corpus Callosum Forceps Minor","Anterior Thalamic Radiation left","Cingulum - Angular Bundle left","Cingulum - Cingulate Gyrus left","Corticospinal Tract left","Inferior Longitudinal Fasciculus left","Superior Longitudinal Fasciculus - Parietal left","Superior Longitudinal Fasciculus - Temporal left","Uncinate Fasciculus left","Anterior Thalamic Radiation right","Cingulum - Angular Bundle right","Cingulum - Cingulate Gyrus right","Corticospinal Tract right","Inferior Longitudinal Fasciculus right","Superior Longitudinal Fasciculus - Parietal right","Superior Longitudinal Fasciculus - Temporal right","Uncinate Fasciculus right"];
        break;
      case "6":
        bundle_options = ["Anterior Commissure","Arcuate Fascile left","Arcuate Fascile right","Acoustic Radiation left","Acoustic Radiation right","Anterior Thalamic Radiation left","Anterior Thalamic Radiation right","Cingulum Bundle Dorsal left","Cingulum Bundle Dorsal right","Cingulum Bundle Parahippocampal left","Cingulum Bundle Parahippocampal right","Cingulum Bundle Temporal left","Cingulum Bundle Temporal right","Corticospinal Tract left","Corticospinal Tract right","Frontal Aslant left","Frontal Aslant right","Forceps Major","Forceps Minor","Fornix left","Fornix right","Inferior Fronto-occipital Fasciculus left","Inferior Fronto-occipital Fasciculus right","Inferior Longitudinal Fasciculus left","Inferior Longitudinal Fasciculus right","Middle Cerebellar Peduncle","Medio-Dorsal Longitudinal Fasciculus left","Medio-Dorsal Longitudinal Fasciculus right","Optic Radiation left","Optic Radiation right","Superior Longitudinal Fasciculus 1 left","Superior Longitudinal Fasciculus 1 right","Superior Longitudinal Fasciculus 2 left","Superior Longitudinal Fasciculus 2 right","Superior Longitudinal Fasciculus 3 left","Superior Longitudinal Fasciculus 3 right","Superior Thalamic Radiation left","Superior Thalamic Radiation right","Uncinate Fasciculus left","Uncinate Fasciculus right","Vertical Occipital Fasciculus left","Vertical Occipital Fasciculus right"];
        break;    
      default:
        bundle_options = ["Corpus Callosum Forceps Major","Corpus Callosum Forceps Minor","Arcuate Fasciculus left","Cingulum - Cingulate Gyrus left","Cingulum - Hippocampal Gyrus left","Corticospinal Tract left","Inferior Occipito-frontal Fasciculus left","Inferior Longitudinal Fasciculus left","Superior Longitudinal Fasciculus left","Thalamic Radiation left","Uncinate Fasciculus left","Arcuate Fasciculus right","Cingulum - Cingulate Gyrus right","Cingulum - Hippocampal Gyrus right","Corticospinal Tract right","Inferior Occipito-frontal Fasciculus right","Inferior Longitudinal Fasciculus right","Superior Longitudinal Fasciculus right","Thalamic Radiation right","Uncinate Fasciculus right"];        
    }
    setBundleOptions(bundle_options)
  }

  const handleAtalasSelection = (event : React.ChangeEvent<HTMLSelectElement>)=>{
    console.log(event.target.value)
  }

  return (
    <Container>
      <Typography variant="h4">NiiVue web</Typography>

      <Box>
        <Typography variant="body1">Tractography Method</Typography>
          <select onChange={handleTractographyChange}>
            <option value="1">AFQ</option>
            <option value="2">AFQclipped</option>
            <option value="3">Recobundles</option>
            <option value="4">TractSeg</option>
            <option value="5">Tracula</option>
            <option value="6">Xtract</option>
          </select>
      </Box>
      
      <Box>
        <Typography variant="body1">Input file</Typography>
        <FileInput onChooseFile={setVolume} />
      </Box>

      <Box>
        <Typography variant="body1">Atlas Selection</Typography>
        <select onChange={handleAtalasSelection}>
          {bundleOptions.map((option, index) => (
            <option key = {index} value={index}>
              {option}
            </option>
          ))}
        </select>
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

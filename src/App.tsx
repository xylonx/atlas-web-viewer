// import React from 'react'
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import "./App.css";
import NV from "./NiivueCanvas";

function App() {
  return (
    <Container>
      <Box>
        <Typography variant="h4">NiiVue web</Typography>
        <NV onMark={async () => {}} model="./" />
      </Box>
    </Container>
  );
}

export default App;

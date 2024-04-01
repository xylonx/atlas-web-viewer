import { MantineProvider } from '@mantine/core';
import { ToastContainer, Zoom } from 'react-toastify';
import { Router } from './Router';
import { theme } from './theme';

import '@mantine/core/styles.css';
import 'react-toastify/dist/ReactToastify.css';

export default function App() {
  return (
    <MantineProvider theme={theme}>
      <Router />
      <ToastContainer
        position="top-right"
        autoClose={2500}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
        transition={Zoom}
      />
    </MantineProvider>
  );
}

import { MantineProvider } from '@mantine/core';
import { Analytics } from '@vercel/analytics/react';
import { ToastContainer, Zoom } from 'react-toastify';
import { Router } from './Router';

import '@mantine/core/styles.css';
import 'react-toastify/dist/ReactToastify.css';

export default function App() {
  return (
    <MantineProvider defaultColorScheme="dark">
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

      <Analytics />
    </MantineProvider>
  );
}

import '../styles/globals.css';

import { StyledEngineProvider, ThemeProvider } from '@mui/material/styles';

import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
// eslint-disable-next-line import/no-unresolved
import { Analytics } from '@vercel/analytics/react';
import type { AppProps } from 'next/app';
import { GLOBAL_MUI_THEME } from '../styles/global.theme';
import { LocalizationProvider } from '@mui/x-date-pickers';
import EventProvider from 'src/helpers/utils/eventProvider';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={GLOBAL_MUI_THEME}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <EventProvider>
            <Component {...pageProps} />
          </EventProvider>
          <Analytics />
        </LocalizationProvider>
      </ThemeProvider>
    </StyledEngineProvider>
  );
}

export default MyApp;

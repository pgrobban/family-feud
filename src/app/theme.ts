'use client';
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#90caf9',
      dark: '#42a5f5',
      light: '#e3f2fd',
    },
    secondary: {
      main: '#ff7043',
      dark: '#d84315',
      light: '#ffab91',
    },
    background: {
      default: '#121212',
      paper: '#1d1d1d',
    },
    text: {
      primary: '#e0e0e0',
      secondary: '#b0bec5',
      disabled: '#757575',
    },
    error: {
      main: '#f44336',
      dark: '#d32f2f',
      light: '#e57373',
    },
    success: {
      main: '#66bb6a',
      dark: '#388e3c',
      light: '#81c784',
    },
    warning: {
      main: '#ffeb3b',
      dark: '#fbc02d',
      light: '#fff59d',
    },
    info: {
      main: '#29b6f6',
      dark: '#0288d1',
      light: '#80deea',
    },
    divider: '#424242',
  },
  typography: {
    fontSize: 20,
    fontFamily: 'var(--font-geist)',
  },
});

export default theme;
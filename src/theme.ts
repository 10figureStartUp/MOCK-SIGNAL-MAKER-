import { createTheme } from '@mui/material/styles';

// Create a dark theme matching your current design
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#2563eb',
    },
    error: {
      main: '#f44336',
      light: 'rgba(244, 67, 54, 0.2)',
      dark: '#d32f2f',
    },
    success: {
      main: '#4caf50',
      light: 'rgba(76, 175, 80, 0.2)',
      dark: '#388e3c',
    },
    warning: {
      main: '#f7b731',
      light: 'rgba(247, 183, 49, 0.1)',
      dark: '#f59f00',
    },
    background: {
      default: '#0a0a0a',
      paper: '#121212',
    },
    text: {
      primary: '#ffffff',
      secondary: 'rgba(255, 255, 255, 0.8)',
    },
    divider: 'rgba(255, 255, 255, 0.1)',
  },
  typography: {
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif',
    h4: {
      fontWeight: 700,
      letterSpacing: '-0.01em',
    },
    h6: {
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
      },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: 'rgba(255, 255, 255, 0.1)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#121212',
          borderRadius: 16,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiToggleButton: {
      styleOverrides: {
        root: {
          '&.Mui-selected': {
            color: '#ffffff',
            backgroundColor: '#2563eb',
          },
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: 'rgba(255, 255, 255, 0.1)',
        },
      },
    },
  },
});

export default theme;
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline, Box, Typography, Stack } from '@mui/material';
import Layout from './components/Layout';
import StockAnalysisDashboard from './components/StockAnalysisDashboard';
import FinancialStatements from './components/FinancialStatements';
import ValuationModels from './components/ValuationModels';
import News from './components/News';
import { StockProvider } from './contexts/StockContext';
import StockSearch from './components/StockSearch';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#6C63FF',
    },
    secondary: {
      main: '#4ECDC4',
    },
    background: {
      default: '#F8F9FF',
      paper: '#FFFFFF',
    },
    error: {
      main: '#FF6B6B',
    },
    success: {
      main: '#2ECC71',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 800,
    },
    h4: {
      fontWeight: 700,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 16,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 30,
          textTransform: 'none',
          fontWeight: 600,
          fontSize: '1rem',
          padding: '10px 24px',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          transition: 'transform 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-4px)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid rgba(108, 99, 255, 0.1)',
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <StockProvider>
        <BrowserRouter>
          <Layout>
            <Box sx={{ mb: 4 }}>
              <StockSearch />
            </Box>
            <Routes>
              <Route path="/" element={<StockAnalysisDashboard />} />
              <Route path="/financials" element={<FinancialStatements />} />
              <Route path="/valuation" element={<ValuationModels />} />
              <Route path="/news" element={<News />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </StockProvider>
    </ThemeProvider>
  );
}

export default App;
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline, Box, Typography, Stack } from '@mui/material';
import Layout from './components/Layout';
import StockDashboard from './components/StockDashboard';
import GrowthAnalysis from './components/GrowthAnalysis';
import MoatAnalysis from './components/MoatAnalysis';
import QualityScore from './components/QualityScore';
import ValuationModels from './components/ValuationModels';
import NewsResearch from './components/NewsResearch';
import PortfolioTracker from './components/PortfolioTracker';
import CompetitorAnalysis from './components/CompetitorAnalysis';
import FinancialStatements from './components/FinancialStatements';
import DCFValuation from './components/DCFValuation';
import RiskAssessment from './components/RiskAssessment';
import InvestmentChecklist from './components/InvestmentChecklist';
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

// Navigation items configuration
export const navigationItems = [
  {
    title: 'Dashboard',
    path: '/',
    icon: 'dashboard',
  },
  {
    title: 'Financial Statements',
    path: '/financials',
    icon: 'description',
  },
  {
    title: 'Stock Analysis',
    path: '/analysis',
    icon: 'analytics',
  },
  {
    title: 'Valuation Models',
    path: '/valuation',
    icon: 'calculate',
  },
  {
    title: 'DCF Analysis',
    path: '/dcf',
    icon: 'trending_up',
  },
  {
    title: 'Competitor Analysis',
    path: '/competitors',
    icon: 'people',
  },
  {
    title: 'Portfolio Tracker',
    path: '/portfolio',
    icon: 'account_balance',
  },
  {
    title: 'Stock Screener',
    path: '/screener',
    icon: 'filter_list',
  },
  {
    title: 'News & Research',
    path: '/news',
    icon: 'newspaper',
  },
  {
    title: 'Investment Checklist',
    path: '/checklist',
    icon: 'checklist',
  },
  {
    title: 'Risk Assessment',
    path: '/risk',
    icon: 'warning',
  },
];


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
              <Route path="/" element={<StockDashboard />} />
              <Route path="/financials" element={<FinancialStatements />} />
              <Route path="/analysis" element={
                <Box>
                  <Typography variant="h4" gutterBottom>Stock Analysis</Typography>
                  <Stack spacing={4}>
                    <GrowthAnalysis />
                    <MoatAnalysis />
                    <QualityScore />
                    <CompetitorAnalysis />
                  </Stack>
                </Box>
              } />
              <Route path="/valuation" element={<ValuationModels />} />
              <Route path="/dcf" element={<DCFValuation />} />
              <Route path="/competitors" element={<CompetitorAnalysis />} />
              <Route path="/portfolio" element={<PortfolioTracker />} />
              <Route path="/news" element={<NewsResearch />} />
              <Route path="/checklist" element={<InvestmentChecklist />} />
              <Route path="/risk" element={<RiskAssessment />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </StockProvider>
    </ThemeProvider>
  );
}

export default App;
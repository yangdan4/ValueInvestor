import React from 'react';
import {
  Box,
  Grid,
  Stack,
  Paper,
  Typography,
  CircularProgress,
  Alert,
} from '@mui/material';
import { useStock } from '../contexts/StockContext';
import StockSearch from './StockSearch';
import ValuationMetrics from './ValuationMetrics';
import ValuationModels from './ValuationModels';
import FinancialStatements from './FinancialStatements';
import MoatAnalysis from './MoatAnalysis';
import RiskAnalysis from './RiskAnalysis';
import QualityScore from './QualityScore';
import GrowthAnalysis from './GrowthAnalysis';
import CompetitorAnalysis from './CompetitorAnalysis';
import News from './News';

function StockAnalysisDashboard() {
  const { stockData, loading, error } = useStock();

  return (
    <Box sx={{ maxWidth: 1400, margin: '0 auto', p: { xs: 2, sm: 3 } }}>
      <Stack spacing={4}>
        <StockSearch />

        {loading && (
          <Box display="flex" justifyContent="center" my={4}>
            <CircularProgress size={60} thickness={4} />
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ borderRadius: 4 }}>
            {error}
          </Alert>
        )}

        {!loading && !error && stockData && (
          <Stack spacing={4}>
            <Paper elevation={0} sx={{ p: 4 }}>
              <Typography variant="h4" gutterBottom fontWeight={700}>
                {stockData.overview.Name} ({stockData.overview.Symbol})
              </Typography>
              <Typography variant="body1" color="textSecondary">
                {stockData.overview.Description}
              </Typography>
              <Box mt={2}>
                <Typography variant="body2" color="textSecondary">
                  Sector: {stockData.overview.Sector} | Industry: {stockData.overview.Industry}
                </Typography>
              </Box>
            </Paper>

            <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                <ValuationMetrics />
              </Grid>
              <Grid item xs={12} md={6}>
                <QualityScore />
              </Grid>
            </Grid>

            <ValuationModels />
            <MoatAnalysis />
            <GrowthAnalysis />
            <RiskAnalysis />
            <FinancialStatements />
            <CompetitorAnalysis />
            <News />
          </Stack>
        )}

        {!loading && !error && !stockData && (
          <Alert severity="info" sx={{ borderRadius: 4 }}>
            Please select a stock to begin analysis
          </Alert>
        )}
      </Stack>
    </Box>
  );
}

export default StockAnalysisDashboard; 
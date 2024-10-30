import React from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
} from '@mui/material';
import { useStock } from '../contexts/StockContext';
import ValuationMetrics from './ValuationMetrics';
import ValuationModels from './ValuationModels';
import FinancialStatements from './FinancialStatements';

function StockAnalysisDashboard() {
  const { stockData, loading, error } = useStock();

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" my={4}>
        <CircularProgress size={60} thickness={4} />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ borderRadius: 4 }}>
        {error}
      </Alert>
    );
  }

  if (!stockData) {
    return (
      <Alert severity="info" sx={{ borderRadius: 4, fontSize: '1.1rem' }}>
        Please select a stock to begin analysis
      </Alert>
    );
  }

  return (
    <Box>
      <Card
        elevation={0}
        sx={{
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(108, 99, 255, 0.1)',
          mb: 4
        }}
      >
        <CardContent>
          <Typography variant="h5" gutterBottom fontWeight={700}>
            Company Overview
          </Typography>
          <Typography variant="h4" gutterBottom>
            {stockData.overview.Name} ({stockData.overview.Symbol})
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            {stockData.overview.Description}
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="subtitle2" color="text.secondary">
                Sector
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {stockData.overview.Sector}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="subtitle2" color="text.secondary">
                Industry
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {stockData.overview.Industry}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="subtitle2" color="text.secondary">
                Market Cap
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                ${(parseFloat(stockData.overview.MarketCapitalization) / 1e9).toFixed(2)}B
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="subtitle2" color="text.secondary">
                Exchange
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {stockData.overview.Exchange}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Grid container spacing={4}>
        <Grid item xs={12}>
          <ValuationMetrics />
        </Grid>
        <Grid item xs={12}>
          <ValuationModels />
        </Grid>
        <Grid item xs={12}>
          <FinancialStatements />
        </Grid>
      </Grid>
    </Box>
  );
}

export default StockAnalysisDashboard; 
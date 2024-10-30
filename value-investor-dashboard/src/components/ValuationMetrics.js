import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  CircularProgress,
  Alert,
  Tooltip,
} from '@mui/material';
import { useStock } from '../contexts/StockContext';

function ValuationMetrics() {
  const { stockData, loading, error } = useStock();

  const formatMetric = (value) => {
    if (!value || isNaN(value)) return '-';
    return parseFloat(value).toFixed(2);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" my={4}>
        <CircularProgress size={60} thickness={4} />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ borderRadius: 4, fontSize: '1.1rem' }}>
        {error}
      </Alert>
    );
  }

  if (!stockData) {
    return (
      <Alert severity="info" sx={{ borderRadius: 4, fontSize: '1.1rem' }}>
        Please select a stock to view valuation metrics
      </Alert>
    );
  }

  const metrics = [
    {
      label: 'P/E Ratio',
      value: formatMetric(stockData.overview.PERatio),
      description: 'Price to Earnings Ratio - measures the price relative to earnings',
    },
    {
      label: 'P/B Ratio',
      value: formatMetric(stockData.overview.PriceToBookRatio),
      description: 'Price to Book Ratio - measures the price relative to book value',
    },
    {
      label: 'EV/EBITDA',
      value: formatMetric(stockData.overview.EVToEBITDA),
      description: 'Enterprise Value to EBITDA - measures the total value relative to earnings before interest, taxes, depreciation, and amortization',
    },
    {
      label: 'P/S Ratio',
      value: formatMetric(stockData.overview.PriceToSalesRatio),
      description: 'Price to Sales Ratio - measures the price relative to revenue',
    },
    {
      label: 'PEG Ratio',
      value: formatMetric(stockData.overview.PEGRatio),
      description: 'Price/Earnings to Growth Ratio - measures the P/E ratio relative to growth',
    },
    {
      label: 'Dividend Yield',
      value: formatMetric(stockData.overview.DividendYield * 100) + '%',
      description: 'Annual dividend payments relative to stock price',
    },
  ];

  return (
    <Card
      elevation={0}
      sx={{
        background: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(108, 99, 255, 0.1)',
      }}
    >
      <CardContent>
        <Typography variant="h5" gutterBottom fontWeight={700}>
          Valuation Metrics
        </Typography>

        <Grid container spacing={2}>
          {metrics.map((metric) => (
            <Grid item xs={12} sm={6} key={metric.label}>
              <Tooltip title={metric.description} arrow placement="top">
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    border: '1px solid rgba(108, 99, 255, 0.1)',
                    background: 'rgba(255, 255, 255, 0.5)',
                  }}
                >
                  <Typography variant="subtitle1" fontWeight={600}>
                    {metric.label}
                  </Typography>
                  <Typography variant="h4" color="primary" fontWeight={700}>
                    {metric.value}
                  </Typography>
                </Box>
              </Tooltip>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
}

export default ValuationMetrics;
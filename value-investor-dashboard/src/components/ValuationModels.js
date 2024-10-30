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

function ValuationModels() {
  const { stockData, loading, error } = useStock();

  const calculateIntrinsicValue = () => {
    if (!stockData?.income?.[0] || !stockData?.overview) return null;

    try {
      const latestIncome = stockData.income[0];
      const eps = parseFloat(stockData.overview.EPS) || 0;
      const currentPrice = parseFloat(stockData.overview.Price) || 0;
      
      if (eps <= 0 || currentPrice <= 0) return null;

      // Graham's Number (Modified for stability)
      const bookValue = parseFloat(stockData.overview.BookValue) || 0;
      const grahamValue = bookValue > 0 ? 
        Math.sqrt(22.5 * Math.max(eps, 0) * bookValue) : 
        eps * Math.sqrt(22.5);

      // Lynch Value
      const growthRate = calculateGrowthRate();
      const lynchValue = growthRate > 0 ? 
        (eps * (1 + growthRate) * Math.min(25, growthRate * 2)) : 
        eps * 15; // Default P/E of 15 if no growth

      // DCF Value
      const fcf = calculateFreeCashFlow(latestIncome);
      const dcfValue = fcf > 0 ? calculateSimplifiedDCF(fcf) : null;

      // Calculate per-share values
      const sharesOutstanding = parseFloat(stockData.overview.SharesOutstanding) || 1;
      
      return {
        graham: grahamValue > 0 ? grahamValue : null,
        lynch: lynchValue > 0 ? lynchValue : null,
        dcf: dcfValue && dcfValue > 0 ? dcfValue / sharesOutstanding : null,
        currentPrice
      };
    } catch (err) {
      console.error('Error calculating intrinsic values:', err);
      return null;
    }
  };

  const calculateGrowthRate = () => {
    if (!stockData?.income || stockData.income.length < 2) return 0;
    
    const revenues = stockData.income
      .slice(0, 3) // Use last 3 years
      .map(period => parseFloat(period.totalRevenue))
      .filter(rev => !isNaN(rev) && rev > 0);

    if (revenues.length < 2) return 0;

    // Calculate average annual growth rate
    const growthRates = [];
    for (let i = 0; i < revenues.length - 1; i++) {
      growthRates.push((revenues[i] - revenues[i + 1]) / revenues[i + 1]);
    }

    return (growthRates.reduce((a, b) => a + b, 0) / growthRates.length) || 0;
  };

  const calculateFreeCashFlow = (income) => {
    if (!income?.operatingIncome) return 0;
    
    const operatingIncome = parseFloat(income.operatingIncome);
    if (isNaN(operatingIncome) || operatingIncome <= 0) return 0;
    
    const taxRate = 0.21; // Assumed corporate tax rate
    const depreciation = parseFloat(income.depreciation) || 0;
    const capex = parseFloat(income.capitalExpenditures) || 0;
    
    return (operatingIncome * (1 - taxRate)) + depreciation - Math.abs(capex);
  };

  const calculateSimplifiedDCF = (fcf) => {
    if (fcf <= 0) return null;

    const growthRate = Math.min(Math.max(calculateGrowthRate(), 0.02), 0.15); // Between 2% and 15%
    const discountRate = 0.10; // 10% discount rate
    const terminalGrowthRate = 0.02; // 2% terminal growth
    const years = 5;

    let presentValue = 0;
    for (let i = 1; i <= years; i++) {
      presentValue += fcf * Math.pow(1 + growthRate, i) / Math.pow(1 + discountRate, i);
    }

    const terminalValue = (fcf * Math.pow(1 + growthRate, years) * (1 + terminalGrowthRate)) /
      (discountRate - terminalGrowthRate);
    const terminalPV = terminalValue / Math.pow(1 + discountRate, years);

    return presentValue + terminalPV;
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
        Please select a stock to view valuation models
      </Alert>
    );
  }

  const valuations = calculateIntrinsicValue();

  if (!valuations) {
    return (
      <Alert severity="warning" sx={{ borderRadius: 4, fontSize: '1.1rem' }}>
        Unable to calculate valuations. Some required data may be missing.
      </Alert>
    );
  }

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
          Valuation Models
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <ValuationCard
              title="Graham's Number"
              value={valuations.graham.toFixed(2)}
              upside={valuations.upside.graham}
              description="Based on Benjamin Graham's formula considering EPS and Book Value"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <ValuationCard
              title="Lynch Value"
              value={valuations.lynch.toFixed(2)}
              upside={valuations.upside.lynch}
              description="Based on Peter Lynch's PEG ratio approach"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <ValuationCard
              title="DCF Value"
              value={valuations.dcf.toFixed(2)}
              upside={valuations.upside.dcf}
              description="Simplified Discounted Cash Flow analysis"
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}

function ValuationCard({ title, value, upside, description }) {
  const currentPrice = parseFloat(value);
  const upsideValue = parseFloat(upside);

  return (
    <Tooltip title={description} arrow placement="top">
      <Box
        sx={{
          p: 2,
          borderRadius: 2,
          border: '1px solid rgba(108, 99, 255, 0.1)',
          background: 'rgba(255, 255, 255, 0.5)',
        }}
      >
        <Typography variant="subtitle1" fontWeight={600}>
          {title}
        </Typography>
        <Typography variant="h4" color="primary" fontWeight={700}>
          ${value}
        </Typography>
        <Typography
          variant="body2"
          color={upsideValue >= 0 ? 'success.main' : 'error.main'}
          fontWeight={500}
        >
          {upsideValue >= 0 ? '↑' : '↓'} {Math.abs(upsideValue)}% {upsideValue >= 0 ? 'Upside' : 'Downside'}
        </Typography>
      </Box>
    </Tooltip>
  );
}

export default ValuationModels;
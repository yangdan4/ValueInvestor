import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  LinearProgress,
  Stack,
  CircularProgress,
  Alert
} from '@mui/material';
import { useStock } from '../contexts/StockContext';

function QualityScore() {
  const { stockData, loading, error } = useStock();

  const calculateQualityMetrics = () => {
    if (!stockData?.income || !stockData?.balance) {
      return {
        profitabilityScore: 0,
        efficiencyScore: 0,
        financialHealthScore: 0,
        growthConsistencyScore: 0,
        capitalAllocationScore: 0
      };
    }

    const latestIncome = stockData.income[0] || {};
    const latestBalance = stockData.balance[0] || {};

    // Calculate profitability metrics
    const profitabilityScore = calculateProfitabilityScore(latestIncome);
    const efficiencyScore = calculateEfficiencyScore(latestIncome, latestBalance);
    const financialHealthScore = calculateFinancialHealthScore(latestBalance);
    const growthConsistencyScore = calculateGrowthConsistencyScore(stockData.income);
    const capitalAllocationScore = calculateCapitalAllocationScore(stockData.income, stockData.balance);

    return {
      profitabilityScore,
      efficiencyScore,
      financialHealthScore,
      growthConsistencyScore,
      capitalAllocationScore
    };
  };

  const calculateProfitabilityScore = (income) => {
    if (!income?.totalRevenue) return 0;

    const grossMargin = income.grossProfit && income.totalRevenue
      ? (parseFloat(income.grossProfit) / parseFloat(income.totalRevenue)) * 100
      : 0;

    const operatingMargin = income.operatingIncome && income.totalRevenue
      ? (parseFloat(income.operatingIncome) / parseFloat(income.totalRevenue)) * 100
      : 0;

    const netMargin = income.netIncome && income.totalRevenue
      ? (parseFloat(income.netIncome) / parseFloat(income.totalRevenue)) * 100
      : 0;

    // Score based on margins (0-100)
    return Math.min(
      ((grossMargin / 40) + (operatingMargin / 20) + (netMargin / 15)) * 20,
      100
    );
  };

  const calculateEfficiencyScore = (income, balance) => {
    if (!income?.totalRevenue || !balance?.totalAssets) return 0;

    const assetTurnover = parseFloat(income.totalRevenue) / parseFloat(balance.totalAssets);
    const receivablesTurnover = balance.currentNetReceivables
      ? parseFloat(income.totalRevenue) / parseFloat(balance.currentNetReceivables)
      : 0;

    // Score based on turnover ratios (0-100)
    return Math.min(
      ((assetTurnover / 2) + (receivablesTurnover / 8)) * 50,
      100
    );
  };

  const calculateFinancialHealthScore = (balance) => {
    if (!balance?.totalCurrentAssets || !balance?.totalCurrentLiabilities) return 0;

    const currentRatio = parseFloat(balance.totalCurrentAssets) / parseFloat(balance.totalCurrentLiabilities);
    const debtToEquity = balance.totalShareholderEquity && balance.totalLiabilities
      ? parseFloat(balance.totalLiabilities) / parseFloat(balance.totalShareholderEquity)
      : 0;

    // Score based on financial ratios (0-100)
    return Math.min(
      ((currentRatio / 3) * 50) + (Math.max(0, (2 - debtToEquity) / 2) * 50),
      100
    );
  };

  const calculateGrowthConsistencyScore = (incomeStatements) => {
    if (!incomeStatements || incomeStatements.length < 2) return 0;

    const revenues = incomeStatements
      .map(statement => parseFloat(statement.totalRevenue))
      .filter(revenue => !isNaN(revenue));

    if (revenues.length < 2) return 0;

    // Calculate year-over-year growth rates
    const growthRates = [];
    for (let i = 1; i < revenues.length; i++) {
      const growthRate = ((revenues[i-1] - revenues[i]) / revenues[i]) * 100;
      growthRates.push(growthRate);
    }

    // Calculate growth consistency score based on standard deviation of growth rates
    const avgGrowth = growthRates.reduce((a, b) => a + b, 0) / growthRates.length;
    const variance = growthRates.reduce((a, b) => a + Math.pow(b - avgGrowth, 2), 0) / growthRates.length;
    const stdDev = Math.sqrt(variance);

    // Lower standard deviation = more consistent growth = higher score
    return Math.min(Math.max(100 - (stdDev * 2), 0), 100);
  };

  const calculateCapitalAllocationScore = (income, balance) => {
    if (!income?.[0] || !balance?.[0]) return 0;

    const latestIncome = income[0];
    const latestBalance = balance[0];

    const returnOnEquity = latestIncome.netIncome && latestBalance.totalShareholderEquity
      ? (parseFloat(latestIncome.netIncome) / parseFloat(latestBalance.totalShareholderEquity)) * 100
      : 0;

    const returnOnAssets = latestIncome.netIncome && latestBalance.totalAssets
      ? (parseFloat(latestIncome.netIncome) / parseFloat(latestBalance.totalAssets)) * 100
      : 0;

    // Score based on returns (0-100)
    return Math.min(
      (returnOnEquity / 20) * 50 + (returnOnAssets / 10) * 50,
      100
    );
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
        Please select a stock to view quality metrics
      </Alert>
    );
  }

  const metrics = calculateQualityMetrics();
  const overallScore = Object.values(metrics).reduce((a, b) => a + b, 0) / 5;

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
          Quality Score Analysis
        </Typography>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h3" color="primary" fontWeight={800} gutterBottom>
            {Math.round(overallScore)}/100
          </Typography>
          <LinearProgress
            variant="determinate"
            value={overallScore}
            sx={{
              height: 10,
              borderRadius: 5,
              backgroundColor: 'rgba(108, 99, 255, 0.1)',
              '& .MuiLinearProgress-bar': {
                background: 'linear-gradient(45deg, #6C63FF 30%, #4ECDC4 90%)',
              },
            }}
          />
        </Box>

        <Grid container spacing={3}>
          {Object.entries(metrics).map(([key, value]) => (
            <Grid item xs={12} sm={6} key={key}>
              <QualityMetricCard
                title={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                value={Math.round(value)}
              />
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
}

function QualityMetricCard({ title, value }) {
  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 2,
        border: '1px solid rgba(108, 99, 255, 0.1)',
        background: 'rgba(255, 255, 255, 0.5)',
      }}
    >
      <Typography variant="subtitle1" fontWeight={600} gutterBottom>
        {title}
      </Typography>
      <Stack direction="row" spacing={2} alignItems="center">
        <Typography variant="h5" color="primary" fontWeight={700}>
          {value}/100
        </Typography>
        <LinearProgress
          variant="determinate"
          value={value}
          sx={{
            flex: 1,
            height: 8,
            borderRadius: 4,
            backgroundColor: 'rgba(108, 99, 255, 0.1)',
            '& .MuiLinearProgress-bar': {
              background: 'linear-gradient(45deg, #6C63FF 30%, #4ECDC4 90%)',
            },
          }}
        />
      </Stack>
    </Box>
  );
}

export default QualityScore;
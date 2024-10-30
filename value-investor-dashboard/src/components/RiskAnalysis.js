import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  CircularProgress,
  Alert,
  LinearProgress,
  Tooltip,
  Divider,
  Stack, // Added Stack import
} from '@mui/material';
import { useStock } from '../contexts/StockContext';


function RiskAnalysis() {
  const { stockData, loading, error } = useStock();
  const [riskMetrics, setRiskMetrics] = useState(null);

  useEffect(() => {
    if (stockData?.income?.[0] && stockData?.balance?.[0]) {
      calculateRiskMetrics();
    }
  }, [stockData]);

  const calculateRiskMetrics = () => {
    try {
      const latestIncome = stockData.income[0];
      const latestBalance = stockData.balance[0];
      const overview = stockData.overview;

      // Financial Stability Metrics
      const currentRatio = latestBalance.totalCurrentAssets && latestBalance.totalCurrentLiabilities
        ? parseFloat(latestBalance.totalCurrentAssets) / parseFloat(latestBalance.totalCurrentLiabilities)
        : 0;

      const debtToEquity = latestBalance.totalLiabilities && latestBalance.totalShareholderEquity
        ? parseFloat(latestBalance.totalLiabilities) / parseFloat(latestBalance.totalShareholderEquity)
        : 0;

      const interestCoverage = latestIncome.operatingIncome && latestIncome.interestExpense
        ? parseFloat(latestIncome.operatingIncome) / Math.abs(parseFloat(latestIncome.interestExpense))
        : 0;

      // Market Risk Metrics
      const beta = parseFloat(overview.Beta) || 0;
      const volatility = beta * 15; // Simplified volatility estimation

      // Business Risk Metrics
      const operatingMargin = latestIncome.operatingIncome && latestIncome.totalRevenue
        ? (parseFloat(latestIncome.operatingIncome) / parseFloat(latestIncome.totalRevenue)) * 100
        : 0;

      const revenueGrowthVolatility = calculateRevenueGrowthVolatility();

      setRiskMetrics({
        financial: {
          score: calculateFinancialRiskScore(currentRatio, debtToEquity, interestCoverage),
          metrics: {
            currentRatio,
            debtToEquity,
            interestCoverage,
          }
        },
        market: {
          score: calculateMarketRiskScore(beta, volatility),
          metrics: {
            beta,
            volatility,
          }
        },
        business: {
          score: calculateBusinessRiskScore(operatingMargin, revenueGrowthVolatility),
          metrics: {
            operatingMargin,
            revenueGrowthVolatility,
          }
        }
      });
    } catch (err) {
      console.error('Error calculating risk metrics:', err);
    }
  };

  const calculateRevenueGrowthVolatility = () => {
    if (!stockData?.income || stockData.income.length < 3) return 0;

    const growthRates = [];
    for (let i = 0; i < stockData.income.length - 1; i++) {
      const currentRevenue = parseFloat(stockData.income[i].totalRevenue);
      const previousRevenue = parseFloat(stockData.income[i + 1].totalRevenue);
      if (currentRevenue && previousRevenue) {
        growthRates.push((currentRevenue - previousRevenue) / previousRevenue * 100);
      }
    }

    if (growthRates.length === 0) return 0;

    const mean = growthRates.reduce((a, b) => a + b, 0) / growthRates.length;
    const variance = growthRates.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / growthRates.length;
    return Math.sqrt(variance);
  };

  const calculateFinancialRiskScore = (currentRatio, debtToEquity, interestCoverage) => {
    let score = 100;

    // Current Ratio scoring (lower is riskier)
    if (currentRatio < 1) score -= 30;
    else if (currentRatio < 1.5) score -= 20;
    else if (currentRatio < 2) score -= 10;

    // Debt to Equity scoring (higher is riskier)
    if (debtToEquity > 2) score -= 30;
    else if (debtToEquity > 1.5) score -= 20;
    else if (debtToEquity > 1) score -= 10;

    // Interest Coverage scoring (lower is riskier)
    if (interestCoverage < 1.5) score -= 40;
    else if (interestCoverage < 3) score -= 30;
    else if (interestCoverage < 5) score -= 20;

    return Math.max(0, score);
  };

  const calculateMarketRiskScore = (beta, volatility) => {
    let score = 100;

    // Beta scoring (higher is riskier)
    if (beta > 2) score -= 40;
    else if (beta > 1.5) score -= 30;
    else if (beta > 1.2) score -= 20;
    else if (beta > 1) score -= 10;

    // Volatility scoring (higher is riskier)
    if (volatility > 30) score -= 40;
    else if (volatility > 20) score -= 30;
    else if (volatility > 15) score -= 20;
    else if (volatility > 10) score -= 10;

    return Math.max(0, score);
  };

  const calculateBusinessRiskScore = (operatingMargin, revenueVolatility) => {
    let score = 100;

    // Operating Margin scoring (lower is riskier)
    if (operatingMargin < 5) score -= 40;
    else if (operatingMargin < 10) score -= 30;
    else if (operatingMargin < 15) score -= 20;
    else if (operatingMargin < 20) score -= 10;

    // Revenue Volatility scoring (higher is riskier)
    if (revenueVolatility > 20) score -= 40;
    else if (revenueVolatility > 15) score -= 30;
    else if (revenueVolatility > 10) score -= 20;
    else if (revenueVolatility > 5) score -= 10;

    return Math.max(0, score);
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
        Please select a stock to view risk analysis
      </Alert>
    );
  }

  if (!riskMetrics) {
    return (
      <Alert severity="warning" sx={{ borderRadius: 4, fontSize: '1.1rem' }}>
        Unable to calculate risk metrics. Some required data may be missing.
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
          Risk Analysis
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <RiskCard
              title="Financial Risk"
              score={riskMetrics.financial.score}
              metrics={[
                {
                  label: 'Current Ratio',
                  value: riskMetrics.financial.metrics.currentRatio.toFixed(2),
                  tooltip: 'Measures ability to pay short-term obligations',
                },
                {
                  label: 'Debt to Equity',
                  value: riskMetrics.financial.metrics.debtToEquity.toFixed(2),
                  tooltip: 'Measures financial leverage',
                },
                {
                  label: 'Interest Coverage',
                  value: riskMetrics.financial.metrics.interestCoverage.toFixed(2),
                  tooltip: 'Measures ability to pay interest on debt',
                },
              ]}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <RiskCard
              title="Market Risk"
              score={riskMetrics.market.score}
              metrics={[
                {
                  label: 'Beta',
                  value: riskMetrics.market.metrics.beta.toFixed(2),
                  tooltip: 'Measures stock volatility relative to market',
                },
                {
                  label: 'Volatility',
                  value: `${riskMetrics.market.metrics.volatility.toFixed(2)}%`,
                  tooltip: 'Measures price fluctuation',
                },
              ]}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <RiskCard
              title="Business Risk"
              score={riskMetrics.business.score}
              metrics={[
                {
                  label: 'Operating Margin',
                  value: `${riskMetrics.business.metrics.operatingMargin.toFixed(2)}%`,
                  tooltip: 'Measures operational efficiency',
                },
                {
                  label: 'Revenue Volatility',
                  value: `${riskMetrics.business.metrics.revenueGrowthVolatility.toFixed(2)}%`,
                  tooltip: 'Measures revenue stability',
                },
              ]}
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}

function RiskCard({ title, score, metrics }) {
  const getRiskLevel = (score) => {
    if (score >= 80) return { level: 'Low Risk', color: '#4caf50' };
    if (score >= 60) return { level: 'Moderate Risk', color: '#ff9800' };
    return { level: 'High Risk', color: '#f44336' };
  };

  const riskLevel = getRiskLevel(score);

  return (
    <Card
      elevation={0}
      sx={{
        height: '100%',
        background: 'rgba(255, 255, 255, 0.5)',
        border: '1px solid rgba(108, 99, 255, 0.1)',
      }}
    >
      <CardContent>
        <Typography variant="h6" gutterBottom fontWeight={600}>
          {title}
        </Typography>

        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" color="primary" fontWeight={700}>
            {score}/100
          </Typography>
          <Typography color={riskLevel.color} fontWeight={500}>
            {riskLevel.level}
          </Typography>
          <LinearProgress
            variant="determinate"
            value={score}
            sx={{
              mt: 1,
              height: 8,
              borderRadius: 4,
              backgroundColor: 'rgba(108, 99, 255, 0.1)',
              '& .MuiLinearProgress-bar': {
                backgroundColor: riskLevel.color,
              },
            }}
          />
        </Box>

        <Divider sx={{ my: 2 }} />

        <Stack spacing={2}>
          {metrics.map((metric, index) => (
            <Tooltip key={index} title={metric.tooltip} arrow placement="top">
              <Box>
                <Typography variant="body2" color="text.secondary">
                  {metric.label}
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  {metric.value}
                </Typography>
              </Box>
            </Tooltip>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}

export default RiskAnalysis; 
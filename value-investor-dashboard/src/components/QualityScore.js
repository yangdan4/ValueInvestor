import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Stack,
  LinearProgress,
  Tooltip,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';
import { useStock } from '../contexts/StockContext';
function QualityScore() {
  const { stockData } = useStock();
  const calculateQualityMetrics = () => {
    const financials = stockData.financials;
    const balanceSheet = stockData.balanceSheet;

    // Calculate key quality indicators
    const profitabilityScore = calculateProfitabilityScore(financials);
    const efficiencyScore = calculateEfficiencyScore(financials, balanceSheet);
    const financialHealthScore = calculateFinancialHealthScore(balanceSheet);
    const growthConsistencyScore = calculateGrowthConsistencyScore(financials);
    const capitalAllocationScore = calculateCapitalAllocationScore(financials, balanceSheet);

    return {
      profitabilityScore,
      efficiencyScore,
      financialHealthScore,
      growthConsistencyScore,
      capitalAllocationScore,
    };
  };

  const calculateProfitabilityScore = (financials) => {
    const grossMargin = (financials[0].grossProfit / financials[0].revenue) * 100;
    const operatingMargin = (financials[0].operatingIncome / financials[0].revenue) * 100;
    const netMargin = (financials[0].netIncome / financials[0].revenue) * 100;

    return (grossMargin + operatingMargin + netMargin) / 3;
  };

  const calculateEfficiencyScore = (financials, balanceSheet) => {
    const assetTurnover = financials[0].revenue / balanceSheet[0].totalAssets;
    const inventoryTurnover = financials[0].costOfRevenue / balanceSheet[0].inventory;
    
    return ((assetTurnover / 2) + (inventoryTurnover / 10)) * 50;
  };

  const calculateFinancialHealthScore = (balanceSheet) => {
    const currentRatio = balanceSheet[0].totalCurrentAssets / balanceSheet[0].totalCurrentLiabilities;
    const debtToEquity = balanceSheet[0].totalDebt / balanceSheet[0].totalStockholdersEquity;
    
    const currentRatioScore = Math.min(currentRatio * 25, 50);
    const debtScore = Math.max(50 - (debtToEquity * 25), 0);
    
    return (currentRatioScore + debtScore) / 2;
  };

  const calculateGrowthConsistencyScore = (financials) => {
    const revenueGrowthRates = [];
    const earningsGrowthRates = [];

    for (let i = 1; i < financials.length; i++) {
      const revGrowth = ((financials[i-1].revenue - financials[i].revenue) / financials[i].revenue) * 100;
      const earnGrowth = ((financials[i-1].netIncome - financials[i].netIncome) / financials[i].netIncome) * 100;
      
      revenueGrowthRates.push(revGrowth);
      earningsGrowthRates.push(earnGrowth);
    }

    const revStdDev = calculateStandardDeviation(revenueGrowthRates);
    const earnStdDev = calculateStandardDeviation(earningsGrowthRates);

    return Math.max(100 - ((revStdDev + earnStdDev) / 2), 0);
  };

  const calculateCapitalAllocationScore = (financials, balanceSheet) => {
    const roic = (financials[0].operatingIncome * (1 - 0.21)) /
                (balanceSheet[0].totalStockholdersEquity + balanceSheet[0].totalDebt - balanceSheet[0].cashAndCashEquivalents);
    const payoutRatio = financials[0].dividendsPaid / financials[0].netIncome;
    
    const roicScore = Math.min(roic * 5, 50);
    const payoutScore = Math.min((payoutRatio * 100) / 2, 50);
    
    return roicScore + payoutScore;
  };

  const calculateStandardDeviation = (values) => {
    const mean = values.reduce((a, b) => a + b) / values.length;
    const squareDiffs = values.map(value => Math.pow(value - mean, 2));
    const avgSquareDiff = squareDiffs.reduce((a, b) => a + b) / squareDiffs.length;
    return Math.sqrt(avgSquareDiff);
  };

  const metrics = calculateQualityMetrics();

  const overallScore = Math.round(
    (metrics.profitabilityScore +
     metrics.efficiencyScore +
     metrics.financialHealthScore +
     metrics.growthConsistencyScore +
     metrics.capitalAllocationScore) / 5
  );

  const barData = [
    { name: 'Profitability', score: metrics.profitabilityScore },
    { name: 'Efficiency', score: metrics.efficiencyScore },
    { name: 'Financial Health', score: metrics.financialHealthScore },
    { name: 'Growth Consistency', score: metrics.growthConsistencyScore },
    { name: 'Capital Allocation', score: metrics.capitalAllocationScore },
  ];

  return (
    <Stack spacing={4}>
      <Paper
        elevation={0}
        sx={{
          p: 4,
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(108, 99, 255, 0.1)',
        }}
      >
        <Typography variant="h5" gutterBottom fontWeight={700}>
          Quality Score Analysis
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card
              elevation={0}
              sx={{
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(108, 99, 255, 0.1)',
              }}
            >
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Overall Quality Score
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h3" color="primary" fontWeight={800} sx={{ mr: 2 }}>
                    {overallScore}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    / 100
                  </Typography>
                </Box>
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
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={8}>
            <Card
              elevation={0}
              sx={{
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(108, 99, 255, 0.1)',
                height: '100%',
              }}
            >
              <CardContent>
                <Typography variant="h6" gutterBottom fontWeight={700}>
                  Quality Metrics Breakdown
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={barData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis domain={[0, 100]} />
                    <Bar
                      dataKey="score"
                      fill="#6C63FF"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card
              elevation={0}
              sx={{
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(108, 99, 255, 0.1)',
              }}
            >
              <CardContent>
                <Typography variant="h6" gutterBottom fontWeight={700}>
                  Detailed Metrics
                </Typography>
                <Grid container spacing={2}>
                  {Object.entries(metrics).map(([key, value]) => (
                    <Grid item xs={12} sm={6} md={4} key={key}>
                      <Tooltip title={getMetricDescription(key)} arrow>
                        <Box>
                          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                            {formatMetricName(key)}
                          </Typography>
                          <LinearProgress
                            variant="determinate"
                            value={value}
                            sx={{
                              height: 8,
                              borderRadius: 4,
                              backgroundColor: 'rgba(108, 99, 255, 0.1)',
                              '& .MuiLinearProgress-bar': {
                                background: 'linear-gradient(45deg, #6C63FF 30%, #4ECDC4 90%)',
                              },
                            }}
                          />
                          <Typography variant="body2" sx={{ mt: 0.5 }}>
                            {Math.round(value)}/100
                          </Typography>
                        </Box>
                      </Tooltip>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>
    </Stack>
  );
}

const formatMetricName = (key) => {
  return key
    .replace('Score', '')
    .split(/(?=[A-Z])/)
    .join(' ');
};

const getMetricDescription = (key) => {
  const descriptions = {
    profitabilityScore: 'Measures the company\'s ability to generate profits from its operations',
    efficiencyScore: 'Evaluates how effectively the company uses its assets and resources',
    financialHealthScore: 'Assesses the company\'s financial stability and debt management',
    growthConsistencyScore: 'Measures the stability and predictability of growth over time',
    capitalAllocationScore: 'Evaluates how well management deploys capital for future growth',
  };
  return descriptions[key];
};

export default QualityScore;
import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Stack,
  Rating,
  Divider,
  LinearProgress,
} from '@mui/material';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts';
import { useStock } from '../contexts/StockContext';
function MoatAnalysis() {
  const { stockData } = useStock();
  const calculateMoatMetrics = () => {
    const financials = stockData.financials;
    const balanceSheet = stockData.balanceSheet;

    // Calculate key moat indicators
    const grossMargin = (financials[0].grossProfit / financials[0].revenue) * 100;
    const operatingMargin = (financials[0].operatingIncome / financials[0].revenue) * 100;
    const roic = calculateROIC(financials[0], balanceSheet[0]);
    const marketShare = calculateMarketShare(stockData.overview);
    const brandStrength = assessBrandStrength(stockData.overview);
    const switchingCosts = assessSwitchingCosts(stockData.overview);

    return {
      grossMargin,
      operatingMargin,
      roic,
      marketShare,
      brandStrength,
      switchingCosts,
    };
  };

  const calculateROIC = (income, balance) => {
    const nopat = income.operatingIncome * (1 - 0.21); // Assuming 21% tax rate
    const investedCapital = balance.totalStockholdersEquity + balance.totalDebt - balance.cashAndCashEquivalents;
    return (nopat / investedCapital) * 100;
  };

  const calculateMarketShare = (overview) => {
    // This would typically require industry data
    // For now, using a simplified calculation based on market cap
    const marketCap = parseFloat(overview.MarketCapitalization);
    return marketCap > 100000000000 ? 5 :
           marketCap > 50000000000 ? 4 :
           marketCap > 10000000000 ? 3 :
           marketCap > 1000000000 ? 2 : 1;
  };

  const assessBrandStrength = (overview) => {
    // Simplified brand strength assessment based on company age and market position
    const age = new Date().getFullYear() - parseInt(overview.IPOYear || 2000);
    return age > 50 ? 5 :
           age > 30 ? 4 :
           age > 20 ? 3 :
           age > 10 ? 2 : 1;
  };

  const assessSwitchingCosts = (overview) => {
    // Simplified switching costs assessment based on sector
    const sector = overview.Sector;
    return sector === 'Technology' || sector === 'Healthcare' ? 4 :
           sector === 'Financial Services' || sector === 'Industrials' ? 3 : 2;
  };

  const metrics = calculateMoatMetrics();

  const radarData = [
    { metric: 'Gross Margin', value: metrics.grossMargin },
    { metric: 'Operating Margin', value: metrics.operatingMargin },
    { metric: 'ROIC', value: metrics.roic },
    { metric: 'Market Share', value: metrics.marketShare * 20 }, // Scale to 100
    { metric: 'Brand Strength', value: metrics.brandStrength * 20 }, // Scale to 100
    { metric: 'Switching Costs', value: metrics.switchingCosts * 20 }, // Scale to 100
  ];

  const moatStrength = Math.round((
    metrics.grossMargin +
    metrics.operatingMargin +
    metrics.roic +
    (metrics.marketShare * 20) +
    (metrics.brandStrength * 20) +
    (metrics.switchingCosts * 20)
  ) / 6);

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
          Economic Moat Analysis
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
                  Overall Moat Strength
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h3" color="primary" fontWeight={800} sx={{ mr: 2 }}>
                    {moatStrength}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    / 100
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={moatStrength}
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
                  Moat Characteristics
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="metric" />
                    <PolarRadiusAxis domain={[0, 100]} />
                    <Radar
                      name="Moat Metrics"
                      dataKey="value"
                      stroke="#6C63FF"
                      fill="#6C63FF"
                      fillOpacity={0.5}
                    />
                  </RadarChart>
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
                  Detailed Analysis
                </Typography>
                <Stack spacing={3}>
                  {[
                    { label: 'Market Position', rating: metrics.marketShare, description: 'Based on market capitalization and industry position' },
                    { label: 'Brand Value', rating: metrics.brandStrength, description: 'Evaluated from company history and market presence' },
                    { label: 'Switching Costs', rating: metrics.switchingCosts, description: 'Assessment of customer lock-in and integration complexity' },
                  ].map((item, index) => (
                    <Box key={index}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="subtitle1" fontWeight={600}>
                          {item.label}
                        </Typography>
                        <Rating value={item.rating} readOnly />
                      </Stack>
                      <Typography variant="body2" color="text.secondary">
                        {item.description}
                      </Typography>
                      {index < 2 && <Divider sx={{ mt: 2 }} />}
                    </Box>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>
    </Stack>
  );
}

export default MoatAnalysis;
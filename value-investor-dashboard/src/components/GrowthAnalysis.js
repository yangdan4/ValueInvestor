import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Stack,
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useStock } from '../contexts/StockContext';
function GrowthAnalysis() {
  const { stockData } = useStock();

  const calculateGrowthMetrics = () => {
    if (!stockData?.financials || !Array.isArray(stockData.financials) || stockData.financials.length < 5) {
      return {
        revenueData: [],
        metrics: {
          revenueGrowth: 0,
          earningsGrowth: 0,
          cashFlowGrowth: 0
        }
      };
    }

    const financials = stockData.financials;
    const revenueData = financials.map(period => ({
      date: new Date(period.date).toLocaleDateString(),
      revenue: period.revenue / 1000000,
      netIncome: period.netIncome / 1000000,
      operatingCashFlow: period.operatingCashFlow / 1000000,
    })).reverse();

    const metrics = {
      revenueGrowth: calculateCAGR(financials[4].revenue, financials[0].revenue, 4),
      earningsGrowth: calculateCAGR(financials[4].netIncome, financials[0].netIncome, 4),
      cashFlowGrowth: calculateCAGR(financials[4].operatingCashFlow, financials[0].operatingCashFlow, 4),
    };

    return { revenueData, metrics };
  };

  const calculateCAGR = (beginningValue, endingValue, years) => {
    return ((Math.pow(endingValue / beginningValue, 1 / years) - 1) * 100).toFixed(2);
  };

  const { revenueData, metrics } = calculateGrowthMetrics();

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
          Growth Analysis
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
                  Revenue CAGR (5Y)
                </Typography>
                <Typography variant="h4" color="primary" fontWeight={800}>
                  {metrics.revenueGrowth}%
                </Typography>
              </CardContent>
            </Card>
          </Grid>

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
                  Earnings CAGR (5Y)
                </Typography>
                <Typography variant="h4" color="primary" fontWeight={800}>
                  {metrics.earningsGrowth}%
                </Typography>
              </CardContent>
            </Card>
          </Grid>

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
                  Cash Flow CAGR (5Y)
                </Typography>
                <Typography variant="h4" color="primary" fontWeight={800}>
                  {metrics.cashFlowGrowth}%
                </Typography>
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
                height: 400,
              }}
            >
              <CardContent>
                <Typography variant="h6" gutterBottom fontWeight={700}>
                  Historical Growth Trends
                </Typography>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      name="Revenue"
                      stroke="#6C63FF"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="netIncome"
                      name="Net Income"
                      stroke="#4ECDC4"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="operatingCashFlow"
                      name="Operating Cash Flow"
                      stroke="#FF6B6B"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>
    </Stack>
  );
}

export default GrowthAnalysis;
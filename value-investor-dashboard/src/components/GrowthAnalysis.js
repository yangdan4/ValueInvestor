import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { useStock } from '../contexts/StockContext';

function GrowthAnalysis() {
  const { stockData, loading, error } = useStock();

  const calculateGrowthMetrics = () => {
    if (!stockData?.income || stockData.income.length < 2) {
      return {
        revenueData: [],
        metrics: {
          revenueGrowth: 0,
          earningsGrowth: 0,
          cashFlowGrowth: 0,
        },
      };
    }

    // Sort income statements by date in ascending order
    const sortedIncome = [...stockData.income].sort(
      (a, b) => new Date(a.fiscalDateEnding) - new Date(b.fiscalDateEnding)
    );

    // Prepare data for chart
    const revenueData = sortedIncome.map((period) => ({
      date: new Date(period.fiscalDateEnding).toLocaleDateString(),
      revenue: period.totalRevenue ? parseFloat(period.totalRevenue) / 1000000 : 0,
      netIncome: period.netIncome ? parseFloat(period.netIncome) / 1000000 : 0,
      operatingIncome: period.operatingIncome ? parseFloat(period.operatingIncome) / 1000000 : 0,
    }));

    // Calculate CAGR for different metrics
    const metrics = {
      revenueGrowth: calculateCAGR(
        parseFloat(sortedIncome[0].totalRevenue || 0),
        parseFloat(sortedIncome[sortedIncome.length - 1].totalRevenue || 0),
        sortedIncome.length - 1
      ),
      earningsGrowth: calculateCAGR(
        parseFloat(sortedIncome[0].netIncome || 0),
        parseFloat(sortedIncome[sortedIncome.length - 1].netIncome || 0),
        sortedIncome.length - 1
      ),
      operatingGrowth: calculateCAGR(
        parseFloat(sortedIncome[0].operatingIncome || 0),
        parseFloat(sortedIncome[sortedIncome.length - 1].operatingIncome || 0),
        sortedIncome.length - 1
      ),
    };

    return { revenueData, metrics };
  };

  const calculateCAGR = (beginningValue, endingValue, years) => {
    if (!beginningValue || !endingValue || beginningValue <= 0 || years <= 0) {
      return 0;
    }
    return ((Math.pow(endingValue / beginningValue, 1 / years) - 1) * 100).toFixed(2);
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
        Please select a stock to view growth analysis
      </Alert>
    );
  }

  const { revenueData, metrics } = calculateGrowthMetrics();

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
          Growth Analysis
        </Typography>

        <Grid container spacing={4}>
          <Grid item xs={12}>
            <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'rgba(255, 255, 255, 0.5)' }}>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                Historical Growth Trends
              </Typography>
              <Box sx={{ height: 400 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip
                      formatter={(value) => [`$${value.toFixed(2)}M`, '']}
                      labelStyle={{ color: 'black' }}
                    />
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
                      dataKey="operatingIncome"
                      name="Operating Income"
                      stroke="#FF6B6B"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <GrowthMetricCard
                  title="Revenue Growth (CAGR)"
                  value={metrics.revenueGrowth}
                  description="Compound Annual Growth Rate of Revenue"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <GrowthMetricCard
                  title="Earnings Growth (CAGR)"
                  value={metrics.earningsGrowth}
                  description="Compound Annual Growth Rate of Net Income"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <GrowthMetricCard
                  title="Operating Income Growth (CAGR)"
                  value={metrics.operatingGrowth}
                  description="Compound Annual Growth Rate of Operating Income"
                />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}

function GrowthMetricCard({ title, value, description }) {
  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 2,
        border: '1px solid rgba(108, 99, 255, 0.1)',
        background: 'rgba(255, 255, 255, 0.5)',
        height: '100%',
      }}
    >
      <Typography variant="subtitle1" fontWeight={600}>
        {title}
      </Typography>
      <Typography variant="h4" color="primary" fontWeight={700} gutterBottom>
        {value}%
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {description}
      </Typography>
    </Box>
  );
}

export default GrowthAnalysis;
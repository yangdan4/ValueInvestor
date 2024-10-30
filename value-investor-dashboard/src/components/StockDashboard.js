import React from 'react';
import {
  Box,
  Paper,
  Grid,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Stack,
  useTheme,
} from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useStock } from '../contexts/StockContext';
const formatNumber = (num) => {
  if (!num) return 'N/A';
  if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
  if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
  return `$${num.toFixed(2)}`;
};
function StockDashboard() {
  const { stockData, loading, error } = useStock();
  const theme = useTheme();

  const renderMetrics = () => {
    if (!stockData?.profile) return null;

    const metrics = [
      { label: 'P/E Ratio', value: stockData.profile.pe || 'N/A', icon: '📊' },
      { label: 'Market Cap', value: formatNumber(stockData.profile.mktCap), icon: '💰' },
      { label: 'Dividend Yield', value: `${(stockData.profile.divYield || 0).toFixed(2)}%`, icon: '💎' },
      { label: 'Book Value', value: formatNumber(stockData.profile.bookValue), icon: '📚' },
      { label: 'ROE', value: `${(stockData.profile.roe || 0).toFixed(2)}%`, icon: '📈' },
      { label: 'Profit Margin', value: `${(stockData.profile.profitMargin || 0).toFixed(2)}%`, icon: '💵' },
    ];

    return (
      <Grid container spacing={3}>
        {metrics.map((metric) => (
          <Grid item xs={12} sm={6} md={4} key={metric.label}>
            <Card 
              elevation={0}
              sx={{
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(108, 99, 255, 0.1)',
              }}
            >
              <CardContent>
                <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                  <Typography variant="h4" sx={{ opacity: 0.8 }}>
                    {metric.icon}
                  </Typography>
                  <Typography variant="subtitle1" color="textSecondary" fontWeight={600}>
                    {metric.label}
                  </Typography>
                </Stack>
                <Typography variant="h5" fontWeight={700}>
                  {metric.value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
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
      <Alert 
        severity="error" 
        sx={{ 
          borderRadius: 4,
          fontSize: '1rem',
        }}
      >
        {error}
      </Alert>
    );
  }

  if (!stockData) {
    return (
      <Alert 
        severity="info" 
        sx={{ 
          borderRadius: 4,
          fontSize: '1rem',
        }}
      >
        Please select a stock to begin analysis
      </Alert>
    );
  }

  return (
    <Stack spacing={4}>
      {stockData && (
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
            <Typography variant="h4" gutterBottom fontWeight={700}>
              {stockData.overview.Name} ({stockData.overview.Symbol}) 📈
            </Typography>
            <Typography variant="body1" color="textSecondary" sx={{ fontSize: '1.1rem' }}>
              {stockData.overview.Description}
            </Typography>
          </Paper>

          <Box>{renderMetrics()}</Box>

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
              Price History 📊
            </Typography>
            <Box sx={{ height: 400, mt: 3 }}>
              <ResponsiveContainer>
                <LineChart
                  data={stockData.chartData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      borderRadius: 16,
                      border: 'none',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                    }} 
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="price" 
                    stroke={theme.palette.primary.main}
                    strokeWidth={3}
                    dot={false}
                    name="Stock Price"
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Stack>
      )}
    </Stack>
  );
}

export default StockDashboard; 
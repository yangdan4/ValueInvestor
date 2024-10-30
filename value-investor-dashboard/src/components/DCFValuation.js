import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Stack,
  TextField,
  Button,
  Slider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
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
function DCFValuation() {
const { stockData } = useStock();
  const [inputs, setInputs] = useState({
    growthRate5yr: 10,
    growthRate510yr: 5,
    terminalGrowthRate: 2.5,
    discountRate: 10,
    marginOfSafety: 25,
  });

  const [projections, setProjections] = useState(null);
  const [valuation, setValuation] = useState(null);

  useEffect(() => {
    if (stockData) {
      calculateDCF();
    }
  }, [stockData, inputs]);

  const calculateDCF = () => {
    const freeCashFlows = stockData.cashFlow
      .slice(0, 5)
      .map(period => period.freeCashFlow)
      .reverse();

    // Calculate average FCF growth rate from historical data
    const historicalGrowth = calculateHistoricalGrowth(freeCashFlows);

    // Use latest FCF as base
    const baseFCF = freeCashFlows[freeCashFlows.length - 1];

    // Project future cash flows
    const projectedCashFlows = [];
    let currentFCF = baseFCF;

    // First 5 years
    for (let i = 1; i <= 5; i++) {
      currentFCF *= (1 + inputs.growthRate5yr / 100);
      projectedCashFlows.push({
        year: i,
        fcf: currentFCF,
        discountedFCF: currentFCF / Math.pow(1 + inputs.discountRate / 100, i),
      });
    }

    // Years 6-10
    for (let i = 6; i <= 10; i++) {
      currentFCF *= (1 + inputs.growthRate510yr / 100);
      projectedCashFlows.push({
        year: i,
        fcf: currentFCF,
        discountedFCF: currentFCF / Math.pow(1 + inputs.discountRate / 100, i),
      });
    }

    // Terminal value calculation
    const terminalValue = currentFCF * (1 + inputs.terminalGrowthRate / 100) /
      (inputs.discountRate / 100 - inputs.terminalGrowthRate / 100);
    
    const discountedTerminalValue = terminalValue / 
      Math.pow(1 + inputs.discountRate / 100, 10);

    // Sum up all discounted cash flows
    const totalPV = projectedCashFlows.reduce((sum, year) => sum + year.discountedFCF, 0) +
      discountedTerminalValue;

    // Calculate per share values
    const sharesOutstanding = stockData.overview.SharesOutstanding;
    const fairValue = totalPV / sharesOutstanding;
    const safetyMargin = fairValue * (1 - inputs.marginOfSafety / 100);
    const currentPrice = stockData.overview.Price;
    const upside = ((fairValue / currentPrice) - 1) * 100;

    setProjections(projectedCashFlows);
    setValuation({
      enterpriseValue: totalPV,
      fairValue,
      safetyMargin,
      upside,
      terminalValue,
      discountedTerminalValue,
    });
  };

  const calculateHistoricalGrowth = (cashFlows) => {
    const periods = cashFlows.length - 1;
    const startValue = cashFlows[0];
    const endValue = cashFlows[cashFlows.length - 1];
    return Math.pow(endValue / startValue, 1 / periods) - 1;
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatLargeNumber = (num) => {
    if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
    return num.toFixed(2);
  };

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
        <Typography variant="h4" gutterBottom fontWeight={800}>
          DCF Valuation Model 📈
        </Typography>

        <Grid container spacing={4}>
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
                <Stack spacing={3}>
                  <Typography variant="h6" gutterBottom fontWeight={700}>
                    Model Assumptions
                  </Typography>

                  <Box>
                    <Typography gutterBottom>Growth Rate (1-5 years)</Typography>
                    <Slider
                      value={inputs.growthRate5yr}
                      onChange={(e, value) => setInputs({ ...inputs, growthRate5yr: value })}
                      min={-20}
                      max={50}
                      step={0.5}
                      valueLabelDisplay="auto"
                      valueLabelFormat={(value) => `${value}%`}
                    />
                  </Box>

                  <Box>
                    <Typography gutterBottom>Growth Rate (6-10 years)</Typography>
                    <Slider
                      value={inputs.growthRate510yr}
                      onChange={(e, value) => setInputs({ ...inputs, growthRate510yr: value })}
                      min={-10}
                      max={30}
                      step={0.5}
                      valueLabelDisplay="auto"
                      valueLabelFormat={(value) => `${value}%`}
                    />
                  </Box>

                  <Box>
                    <Typography gutterBottom>Terminal Growth Rate</Typography>
                    <Slider
                      value={inputs.terminalGrowthRate}
                      onChange={(e, value) => setInputs({ ...inputs, terminalGrowthRate: value })}
                      min={0}
                      max={5}
                      step={0.1}
                      valueLabelDisplay="auto"
                      valueLabelFormat={(value) => `${value}%`}
                    />
                  </Box>

                  <Box>
                    <Typography gutterBottom>Discount Rate (WACC)</Typography>
                    <Slider
                      value={inputs.discountRate}
                      onChange={(e, value) => setInputs({ ...inputs, discountRate: value })}
                      min={5}
                      max={20}
                      step={0.5}
                      valueLabelDisplay="auto"
                      valueLabelFormat={(value) => `${value}%`}
                    />
                  </Box>

                  <Box>
                    <Typography gutterBottom>Margin of Safety</Typography>
                    <Slider
                      value={inputs.marginOfSafety}
                      onChange={(e, value) => setInputs({ ...inputs, marginOfSafety: value })}
                      min={0}
                      max={50}
                      step={5}
                      valueLabelDisplay="auto"
                      valueLabelFormat={(value) => `${value}%`}
                    />
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={8}>
            <Stack spacing={3}>
              {valuation && (
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
                      Valuation Summary
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Fair Value
                        </Typography>
                        <Typography variant="h4" fontWeight={700} color="primary">
                          {formatCurrency(valuation.fairValue)}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Buy Below (with Margin of Safety)
                        </Typography>
                        <Typography variant="h4" fontWeight={700} color="success.main">
                          {formatCurrency(valuation.safetyMargin)}
                        </Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Alert
                          severity={valuation.upside > 0 ? "success" : "warning"}
                          sx={{ mt: 2 }}
                        >
                          Current price ({formatCurrency(stockData.overview.Price)}) implies 
                          {valuation.upside > 0 ? " an upside of " : " a downside of "}
                          <strong>{Math.abs(valuation.upside).toFixed(1)}%</strong>
                        </Alert>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              )}

              {projections && (
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
                      Projected Cash Flows
                    </Typography>
                    <Box sx={{ height: 300 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={projections}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="year" />
                          <YAxis />
                          <Tooltip 
                            formatter={(value) => formatLargeNumber(value)}
                          />
                          <Legend />
                          <Line
                            type="monotone"
                            dataKey="fcf"
                            name="Free Cash Flow"
                            stroke="#6C63FF"
                          />
                          <Line
                            type="monotone"
                            dataKey="discountedFCF"
                            name="Discounted FCF"
                            stroke="#4ECDC4"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </Box>
                  </CardContent>
                </Card>
              )}

              {projections && (
                <TableContainer component={Card}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Year</TableCell>
                        <TableCell align="right">Free Cash Flow</TableCell>
                        <TableCell align="right">Discounted FCF</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {projections.map((year) => (
                        <TableRow key={year.year}>
                          <TableCell>{year.year}</TableCell>
                          <TableCell align="right">{formatLargeNumber(year.fcf)}</TableCell>
                          <TableCell align="right">{formatLargeNumber(year.discountedFCF)}</TableCell>
                        </TableRow>
                      ))}
                      <TableRow>
                        <TableCell>Terminal Value</TableCell>
                        <TableCell align="right">{formatLargeNumber(valuation.terminalValue)}</TableCell>
                        <TableCell align="right">{formatLargeNumber(valuation.discountedTerminalValue)}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Stack>
          </Grid>
        </Grid>
      </Paper>
    </Stack>
  );
}

export default DCFValuation; 
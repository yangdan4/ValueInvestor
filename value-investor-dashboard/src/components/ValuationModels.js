import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Stack,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import DCFValuation from './DCFValuation';
import { useStock } from '../contexts/StockContext';
function ValuationModels() {
  const { stockData } = useStock();
  const [activeTab, setActiveTab] = useState(0);

  const calculateComparativeValuation = () => {
    const metrics = {
      peRatio: stockData.metrics.peRatioTTM,
      pbRatio: stockData.metrics.pbRatioTTM,
      evEbitda: stockData.metrics.enterpriseValueOverEBITDATTM,
      priceSales: stockData.metrics.priceToSalesRatioTTM,
      fcfYield: (stockData.cashFlow[0].freeCashFlow / stockData.overview.MarketCapitalization) * 100,
    };

    const industryAvg = {
      peRatio: 20, // Example values - should be fetched from industry data
      pbRatio: 2.5,
      evEbitda: 12,
      priceSales: 2,
      fcfYield: 5,
    };

    const impliedValues = {
      peRatio: (industryAvg.peRatio / metrics.peRatio) * stockData.overview.Price,
      pbRatio: (industryAvg.pbRatio / metrics.pbRatio) * stockData.overview.Price,
      evEbitda: (industryAvg.evEbitda / metrics.evEbitda) * stockData.overview.Price,
      priceSales: (industryAvg.priceSales / metrics.priceSales) * stockData.overview.Price,
      fcfYield: (metrics.fcfYield / industryAvg.fcfYield) * stockData.overview.Price,
    };

    return {
      metrics,
      industryAvg,
      impliedValues,
    };
  };

  const calculateGrahamValue = () => {
    const eps = stockData.financials[0].eps;
    const bookValue = stockData.balanceSheet[0].totalStockholdersEquity / 
                     stockData.overview.SharesOutstanding;
    const aaa_yield = 0.04; // Should be fetched from current market data

    // Graham's Formula: √(22.5 * EPS * BookValue)
    const intrinsicValue = Math.sqrt(22.5 * eps * bookValue);
    
    // Modified Graham Formula including bond yields
    const modifiedValue = (eps * (7 + 1/aaa_yield) * bookValue * 1.5) / 3;

    return {
      eps,
      bookValue,
      intrinsicValue,
      modifiedValue,
    };
  };

  const calculateEarningsPower = () => {
    const averageEarnings = stockData.financials
      .slice(0, 5)
      .reduce((sum, year) => sum + year.netIncome, 0) / 5;
    
    const normalizedEPS = averageEarnings / stockData.overview.SharesOutstanding;
    
    const multipliers = [8, 10, 12, 15, 18]; // Conservative to aggressive multipliers
    
    return {
      normalizedEPS,
      valuations: multipliers.map(mult => ({
        multiplier: mult,
        value: normalizedEPS * mult,
      })),
    };
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const renderComparativeValuation = () => {
    const valuation = calculateComparativeValuation();
    const currentPrice = stockData.overview.Price;

    const chartData = Object.keys(valuation.metrics).map(key => ({
      metric: key.replace(/([A-Z])/g, ' $1').trim(),
      current: valuation.metrics[key],
      industry: valuation.industryAvg[key],
    }));

    return (
      <Stack spacing={3}>
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
              Comparative Metrics
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="metric" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="current" name="Current" fill="#6C63FF" />
                  <Bar dataKey="industry" name="Industry Avg" fill="#4ECDC4" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>

        <TableContainer component={Card}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Metric</TableCell>
                <TableCell align="right">Current</TableCell>
                <TableCell align="right">Industry Avg</TableCell>
                <TableCell align="right">Implied Value</TableCell>
                <TableCell align="right">Discount/Premium</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Object.keys(valuation.metrics).map((key) => {
                const impliedValue = valuation.impliedValues[key];
                const premium = ((impliedValue / currentPrice) - 1) * 100;
                
                return (
                  <TableRow key={key}>
                    <TableCell>{key.replace(/([A-Z])/g, ' $1').trim()}</TableCell>
                    <TableCell align="right">{valuation.metrics[key].toFixed(2)}</TableCell>
                    <TableCell align="right">{valuation.industryAvg[key].toFixed(2)}</TableCell>
                    <TableCell align="right">{formatCurrency(impliedValue)}</TableCell>
                    <TableCell 
                      align="right"
                      sx={{ 
                        color: premium > 0 ? 'success.main' : 'error.main',
                        fontWeight: 600,
                      }}
                    >
                      {premium > 0 ? '+' : ''}{premium.toFixed(1)}%
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Stack>
    );
  };

  const renderGrahamValuation = () => {
    const valuation = calculateGrahamValue();
    const currentPrice = stockData.overview.Price;

    return (
      <Stack spacing={3}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
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
                  Classic Graham Formula
                </Typography>
                <Typography variant="h4" color="primary" gutterBottom>
                  {formatCurrency(valuation.intrinsicValue)}
                </Typography>
                <Alert 
                  severity={valuation.intrinsicValue > currentPrice ? "success" : "warning"}
                  sx={{ mt: 2 }}
                >
                  {valuation.intrinsicValue > currentPrice ? 
                    "Stock appears undervalued" : 
                    "Stock appears overvalued"}
                </Alert>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
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
                  Modified Graham Formula
                </Typography>
                <Typography variant="h4" color="primary" gutterBottom>
                  {formatCurrency(valuation.modifiedValue)}
                </Typography>
                <Alert 
                  severity={valuation.modifiedValue > currentPrice ? "success" : "warning"}
                  sx={{ mt: 2 }}
                >
                  {valuation.modifiedValue > currentPrice ? 
                    "Stock appears undervalued" : 
                    "Stock appears overvalued"}
                </Alert>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom fontWeight={700}>
              Valuation Inputs
            </Typography>
            <TableContainer>
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell>EPS (TTM)</TableCell>
                    <TableCell align="right">{formatCurrency(valuation.eps)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Book Value per Share</TableCell>
                    <TableCell align="right">{formatCurrency(valuation.bookValue)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Current Price</TableCell>
                    <TableCell align="right">{formatCurrency(currentPrice)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Stack>
    );
  };

  const renderEarningsPowerValuation = () => {
    const valuation = calculateEarningsPower();
    const currentPrice = stockData.overview.Price;

    return (
      <Stack spacing={3}>
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
              Normalized Earnings Power
            </Typography>
            <Typography variant="h4" color="primary" gutterBottom>
              {formatCurrency(valuation.normalizedEPS)} per share
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Based on 5-year average earnings
            </Typography>
          </CardContent>
        </Card>

        <TableContainer component={Card}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Earnings Multiple</TableCell>
                <TableCell align="right">Implied Value</TableCell>
                <TableCell align="right">Discount/Premium</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {valuation.valuations.map(({ multiplier, value }) => {
                const premium = ((value / currentPrice) - 1) * 100;
                
                return (
                  <TableRow key={multiplier}>
                    <TableCell>{multiplier}x</TableCell>
                    <TableCell align="right">{formatCurrency(value)}</TableCell>
                    <TableCell 
                      align="right"
                      sx={{ 
                        color: premium > 0 ? 'success.main' : 'error.main',
                        fontWeight: 600,
                      }}
                    >
                      {premium > 0 ? '+' : ''}{premium.toFixed(1)}%
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Stack>
    );
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
          Valuation Analysis 💰
        </Typography>

        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          sx={{ mb: 4 }}
        >
          <Tab label="DCF Valuation" />
          <Tab label="Comparative" />
          <Tab label="Graham" />
          <Tab label="Earnings Power" />
        </Tabs>

        {activeTab === 0 && <DCFValuation stockData={stockData} />}
        {activeTab === 1 && renderComparativeValuation()}
        {activeTab === 2 && renderGrahamValuation()}
        {activeTab === 3 && renderEarningsPowerValuation()}
      </Paper>
    </Stack>
  );
}

export default ValuationModels;
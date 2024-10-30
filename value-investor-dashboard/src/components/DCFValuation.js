import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  CircularProgress,
  Alert,
  Stack,
  Slider,
  Tooltip,
} from '@mui/material';
import { useStock } from '../contexts/StockContext';

function DCFValuation() {
  const { stockData, loading, error } = useStock();
  const [inputs, setInputs] = useState({
    growthRate5yr: 10,
    growthRate510yr: 5,
    terminalGrowthRate: 2.5,
    discountRate: 10,
    marginOfSafety: 25,
  });

  const [valuation, setValuation] = useState(null);

  useEffect(() => {
    if (stockData?.income?.[0]) {
      calculateDCF();
    }
  }, [stockData, inputs]);

  const calculateDCF = () => {
    if (!stockData?.income?.[0]) return;

    try {
      // Get latest financial data
      const latestIncome = stockData.income[0];
      const freeCashFlow = calculateFreeCashFlow(latestIncome);
      
      if (!freeCashFlow) {
        setValuation(null);
        return;
      }

      // Project cash flows
      const projectedCashFlows = [];
      let currentCashFlow = freeCashFlow;

      // First 5 years
      for (let i = 1; i <= 5; i++) {
        currentCashFlow *= (1 + inputs.growthRate5yr / 100);
        projectedCashFlows.push(currentCashFlow);
      }

      // Years 6-10
      for (let i = 6; i <= 10; i++) {
        currentCashFlow *= (1 + inputs.growthRate510yr / 100);
        projectedCashFlows.push(currentCashFlow);
      }

      // Terminal value
      const terminalValue = 
        currentCashFlow * (1 + inputs.terminalGrowthRate / 100) /
        (inputs.discountRate / 100 - inputs.terminalGrowthRate / 100);

      // Calculate present value
      let presentValue = 0;
      projectedCashFlows.forEach((cf, index) => {
        presentValue += cf / Math.pow(1 + inputs.discountRate / 100, index + 1);
      });

      // Add present value of terminal value
      presentValue += terminalValue / Math.pow(1 + inputs.discountRate / 100, 10);

      // Calculate per share values
      const sharesOutstanding = parseFloat(stockData.overview?.SharesOutstanding) || 0;
      const currentPrice = parseFloat(stockData.overview?.Price) || 0;

      if (!sharesOutstanding || !currentPrice) {
        setValuation(null);
        return;
      }

      const intrinsicValue = presentValue / sharesOutstanding;
      const marginOfSafetyValue = intrinsicValue * (1 - inputs.marginOfSafety / 100);

      setValuation({
        intrinsicValue: intrinsicValue.toFixed(2),
        marginOfSafetyValue: marginOfSafetyValue.toFixed(2),
        upside: (((intrinsicValue / currentPrice) - 1) * 100).toFixed(2),
        projectedCashFlows,
        terminalValue,
      });

    } catch (err) {
      console.error('DCF calculation error:', err);
      setValuation(null);
    }
  };

  const calculateFreeCashFlow = (income) => {
    if (!income?.operatingIncome || !income?.totalRevenue) return null;

    const operatingIncome = parseFloat(income.operatingIncome);
    const taxRate = 0.21; // Assumed corporate tax rate
    const nopat = operatingIncome * (1 - taxRate);
    
    // Simplified FCF calculation
    return nopat;
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
        Please select a stock to perform DCF valuation
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
          Discounted Cash Flow Valuation
        </Typography>

        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Card
              elevation={0}
              sx={{
                background: 'rgba(255, 255, 255, 0.5)',
                border: '1px solid rgba(108, 99, 255, 0.1)',
              }}
            >
              <CardContent>
                <Typography variant="h6" gutterBottom fontWeight={700}>
                  Growth Assumptions
                </Typography>
                <Stack spacing={3}>
                  <Box>
                    <Typography gutterBottom>Growth Rate (Years 1-5)</Typography>
                    <Slider
                      value={inputs.growthRate5yr}
                      onChange={(e, value) => setInputs(prev => ({ ...prev, growthRate5yr: value }))}
                      min={-20}
                      max={50}
                      valueLabelDisplay="auto"
                      valueLabelFormat={value => `${value}%`}
                    />
                  </Box>
                  <Box>
                    <Typography gutterBottom>Growth Rate (Years 6-10)</Typography>
                    <Slider
                      value={inputs.growthRate510yr}
                      onChange={(e, value) => setInputs(prev => ({ ...prev, growthRate510yr: value }))}
                      min={-10}
                      max={30}
                      valueLabelDisplay="auto"
                      valueLabelFormat={value => `${value}%`}
                    />
                  </Box>
                  <Box>
                    <Typography gutterBottom>Terminal Growth Rate</Typography>
                    <Slider
                      value={inputs.terminalGrowthRate}
                      onChange={(e, value) => setInputs(prev => ({ ...prev, terminalGrowthRate: value }))}
                      min={0}
                      max={5}
                      step={0.1}
                      valueLabelDisplay="auto"
                      valueLabelFormat={value => `${value}%`}
                    />
                  </Box>
                  <Box>
                    <Typography gutterBottom>Discount Rate</Typography>
                    <Slider
                      value={inputs.discountRate}
                      onChange={(e, value) => setInputs(prev => ({ ...prev, discountRate: value }))}
                      min={5}
                      max={20}
                      step={0.5}
                      valueLabelDisplay="auto"
                      valueLabelFormat={value => `${value}%`}
                    />
                  </Box>
                  <Box>
                    <Typography gutterBottom>Margin of Safety</Typography>
                    <Slider
                      value={inputs.marginOfSafety}
                      onChange={(e, value) => setInputs(prev => ({ ...prev, marginOfSafety: value }))}
                      min={0}
                      max={50}
                      valueLabelDisplay="auto"
                      valueLabelFormat={value => `${value}%`}
                    />
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card
              elevation={0}
              sx={{
                background: 'rgba(255, 255, 255, 0.5)',
                border: '1px solid rgba(108, 99, 255, 0.1)',
              }}
            >
              <CardContent>
                <Typography variant="h6" gutterBottom fontWeight={700}>
                  Valuation Results
                </Typography>
                {valuation ? (
                  <Stack spacing={3}>
                    <ValuationMetric
                      label="Intrinsic Value"
                      value={`$${valuation.intrinsicValue}`}
                      description="Estimated fair value per share"
                    />
                    <ValuationMetric
                      label="Value with Margin of Safety"
                      value={`$${valuation.marginOfSafetyValue}`}
                      description="Buy below this price"
                    />
                    <ValuationMetric
                      label="Potential Upside"
                      value={`${valuation.upside}%`}
                      description="From current market price"
                    />
                  </Stack>
                ) : (
                  <Alert severity="warning">
                    Unable to calculate DCF valuation. Please check if all required financial data is available.
                  </Alert>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}

function ValuationMetric({ label, value, description }) {
  return (
    <Box>
      <Typography variant="subtitle1" fontWeight={600}>
        {label}
      </Typography>
      <Typography variant="h4" color="primary" fontWeight={700}>
        {value}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {description}
      </Typography>
    </Box>
  );
}

export default DCFValuation;
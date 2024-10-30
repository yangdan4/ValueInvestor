import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Stack,
  CircularProgress,
  Alert
} from '@mui/material';
import { useStock } from '../contexts/StockContext';
function MoatAnalysis() {
  const { stockData, loading, error } = useStock();

  const calculateMoatMetrics = () => {
    if (!stockData?.income || !stockData?.balance) {
      return {
        grossMargin: 0,
        operatingMargin: 0,
        roic: 0,
        marketShare: 0,
        brandStrength: 0,
        switchingCosts: 0,
      };
    }

    // Get the most recent year's data
    const currentYear = stockData.income[0];
    const currentBalance = stockData.balance[0];

    // Calculate key moat indicators
    const grossMargin = currentYear?.grossProfit && currentYear?.totalRevenue
      ? (currentYear.grossProfit / currentYear.totalRevenue) * 100
      : 0;

    const operatingMargin = currentYear?.operatingIncome && currentYear?.totalRevenue
      ? (currentYear.operatingIncome / currentYear.totalRevenue) * 100
      : 0;

    const roic = calculateROIC(currentYear, currentBalance);
    const marketShare = calculateMarketShare(stockData.overview);
    const brandStrength = assessBrandStrength(stockData.overview);
    const switchingCosts = assessSwitchingCosts(stockData.overview);

    return {
      grossMargin: Number(grossMargin.toFixed(2)),
      operatingMargin: Number(operatingMargin.toFixed(2)),
      roic: Number(roic.toFixed(2)),
      marketShare,
      brandStrength,
      switchingCosts,
    };
  };

  const calculateROIC = (income, balance) => {
    if (!income?.operatingIncome || !balance?.totalShareholderEquity || !balance?.totalLongTermDebt || !balance?.cashAndCashEquivalents) {
      return 0;
    }

    const nopat = income.operatingIncome * (1 - 0.21); // Assuming 21% tax rate
    const investedCapital = 
      balance.totalShareholderEquity + 
      (balance.totalLongTermDebt || 0) - 
      (balance.cashAndCashEquivalents || 0);

    return investedCapital > 0 ? (nopat / investedCapital) * 100 : 0;
  };

  const calculateMarketShare = (overview) => {
    if (!overview?.MarketCapitalization) return 1;
    
    const marketCap = parseFloat(overview.MarketCapitalization);
    return marketCap > 100000000000 ? 5 :
           marketCap > 50000000000 ? 4 :
           marketCap > 10000000000 ? 3 :
           marketCap > 1000000000 ? 2 : 1;
  };

  const assessBrandStrength = (overview) => {
    if (!overview) return 1;
    
    // Simple scoring based on company age and market cap
    let score = 1;
    
    // Add points for market cap size
    const marketCap = parseFloat(overview.MarketCapitalization || 0);
    if (marketCap > 100000000000) score += 2;
    else if (marketCap > 10000000000) score += 1;

    // Add points for sector leadership
    if (overview.Industry) {
      const leadershipTerms = ['leader', 'largest', 'dominant'];
      if (leadershipTerms.some(term => overview.Description?.toLowerCase().includes(term))) {
        score += 1;
      }
    }

    return Math.min(score, 5); // Cap at 5
  };

  const assessSwitchingCosts = (overview) => {
    if (!overview) return 1;

    // Simple scoring based on industry and business description
    let score = 1;
    
    const highSwitchingCostIndustries = [
      'Software',
      'Technology',
      'Enterprise',
      'Healthcare',
      'Financial Services'
    ];

    if (overview.Industry && 
        highSwitchingCostIndustries.some(industry => 
          overview.Industry.includes(industry))) {
      score += 2;
    }

    // Look for keywords in business description
    const switchingCostKeywords = [
      'subscription',
      'platform',
      'ecosystem',
      'integrated',
      'proprietary'
    ];

    if (overview.Description) {
      const matches = switchingCostKeywords.filter(keyword => 
        overview.Description.toLowerCase().includes(keyword)
      );
      score += Math.min(matches.length, 2);
    }

    return Math.min(score, 5); // Cap at 5
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
        Please select a stock to begin analysis
      </Alert>
    );
  }

  const moatMetrics = calculateMoatMetrics();

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
          Economic Moat Analysis
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Stack spacing={2}>
              <MoatMetricCard
                title="Gross Margin"
                value={`${moatMetrics.grossMargin}%`}
                description="Higher margins indicate pricing power"
              />
              <MoatMetricCard
                title="Operating Margin"
                value={`${moatMetrics.operatingMargin}%`}
                description="Operational efficiency and scale advantages"
              />
              <MoatMetricCard
                title="Return on Invested Capital"
                value={`${moatMetrics.roic}%`}
                description="Capital efficiency and competitive advantage"
              />
            </Stack>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Stack spacing={2}>
              <MoatMetricCard
                title="Market Position"
                value={`${moatMetrics.marketShare}/5`}
                description="Relative market share and industry position"
              />
              <MoatMetricCard
                title="Brand Strength"
                value={`${moatMetrics.brandStrength}/5`}
                description="Brand recognition and pricing power"
              />
              <MoatMetricCard
                title="Switching Costs"
                value={`${moatMetrics.switchingCosts}/5`}
                description="Customer lock-in and retention"
              />
            </Stack>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}

function MoatMetricCard({ title, value, description }) {
  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 2,
        border: '1px solid rgba(108, 99, 255, 0.1)',
        background: 'rgba(255, 255, 255, 0.5)',
      }}
    >
      <Typography variant="subtitle1" fontWeight={600}>
        {title}
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

export default MoatAnalysis;
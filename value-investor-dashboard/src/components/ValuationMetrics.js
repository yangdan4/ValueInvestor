import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  Card,
  CardContent,
  Stack,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
} from '@mui/material';
import CalculateIcon from '@mui/icons-material/Calculate';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import BalanceIcon from '@mui/icons-material/Balance';
import ShowChartIcon from '@mui/icons-material/ShowChart';

function ValuationModels() {
  const [activeTab, setActiveTab] = useState(0);
  const [dcfInputs, setDcfInputs] = useState({
    fcf: '',
    growthRate: '',
    terminalRate: '',
    discountRate: '',
    shares: '',
  });

  const [grahamInputs, setGrahamInputs] = useState({
    eps: '',
    growthRate: '',
    aaaYield: '',
    currentPrice: '',
  });

  const [multiples, setMultiples] = useState({
    pe: '',
    ps: '',
    pb: '',
    ebitdaMultiple: '',
  });

  const [results, setResults] = useState({
    dcf: null,
    graham: null,
    multiples: null,
  });

  const calculateDCF = () => {
    // Add DCF calculation logic here
    const fcf = parseFloat(dcfInputs.fcf);
    const growth = parseFloat(dcfInputs.growthRate) / 100;
    const terminal = parseFloat(dcfInputs.terminalRate) / 100;
    const discount = parseFloat(dcfInputs.discountRate) / 100;
    const shares = parseFloat(dcfInputs.shares);

    let presentValue = 0;
    let currentFcf = fcf;

    // Calculate 5-year projected cash flows
    for (let i = 1; i <= 5; i++) {
      currentFcf *= (1 + growth);
      presentValue += currentFcf / Math.pow(1 + discount, i);
    }

    // Calculate terminal value
    const terminalValue = (currentFcf * (1 + terminal)) / (discount - terminal);
    const presentTerminalValue = terminalValue / Math.pow(1 + discount, 5);

    const fairValue = (presentValue + presentTerminalValue) / shares;

    setResults(prev => ({
      ...prev,
      dcf: fairValue,
    }));
  };

  const calculateGraham = () => {
    const eps = parseFloat(grahamInputs.eps);
    const growth = parseFloat(grahamInputs.growthRate);
    const yield_ = parseFloat(grahamInputs.aaaYield);
    
    const value = (eps * (8.5 + 2 * growth) * 4.4) / yield_;
    
    setResults(prev => ({
      ...prev,
      graham: value,
    }));
  };

  const calculateMultiples = () => {
    // Add multiples-based valuation logic here
    // This would compare industry averages and calculate implied values
  };

  return (
    <Box>
      <Paper
        elevation={0}
        sx={{
          p: 4,
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(108, 99, 255, 0.1)',
        }}
      >
        <Typography variant="h4" fontWeight={800} gutterBottom>
          Valuation Models 📊
        </Typography>

        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          sx={{ mb: 3 }}
        >
          <Tab icon={<ShowChartIcon />} label="DCF Valuation" />
          <Tab icon={<BalanceIcon />} label="Graham Formula" />
          <Tab icon={<TrendingUpIcon />} label="Multiples" />
        </Tabs>

        {activeTab === 0 && (
          <Grid container spacing={4}>
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
                    DCF Inputs
                  </Typography>
                  <Stack spacing={3}>
                    <TextField
                      label="Free Cash Flow (millions)"
                      value={dcfInputs.fcf}
                      onChange={(e) => setDcfInputs(prev => ({ ...prev, fcf: e.target.value }))}
                      type="number"
                    />
                    <TextField
                      label="Growth Rate (%)"
                      value={dcfInputs.growthRate}
                      onChange={(e) => setDcfInputs(prev => ({ ...prev, growthRate: e.target.value }))}
                      type="number"
                    />
                    <TextField
                      label="Terminal Growth Rate (%)"
                      value={dcfInputs.terminalRate}
                      onChange={(e) => setDcfInputs(prev => ({ ...prev, terminalRate: e.target.value }))}
                      type="number"
                    />
                    <TextField
                      label="Discount Rate (%)"
                      value={dcfInputs.discountRate}
                      onChange={(e) => setDcfInputs(prev => ({ ...prev, discountRate: e.target.value }))}
                      type="number"
                    />
                    <TextField
                      label="Shares Outstanding (millions)"
                      value={dcfInputs.shares}
                      onChange={(e) => setDcfInputs(prev => ({ ...prev, shares: e.target.value }))}
                      type="number"
                    />
                    <Button
                      variant="contained"
                      onClick={calculateDCF}
                      startIcon={<CalculateIcon />}
                      sx={{
                        background: 'linear-gradient(45deg, #6C63FF 30%, #4ECDC4 90%)',
                        boxShadow: '0 3px 15px rgba(108, 99, 255, 0.3)',
                      }}
                    >
                      Calculate DCF Value
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              {results.dcf && (
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
                      DCF Results
                    </Typography>
                    <TableContainer>
                      <Table>
                        <TableBody>
                          <TableRow>
                            <TableCell>Fair Value per Share</TableCell>
                            <TableCell align="right">
                              ${results.dcf.toFixed(2)}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>Margin of Safety (30%)</TableCell>
                            <TableCell align="right">
                              ${(results.dcf * 0.7).toFixed(2)}
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </CardContent>
                </Card>
              )}
            </Grid>
          </Grid>
        )}

        {activeTab === 1 && (
          <Grid container spacing={4}>
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
                    Graham Formula Inputs
                  </Typography>
                  <Stack spacing={3}>
                    <TextField
                      label="Earnings Per Share"
                      value={grahamInputs.eps}
                      onChange={(e) => setGrahamInputs(prev => ({ ...prev, eps: e.target.value }))}
                      type="number"
                    />
                    <TextField
                      label="Growth Rate (%)"
                      value={grahamInputs.growthRate}
                      onChange={(e) => setGrahamInputs(prev => ({ ...prev, growthRate: e.target.value }))}
                      type="number"
                    />
                    <TextField
                      label="AAA Corporate Bond Yield (%)"
                      value={grahamInputs.aaaYield}
                      onChange={(e) => setGrahamInputs(prev => ({ ...prev, aaaYield: e.target.value }))}
                      type="number"
                    />
                    <Button
                      variant="contained"
                      onClick={calculateGraham}
                      startIcon={<CalculateIcon />}
                      sx={{
                        background: 'linear-gradient(45deg, #6C63FF 30%, #4ECDC4 90%)',
                        boxShadow: '0 3px 15px rgba(108, 99, 255, 0.3)',
                      }}
                    >
                      Calculate Graham Value
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              {results.graham && (
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
                      Graham Formula Results
                    </Typography>
                    <TableContainer>
                      <Table>
                        <TableBody>
                          <TableRow>
                            <TableCell>Intrinsic Value</TableCell>
                            <TableCell align="right">
                              ${results.graham.toFixed(2)}
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </CardContent>
                </Card>
              )}
            </Grid>
          </Grid>
        )}

        {activeTab === 2 && (
          // Add multiples-based valuation UI here
          <Typography>Multiples-based valuation coming soon...</Typography>
        )}
      </Paper>
    </Box>
  );
}

export default ValuationModels;
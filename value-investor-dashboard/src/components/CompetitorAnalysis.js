import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from 'recharts';
import axios from 'axios';
import FinancialDataService from '../services/api';
import { useStock } from '../contexts/StockContext';
const FMP_API_KEY = process.env.REACT_APP_FMP_API_KEY;

function CompetitorAnalysis() {
    const { stockData } = useStock();
const [competitors, setCompetitors] = useState([]);
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);
const [dialogOpen, setDialogOpen] = useState(false);
const [newCompetitor, setNewCompetitor] = useState('');

useEffect(() => {
  if (stockData?.overview?.Symbol) {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const peers = await FinancialDataService.getIndustryPeers(stockData.overview.Symbol);
        setCompetitors(peers);
      } catch (err) {
        setError('Error fetching competitor data. Please try again.');
        console.error(err);
      }
      setLoading(false);
    };
    fetchData();
  }
}, [stockData]);


  const handleAddCompetitor = async () => {
    if (!newCompetitor) return;

    setLoading(true);
    try {
      const [metrics, ratios] = await Promise.all([
        axios.get(`https://financialmodelingprep.com/api/v3/key-metrics-ttm/${newCompetitor}?apikey=${FMP_API_KEY}`),
        axios.get(`https://financialmodelingprep.com/api/v3/ratios-ttm/${newCompetitor}?apikey=${FMP_API_KEY}`)
      ]);

      const competitor = {
        symbol: newCompetitor,
        name: metrics.data[0].companyName,
        marketCap: metrics.data[0].marketCapitalization,
        metrics: metrics.data[0],
        ratios: ratios.data[0],
      };

      setCompetitors(prev => [...prev, competitor]);
      setDialogOpen(false);
      setNewCompetitor('');
    } catch (err) {
      setError('Error adding competitor. Please check the symbol and try again.');
      console.error(err);
    }
    setLoading(false);
  };

  const handleRemoveCompetitor = (symbol) => {
    setCompetitors(prev => prev.filter(comp => comp.symbol !== symbol));
  };

  const prepareMetricsData = () => {
    const metrics = [
      { name: 'P/E Ratio', key: 'peRatioTTM' },
      { name: 'P/B Ratio', key: 'pbRatioTTM' },
      { name: 'Operating Margin', key: 'operatingMarginTTM' },
      { name: 'ROE', key: 'roeTTM' },
      { name: 'Current Ratio', key: 'currentRatioTTM' },
    ];

    return metrics.map(metric => ({
      metric: metric.name,
      [stockData.overview.Symbol]: stockData.metrics[metric.key],
      ...competitors.reduce((acc, comp) => ({
        ...acc,
        [comp.symbol]: comp.ratios[metric.key],
      }), {}),
    }));
  };

  const prepareRadarData = () => {
    const metrics = [
      { name: 'Profitability', key: 'operatingMarginTTM' },
      { name: 'Growth', key: 'revenueGrowthTTM' },
      { name: 'Efficiency', key: 'assetTurnoverTTM' },
      { name: 'Leverage', key: 'debtToEquityTTM' },
      { name: 'Liquidity', key: 'currentRatioTTM' },
    ];

    return competitors.map(comp => ({
      name: comp.symbol,
      ...metrics.reduce((acc, metric) => ({
        ...acc,
        [metric.name]: comp.ratios[metric.key] * 100,
      }), {}),
    }));
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
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
          <Typography variant="h4" fontWeight={800}>
            Competitor Analysis 🔍
          </Typography>
          <Button
            variant="contained"
            onClick={() => setDialogOpen(true)}
            startIcon={<AddIcon />}
            sx={{
              background: 'linear-gradient(45deg, #6C63FF 30%, #4ECDC4 90%)',
              boxShadow: '0 3px 15px rgba(108, 99, 255, 0.3)',
            }}
          >
            Add Competitor
          </Button>
        </Stack>

        {loading && (
          <Box display="flex" justifyContent="center" my={4}>
            <CircularProgress size={60} thickness={4} />
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 4 }}>
            {error}
          </Alert>
        )}

        {competitors.length > 0 && (
          <Grid container spacing={3}>
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
                    Key Metrics Comparison
                  </Typography>
                  <Box sx={{ height: 400 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={prepareMetricsData()} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="metric" type="category" />
                        <Tooltip />
                        <Legend />
                        <Bar
                          dataKey={stockData.overview.Symbol}
                          fill="#6C63FF"
                          name={stockData.overview.Symbol}
                        />
                        {competitors.map((comp, index) => (
                          <Bar
                            key={comp.symbol}
                            dataKey={comp.symbol}
                            fill={`hsl(${(index * 60) % 360}, 70%, 60%)`}
                            name={comp.symbol}
                          />
                        ))}
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
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
                    Competitive Position
                  </Typography>
                  <Box sx={{ height: 400 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={prepareRadarData()}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="name" />
                        <PolarRadiusAxis />
                        <Radar
                          name={stockData.overview.Symbol}
                          dataKey="value"
                          stroke="#6C63FF"
                          fill="#6C63FF"
                          fillOpacity={0.6}
                        />
                        {competitors.map((comp, index) => (
                          <Radar
                            key={comp.symbol}
                            name={comp.symbol}
                            dataKey="value"
                            stroke={`hsl(${(index * 60) % 360}, 70%, 60%)`}
                            fill={`hsl(${(index * 60) % 360}, 70%, 60%)`}
                            fillOpacity={0.6}
                          />
                        ))}
                        <Legend />
                      </RadarChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <TableContainer component={Card}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Company</TableCell>
                      <TableCell align="right">Market Cap</TableCell>
                      <TableCell align="right">P/E Ratio</TableCell>
                      <TableCell align="right">Operating Margin</TableCell>
                      <TableCell align="right">ROE</TableCell>
                      <TableCell align="right">Debt/Equity</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {competitors.map((comp) => (
                      <TableRow key={comp.symbol}>
                        <TableCell>{comp.name}</TableCell>
                        <TableCell align="right">
                          ${(comp.marketCap / 1e9).toFixed(2)}B
                        </TableCell>
                        <TableCell align="right">
                          {comp.ratios.peRatioTTM.toFixed(2)}
                        </TableCell>
                        <TableCell align="right">
                          {(comp.ratios.operatingMarginTTM * 100).toFixed(2)}%
                        </TableCell>
                        <TableCell align="right">
                          {(comp.ratios.roeTTM * 100).toFixed(2)}%
                        </TableCell>
                        <TableCell align="right">
                          {comp.ratios.debtToEquityTTM.toFixed(2)}
                        </TableCell>
                        <TableCell align="right">
                          <IconButton
                            onClick={() => handleRemoveCompetitor(comp.symbol)}
                            size="small"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
          </Grid>
        )}
      </Paper>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>Add Competitor</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Stock Symbol"
            value={newCompetitor}
            onChange={(e) => setNewCompetitor(e.target.value.toUpperCase())}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleAddCompetitor}
            variant="contained"
            sx={{
              background: 'linear-gradient(45deg, #6C63FF 30%, #4ECDC4 90%)',
            }}
          >
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}

export default CompetitorAnalysis; 
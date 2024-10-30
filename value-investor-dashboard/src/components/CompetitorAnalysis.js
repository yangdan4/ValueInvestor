import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { useStock } from '../contexts/StockContext';
import axios from 'axios';

const ALPHA_VANTAGE_API_KEY = process.env.REACT_APP_ALPHA_VANTAGE_API_KEY;

function CompetitorAnalysis() {
  const { stockData, loading: mainLoading, error: mainError } = useStock();
  const [competitors, setCompetitors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newCompetitor, setNewCompetitor] = useState('');
  const [competitorLoading, setCompetitorLoading] = useState(false);

  useEffect(() => {
    if (stockData?.overview?.Symbol) {
      fetchCompetitorData();
    }
  }, [stockData]);

  const fetchCompetitorData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Get sector peers from Alpha Vantage
      const response = await axios.get(
        `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${stockData.overview.Symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`
      );
      
      if (response.data?.Sector) {
        const sector = response.data.Sector;
        const industry = response.data.Industry;
        
        // Get other companies in the same sector/industry
        const competitors = await fetchSectorPeers(sector, industry);
        setCompetitors(competitors);
      }
    } catch (err) {
      setError('Error fetching competitor data. Please try again.');
      console.error(err);
    }
    setLoading(false);
  };

  const fetchSectorPeers = async (sector, industry) => {
    try {
      // This would typically connect to a database or API that provides sector/industry peers
      // For now, we'll use a simplified approach with manual competitor addition
      return [];
    } catch (err) {
      console.error('Error fetching sector peers:', err);
      return [];
    }
  };

  const handleAddCompetitor = async () => {
    if (!newCompetitor) return;

    setCompetitorLoading(true);
    try {
      const [overview, metrics] = await Promise.all([
        axios.get(`https://www.alphavantage.co/query?function=OVERVIEW&symbol=${newCompetitor}&apikey=${ALPHA_VANTAGE_API_KEY}`),
        axios.get(`https://www.alphavantage.co/query?function=INCOME_STATEMENT&symbol=${newCompetitor}&apikey=${ALPHA_VANTAGE_API_KEY}`)
      ]);

      if (!overview.data?.Symbol) {
        throw new Error('Invalid competitor symbol');
      }

      const competitor = {
        symbol: overview.data.Symbol,
        name: overview.data.Name,
        marketCap: parseFloat(overview.data.MarketCapitalization),
        metrics: {
          peRatio: parseFloat(overview.data.PERatio) || 0,
          pbRatio: parseFloat(overview.data.PriceToBookRatio) || 0,
          evToEbitda: parseFloat(overview.data.EVToEBITDA) || 0,
          profitMargin: parseFloat(overview.data.ProfitMargin) || 0,
          operatingMargin: parseFloat(overview.data.OperatingMargin) || 0,
          returnOnEquity: parseFloat(overview.data.ReturnOnEquityTTM) || 0,
        }
      };

      setCompetitors(prev => [...prev, competitor]);
      setDialogOpen(false);
      setNewCompetitor('');
    } catch (err) {
      setError('Error adding competitor. Please check the symbol and try again.');
      console.error(err);
    }
    setCompetitorLoading(false);
  };

  const handleRemoveCompetitor = (symbol) => {
    setCompetitors(prev => prev.filter(comp => comp.symbol !== symbol));
  };

  const formatMetric = (value) => {
    if (!value || isNaN(value)) return '-';
    return `${value.toFixed(2)}%`;
  };

  const formatMarketCap = (value) => {
    if (!value || isNaN(value)) return '-';
    return value >= 1e9 
      ? `$${(value / 1e9).toFixed(2)}B`
      : `$${(value / 1e6).toFixed(2)}M`;
  };

  if (mainLoading || loading) {
    return (
      <Box display="flex" justifyContent="center" my={4}>
        <CircularProgress size={60} thickness={4} />
      </Box>
    );
  }

  if (mainError || error) {
    return (
      <Alert severity="error" sx={{ borderRadius: 4, fontSize: '1.1rem' }}>
        {mainError || error}
      </Alert>
    );
  }

  if (!stockData) {
    return (
      <Alert severity="info" sx={{ borderRadius: 4, fontSize: '1.1rem' }}>
        Please select a stock to view competitor analysis
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
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h5" fontWeight={700}>
            Competitor Analysis
          </Typography>
          <Button
            startIcon={<AddIcon />}
            variant="contained"
            onClick={() => setDialogOpen(true)}
          >
            Add Competitor
          </Button>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Company</TableCell>
                <TableCell align="right">Market Cap</TableCell>
                <TableCell align="right">P/E Ratio</TableCell>
                <TableCell align="right">P/B Ratio</TableCell>
                <TableCell align="right">EV/EBITDA</TableCell>
                <TableCell align="right">Profit Margin</TableCell>
                <TableCell align="right">ROE</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {/* Main company row */}
              <TableRow>
                <TableCell component="th" scope="row">
                  <Typography fontWeight={600}>
                    {stockData.overview.Name} ({stockData.overview.Symbol})
                  </Typography>
                </TableCell>
                <TableCell align="right">{formatMarketCap(parseFloat(stockData.overview.MarketCapitalization))}</TableCell>
                <TableCell align="right">{formatMetric(parseFloat(stockData.overview.PERatio))}</TableCell>
                <TableCell align="right">{formatMetric(parseFloat(stockData.overview.PriceToBookRatio))}</TableCell>
                <TableCell align="right">{formatMetric(parseFloat(stockData.overview.EVToEBITDA))}</TableCell>
                <TableCell align="right">{formatMetric(parseFloat(stockData.overview.ProfitMargin) * 100)}</TableCell>
                <TableCell align="right">{formatMetric(parseFloat(stockData.overview.ReturnOnEquityTTM))}</TableCell>
                <TableCell align="right">-</TableCell>
              </TableRow>

              {/* Competitor rows */}
              {competitors.map((competitor) => (
                <TableRow key={competitor.symbol}>
                  <TableCell component="th" scope="row">
                    {competitor.name} ({competitor.symbol})
                  </TableCell>
                  <TableCell align="right">{formatMarketCap(competitor.marketCap)}</TableCell>
                  <TableCell align="right">{formatMetric(competitor.metrics.peRatio)}</TableCell>
                  <TableCell align="right">{formatMetric(competitor.metrics.pbRatio)}</TableCell>
                  <TableCell align="right">{formatMetric(competitor.metrics.evToEbitda)}</TableCell>
                  <TableCell align="right">{formatMetric(competitor.metrics.profitMargin * 100)}</TableCell>
                  <TableCell align="right">{formatMetric(competitor.metrics.returnOnEquity)}</TableCell>
                  <TableCell align="right">
                    <Tooltip title="Remove competitor">
                      <IconButton
                        size="small"
                        onClick={() => handleRemoveCompetitor(competitor.symbol)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
          <DialogTitle>Add Competitor</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Stock Symbol"
              fullWidth
              variant="outlined"
              value={newCompetitor}
              onChange={(e) => setNewCompetitor(e.target.value.toUpperCase())}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleAddCompetitor}
              disabled={competitorLoading}
              startIcon={competitorLoading ? <CircularProgress size={20} /> : null}
            >
              Add
            </Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  );
}

export default CompetitorAnalysis;
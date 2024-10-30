import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Stack,
  Alert,
  CircularProgress,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import axios from 'axios';

const COLORS = ['#6C63FF', '#4ECDC4', '#FF6B6B', '#45B7D1', '#96CEB4', '#FFEEAD', '#D4A5A5', '#9FA8DA'];

function PortfolioTracker() {
  const [portfolio, setPortfolio] = useState(() => {
    const saved = localStorage.getItem('portfolio');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPosition, setEditingPosition] = useState(null);
  const [formData, setFormData] = useState({
    symbol: '',
    shares: '',
    purchasePrice: '',
    purchaseDate: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPrices, setCurrentPrices] = useState({});

  useEffect(() => {
    localStorage.setItem('portfolio', JSON.stringify(portfolio));
    if (portfolio.length > 0) {
      fetchCurrentPrices();
    }
  }, [portfolio]);

  const fetchCurrentPrices = async () => {
    setLoading(true);
    setError(null);
    try {
      const symbols = portfolio.map(position => position.symbol).join(',');
      const response = await axios.get(
        `https://financialmodelingprep.com/api/v3/quote/${symbols}?apikey=${process.env.REACT_APP_FMP_API_KEY}`
      );
      
      const prices = {};
      response.data.forEach(quote => {
        prices[quote.symbol] = quote.price;
      });
      setCurrentPrices(prices);
    } catch (err) {
      setError('Error fetching current prices. Please try again.');
      console.error(err);
    }
    setLoading(false);
  };

  const handleAddPosition = () => {
    setEditingPosition(null);
    setFormData({
      symbol: '',
      shares: '',
      purchasePrice: '',
      purchaseDate: '',
    });
    setDialogOpen(true);
  };

  const handleEditPosition = (position) => {
    setEditingPosition(position);
    setFormData(position);
    setDialogOpen(true);
  };

  const handleDeletePosition = (symbol) => {
    setPortfolio(portfolio.filter(p => p.symbol !== symbol));
  };

  const handleSubmit = () => {
    const newPosition = {
      symbol: formData.symbol.toUpperCase(),
      shares: parseFloat(formData.shares),
      purchasePrice: parseFloat(formData.purchasePrice),
      purchaseDate: formData.purchaseDate,
    };

    if (editingPosition) {
      setPortfolio(portfolio.map(p => 
        p.symbol === editingPosition.symbol ? newPosition : p
      ));
    } else {
      setPortfolio([...portfolio, newPosition]);
    }
    setDialogOpen(false);
  };

  const calculateMetrics = () => {
    let totalValue = 0;
    let totalCost = 0;
    let positions = portfolio.map(position => {
      const currentPrice = currentPrices[position.symbol] || position.purchasePrice;
      const value = position.shares * currentPrice;
      const cost = position.shares * position.purchasePrice;
      const gain = value - cost;
      const gainPercent = ((value - cost) / cost) * 100;

      totalValue += value;
      totalCost += cost;

      return {
        ...position,
        currentPrice,
        value,
        gain,
        gainPercent,
      };
    });

    const totalGain = totalValue - totalCost;
    const totalGainPercent = ((totalValue - totalCost) / totalCost) * 100;

    return {
      positions,
      totalValue,
      totalCost,
      totalGain,
      totalGainPercent,
    };
  };

  const metrics = calculateMetrics();

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
            Portfolio Tracker 📈
          </Typography>
          <Button
            variant="contained"
            onClick={handleAddPosition}
            startIcon={<AddIcon />}
            sx={{
              background: 'linear-gradient(45deg, #6C63FF 30%, #4ECDC4 90%)',
              boxShadow: '0 3px 15px rgba(108, 99, 255, 0.3)',
            }}
          >
            Add Position
          </Button>
        </Stack>

        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <TableContainer component={Paper} sx={{ background: 'rgba(255, 255, 255, 0.9)' }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Symbol</TableCell>
                    <TableCell align="right">Shares</TableCell>
                    <TableCell align="right">Purchase Price</TableCell>
                    <TableCell align="right">Current Price</TableCell>
                    <TableCell align="right">Gain/Loss</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {metrics.positions.map((position) => (
                    <TableRow key={position.symbol}>
                      <TableCell>{position.symbol}</TableCell>
                      <TableCell align="right">{position.shares}</TableCell>
                      <TableCell align="right">${position.purchasePrice.toFixed(2)}</TableCell>
                      <TableCell align="right">${position.currentPrice.toFixed(2)}</TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          color: position.gain >= 0 ? 'success.main' : 'error.main',
                          fontWeight: 600,
                        }}
                      >
                        {position.gainPercent >= 0 ? '+' : ''}
                        {position.gainPercent.toFixed(2)}%
                      </TableCell>
                      <TableCell align="right">
                        <IconButton onClick={() => handleEditPosition(position)} size="small">
                          <EditIcon />
                        </IconButton>
                        <IconButton onClick={() => handleDeletePosition(position.symbol)} size="small">
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>

          <Grid item xs={12} md={4}>
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
                    Portfolio Summary
                  </Typography>
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Total Value
                      </Typography>
                      <Typography variant="h4" fontWeight={800}>
                        ${metrics.totalValue.toFixed(2)}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Total Gain/Loss
                      </Typography>
                      <Typography
                        variant="h5"
                        fontWeight={700}
                        color={metrics.totalGain >= 0 ? 'success.main' : 'error.main'}
                      >
                        {metrics.totalGain >= 0 ? '+' : ''}${metrics.totalGain.toFixed(2)}
                        {' ('}
                        {metrics.totalGainPercent >= 0 ? '+' : ''}
                        {metrics.totalGainPercent.toFixed(2)}%{')'}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>

              {portfolio.length > 0 && (
                <Card
                  elevation={0}
                  sx={{
                    background: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(108, 99, 255, 0.1)',
                    height: 300,
                  }}
                >
                  <CardContent>
                    <Typography variant="h6" gutterBottom fontWeight={700}>
                      Portfolio Allocation
                    </Typography>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={metrics.positions}
                          dataKey="value"
                          nameKey="symbol"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          label={({ symbol, percent }) =>
                            `${symbol} (${(percent * 100).toFixed(1)}%)`
                          }
                        >
                          {metrics.positions.map((entry, index) => (
                            <Cell
                              key={entry.symbol}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value) => [`$${value.toFixed(2)}`, 'Value']}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}
            </Stack>
          </Grid>
        </Grid>

        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            {editingPosition ? 'Edit Position' : 'Add New Position'}
          </DialogTitle>
          <DialogContent>
            <Stack spacing={3} sx={{ mt: 2 }}>
              <TextField
                label="Symbol"
                value={formData.symbol}
                onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
                disabled={!!editingPosition}
              />
              <TextField
                label="Number of Shares"
                type="number"
                value={formData.shares}
                onChange={(e) => setFormData({ ...formData, shares: e.target.value })}
              />
              <TextField
                label="Purchase Price"
                type="number"
                value={formData.purchasePrice}
                onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
              />
              <TextField
                label="Purchase Date"
                type="date"
                value={formData.purchaseDate}
                onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={handleSubmit}
              variant="contained"
              sx={{
                background: 'linear-gradient(45deg, #6C63FF 30%, #4ECDC4 90%)',
              }}
            >
              {editingPosition ? 'Save Changes' : 'Add Position'}
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Stack>
  );
}

export default PortfolioTracker; 
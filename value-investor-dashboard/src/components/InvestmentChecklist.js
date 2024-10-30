import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Stack,
  Checkbox,
  FormControlLabel,
  LinearProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const defaultChecklist = {
  businessModel: [
    { id: 1, text: 'Clear and understandable business model', checked: false },
    { id: 2, text: 'Sustainable competitive advantage', checked: false },
    { id: 3, text: 'High barriers to entry', checked: false },
    { id: 4, text: 'Scalable operations', checked: false },
  ],
  financialHealth: [
    { id: 5, text: 'Strong balance sheet', checked: false },
    { id: 6, text: 'Consistent free cash flow generation', checked: false },
    { id: 7, text: 'Low debt levels', checked: false },
    { id: 8, text: 'High return on invested capital', checked: false },
  ],
  management: [
    { id: 9, text: 'Experienced management team', checked: false },
    { id: 10, text: 'Aligned interests with shareholders', checked: false },
    { id: 11, text: 'Track record of good capital allocation', checked: false },
    { id: 12, text: 'Clear communication with investors', checked: false },
  ],
  valuation: [
    { id: 13, text: 'Reasonable P/E ratio relative to peers', checked: false },
    { id: 14, text: 'Attractive free cash flow yield', checked: false },
    { id: 15, text: 'Margin of safety in valuation', checked: false },
    { id: 16, text: 'Fair dividend policy', checked: false },
  ],
  risks: [
    { id: 17, text: 'Limited regulatory risks', checked: false },
    { id: 18, text: 'Low customer concentration', checked: false },
    { id: 19, text: 'Manageable competition', checked: false },
    { id: 20, text: 'No significant pending litigation', checked: false },
  ],
};

function InvestmentChecklist() {
  const [checklist, setChecklist] = useState(() => {
    const saved = localStorage.getItem('investmentChecklist');
    return saved ? JSON.parse(saved) : defaultChecklist;
  });
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [newItemCategory, setNewItemCategory] = useState('');
  const [newItemText, setNewItemText] = useState('');

  useEffect(() => {
    localStorage.setItem('investmentChecklist', JSON.stringify(checklist));
  }, [checklist]);

  const calculateProgress = (category) => {
    const items = checklist[category];
    const checked = items.filter(item => item.checked).length;
    return (checked / items.length) * 100;
  };

  const calculateOverallProgress = () => {
    let totalItems = 0;
    let checkedItems = 0;
    
    Object.values(checklist).forEach(category => {
      totalItems += category.length;
      checkedItems += category.filter(item => item.checked).length;
    });
    
    return (checkedItems / totalItems) * 100;
  };

  const handleToggle = (category, id) => {
    setChecklist(prev => ({
      ...prev,
      [category]: prev[category].map(item =>
        item.id === id ? { ...item, checked: !item.checked } : item
      ),
    }));
  };

  const handleAddItem = () => {
    setEditItem(null);
    setNewItemCategory('');
    setNewItemText('');
    setDialogOpen(true);
  };

  const handleEditItem = (category, item) => {
    setEditItem({ category, item });
    setNewItemCategory(category);
    setNewItemText(item.text);
    setDialogOpen(true);
  };

  const handleDeleteItem = (category, id) => {
    setChecklist(prev => ({
      ...prev,
      [category]: prev[category].filter(item => item.id !== id),
    }));
  };

  const handleSaveItem = () => {
    if (editItem) {
      setChecklist(prev => ({
        ...prev,
        [newItemCategory]: prev[newItemCategory].map(item =>
          item.id === editItem.item.id ? { ...item, text: newItemText } : item
        ),
      }));
    } else {
      const newId = Math.max(...Object.values(checklist).flat().map(item => item.id)) + 1;
      setChecklist(prev => ({
        ...prev,
        [newItemCategory]: [
          ...prev[newItemCategory],
          { id: newId, text: newItemText, checked: false },
        ],
      }));
    }
    setDialogOpen(false);
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
            Investment Checklist 📋
          </Typography>
          <Button
            variant="contained"
            onClick={handleAddItem}
            startIcon={<AddIcon />}
            sx={{
              background: 'linear-gradient(45deg, #6C63FF 30%, #4ECDC4 90%)',
              boxShadow: '0 3px 15px rgba(108, 99, 255, 0.3)',
            }}
          >
            Add Item
          </Button>
        </Stack>

        <Card
          elevation={0}
          sx={{
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(108, 99, 255, 0.1)',
            mb: 4,
          }}
        >
          <CardContent>
            <Typography variant="h6" gutterBottom fontWeight={700}>
              Overall Progress
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Typography variant="h3" color="primary" fontWeight={800} sx={{ mr: 2 }}>
                {Math.round(calculateOverallProgress())}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Complete
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={calculateOverallProgress()}
              sx={{
                height: 10,
                borderRadius: 5,
                backgroundColor: 'rgba(108, 99, 255, 0.1)',
                '& .MuiLinearProgress-bar': {
                  background: 'linear-gradient(45deg, #6C63FF 30%, #4ECDC4 90%)',
                },
              }}
            />
          </CardContent>
        </Card>

        <Grid container spacing={3}>
          {Object.entries(checklist).map(([category, items]) => (
            <Grid item xs={12} md={6} key={category}>
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
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={calculateProgress(category)}
                    sx={{
                      height: 6,
                      borderRadius: 3,
                      mb: 2,
                      backgroundColor: 'rgba(108, 99, 255, 0.1)',
                      '& .MuiLinearProgress-bar': {
                        background: 'linear-gradient(45deg, #6C63FF 30%, #4ECDC4 90%)',
                      },
                    }}
                  />
                  <Stack spacing={1}>
                    {items.map(item => (
                      <Box
                        key={item.id}
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={item.checked}
                              onChange={() => handleToggle(category, item.id)}
                              sx={{
                                '&.Mui-checked': {
                                  color: '#6C63FF',
                                },
                              }}
                            />
                          }
                          label={item.text}
                        />
                        <Box>
                          <IconButton
                            size="small"
                            onClick={() => handleEditItem(category, item)}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteItem(category, item.id)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </Box>
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editItem ? 'Edit Checklist Item' : 'Add New Checklist Item'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <TextField
              select
              label="Category"
              value={newItemCategory}
              onChange={(e) => setNewItemCategory(e.target.value)}
              SelectProps={{
                native: true,
              }}
              disabled={!!editItem}
            >
              <option value="">Select a category</option>
              {Object.keys(checklist).map(category => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </TextField>
            <TextField
              label="Item Text"
              value={newItemText}
              onChange={(e) => setNewItemText(e.target.value)}
              multiline
              rows={2}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleSaveItem}
            variant="contained"
            disabled={!newItemCategory || !newItemText}
            sx={{
              background: 'linear-gradient(45deg, #6C63FF 30%, #4ECDC4 90%)',
            }}
          >
            {editItem ? 'Save Changes' : 'Add Item'}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}

export default InvestmentChecklist; 
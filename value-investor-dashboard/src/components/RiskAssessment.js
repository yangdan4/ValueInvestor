import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Stack,
  Rating,
  LinearProgress,
  Slider,
  Tooltip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const defaultRisks = {
  marketRisks: [
    { name: 'Market Competition', score: 3, weight: 0.2, notes: 'Increasing competition in core markets' },
    { name: 'Industry Cyclicality', score: 4, weight: 0.15, notes: 'Moderate exposure to economic cycles' },
    { name: 'Regulatory Environment', score: 2, weight: 0.15, notes: 'Stable regulatory framework' },
  ],
  operationalRisks: [
    { name: 'Supply Chain', score: 3, weight: 0.1, notes: 'Diversified supplier base' },
    { name: 'Technology Disruption', score: 4, weight: 0.15, notes: 'Rapid technological changes' },
    { name: 'Key Personnel', score: 2, weight: 0.1, notes: 'Strong retention programs' },
  ],
  financialRisks: [
    { name: 'Leverage', score: 2, weight: 0.15, notes: 'Conservative debt levels' },
    { name: 'Currency Exposure', score: 3, weight: 0.1, notes: 'International operations' },
    { name: 'Liquidity', score: 1, weight: 0.1, notes: 'Strong cash position' },
  ],
};

function RiskAssessment() {
  const [risks, setRisks] = useState(() => {
    const saved = localStorage.getItem('riskAssessment');
    return saved ? JSON.parse(saved) : defaultRisks;
  });
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editRisk, setEditRisk] = useState(null);
  const [newRisk, setNewRisk] = useState({
    category: '',
    name: '',
    score: 3,
    weight: 0.1,
    notes: '',
  });

  const calculateRiskScore = (category) => {
    const categoryRisks = risks[category];
    return categoryRisks.reduce((acc, risk) => acc + (risk.score * risk.weight), 0) / 
           categoryRisks.reduce((acc, risk) => acc + risk.weight, 0);
  };

  const calculateOverallRiskScore = () => {
    let totalScore = 0;
    let totalWeight = 0;

    Object.values(risks).forEach(categoryRisks => {
      categoryRisks.forEach(risk => {
        totalScore += risk.score * risk.weight;
        totalWeight += risk.weight;
      });
    });

    return (totalScore / totalWeight).toFixed(2);
  };

  const handleAddRisk = () => {
    setEditRisk(null);
    setNewRisk({
      category: '',
      name: '',
      score: 3,
      weight: 0.1,
      notes: '',
    });
    setDialogOpen(true);
  };

  const handleEditRisk = (category, risk) => {
    setEditRisk({ category, risk });
    setNewRisk({
      category,
      name: risk.name,
      score: risk.score,
      weight: risk.weight,
      notes: risk.notes,
    });
    setDialogOpen(true);
  };

  const handleDeleteRisk = (category, riskName) => {
    setRisks(prev => ({
      ...prev,
      [category]: prev[category].filter(risk => risk.name !== riskName),
    }));
  };

  const handleSaveRisk = () => {
    if (editRisk) {
      setRisks(prev => ({
        ...prev,
        [editRisk.category]: prev[editRisk.category].map(risk =>
          risk.name === editRisk.risk.name
            ? { ...risk, score: newRisk.score, weight: newRisk.weight, notes: newRisk.notes }
            : risk
        ),
      }));
    } else {
      setRisks(prev => ({
        ...prev,
        [newRisk.category]: [
          ...prev[newRisk.category],
          {
            name: newRisk.name,
            score: newRisk.score,
            weight: newRisk.weight,
            notes: newRisk.notes,
          },
        ],
      }));
    }
    setDialogOpen(false);
  };

  const radarData = Object.entries(risks).map(([category, categoryRisks]) => ({
    category: category.replace(/([A-Z])/g, ' $1').trim(),
    score: calculateRiskScore(category) * 20, // Scale to 100
  }));

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
            Risk Assessment 🎯
          </Typography>
          <Button
            variant="contained"
            onClick={handleAddRisk}
            startIcon={<AddIcon />}
            sx={{
              background: 'linear-gradient(45deg, #6C63FF 30%, #4ECDC4 90%)',
              boxShadow: '0 3px 15px rgba(108, 99, 255, 0.3)',
            }}
          >
            Add Risk
          </Button>
        </Stack>

        <Grid container spacing={3}>
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
                <Typography variant="h6" gutterBottom>
                  Overall Risk Score
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h3" color="error" fontWeight={800} sx={{ mr: 2 }}>
                    {calculateOverallRiskScore()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    / 5
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={calculateOverallRiskScore() * 20}
                  sx={{
                    height: 10,
                    borderRadius: 5,
                    backgroundColor: 'rgba(255, 99, 99, 0.1)',
                    '& .MuiLinearProgress-bar': {
                      background: 'linear-gradient(45deg, #FF6B6B 30%, #FF8E53 90%)',
                    },
                  }}
                />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {calculateOverallRiskScore() <= 2 ? 'Low Risk' :
                   calculateOverallRiskScore() <= 3.5 ? 'Moderate Risk' : 'High Risk'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={8}>
            <Card
              elevation={0}
              sx={{
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(108, 99, 255, 0.1)',
                height: '100%',
              }}
            >
              <CardContent>
                <Typography variant="h6" gutterBottom fontWeight={700}>
                  Risk Distribution
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="category" />
                    <PolarRadiusAxis domain={[0, 100]} />
                    <Radar
                      name="Risk Score"
                      dataKey="score"
                      stroke="#FF6B6B"
                      fill="#FF6B6B"
                      fillOpacity={0.5}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          {Object.entries(risks).map(([category, categoryRisks]) => (
            <Grid item xs={12} key={category}>
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
                    {category.replace(/([A-Z])/g, ' $1').trim()}
                  </Typography>
                  <Stack spacing={3}>
                    {categoryRisks.map(risk => (
                      <Box key={risk.name}>
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          alignItems="center"
                          mb={1}
                        >
                          <Typography variant="subtitle1" fontWeight={600}>
                            {risk.name}
                          </Typography>
                          <Box>
                            <Tooltip title="Edit">
                              <Button
                                size="small"
                                onClick={() => handleEditRisk(category, risk)}
                                startIcon={<EditIcon />}
                              >
                                Edit
                              </Button>
                            </Tooltip>
                            <Tooltip title="Delete">
                              <Button
                                size="small"
                                color="error"
                                onClick={() => handleDeleteRisk(category, risk.name)}
                                startIcon={<DeleteIcon />}
                              >
                                Delete
                              </Button>
                            </Tooltip>
                          </Box>
                        </Stack>
                        <Rating
                          value={risk.score}
                          max={5}
                          readOnly
                          sx={{ mb: 1 }}
                        />
                        <Typography variant="body2" color="text.secondary">
                          Weight: {(risk.weight * 100).toFixed(0)}%
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Notes: {risk.notes}
                        </Typography>
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
          {editRisk ? 'Edit Risk' : 'Add New Risk'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            {!editRisk && (
              <TextField
                select
                label="Category"
                value={newRisk.category}
                onChange={(e) => setNewRisk({ ...newRisk, category: e.target.value })}
                SelectProps={{
                  native: true,
                }}
              >
                <option value="">Select a category</option>
                {Object.keys(risks).map(category => (
                  <option key={category} value={category}>
                    {category.replace(/([A-Z])/g, ' $1').trim()}
                  </option>
                ))}
              </TextField>
            )}
            {!editRisk && (
              <TextField
                label="Risk Name"
                value={newRisk.name}
                onChange={(e) => setNewRisk({ ...newRisk, name: e.target.value })}
              />
            )}
            <Box>
              <Typography gutterBottom>Risk Score</Typography>
              <Slider
                value={newRisk.score}
                onChange={(e, value) => setNewRisk({ ...newRisk, score: value })}
                min={1}
                max={5}
                marks
                step={1}
              />
            </Box>
            <Box>
              <Typography gutterBottom>Weight (%)</Typography>
              <Slider
                value={newRisk.weight * 100}
                onChange={(e, value) => setNewRisk({ ...newRisk, weight: value / 100 })}
                min={5}
                max={30}
                step={5}
              />
            </Box>
            <TextField
              label="Notes"
              value={newRisk.notes}
              onChange={(e) => setNewRisk({ ...newRisk, notes: e.target.value })}
              multiline
              rows={3}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleSaveRisk}
            variant="contained"
            sx={{
              background: 'linear-gradient(45deg, #6C63FF 30%, #4ECDC4 90%)',
            }}
          >
            {editRisk ? 'Save Changes' : 'Add Risk'}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}

export default RiskAssessment; 
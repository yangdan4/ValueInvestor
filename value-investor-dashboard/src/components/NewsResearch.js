import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Stack,
  Link,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
  Chip,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import axios from 'axios';

const NEWS_API_KEY = process.env.REACT_APP_NEWS_API_KEY;

function NewsResearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchNews('stock market');
  }, []);

  const fetchNews = async (query) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        `https://newsapi.org/v2/everything?q=${query}&language=en&sortBy=publishedAt&apiKey=${NEWS_API_KEY}`
      );
      setNews(response.data.articles);
    } catch (err) {
      setError('Error fetching news. Please try again.');
      console.error(err);
    }
    setLoading(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      fetchNews(searchTerm);
    }
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
        <Typography variant="h4" fontWeight={800} gutterBottom>
          Financial News & Research 📰
        </Typography>

        <Box component="form" onSubmit={handleSearch} sx={{ maxWidth: 600, mx: 'auto', mb: 4 }}>
          <TextField
            fullWidth
            label="Search News"
            variant="outlined"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="primary" />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '30px',
                backgroundColor: 'white',
              },
            }}
          />
        </Box>

        <Stack direction="row" spacing={1} sx={{ mb: 4 }}>
          {['Stock Market', 'Value Investing', 'Warren Buffett', 'Market Analysis', 'Economic News'].map(
            (topic) => (
              <Chip
                key={topic}
                label={topic}
                onClick={() => {
                  setSearchTerm(topic);
                  fetchNews(topic);
                }}
                sx={{
                  background: 'linear-gradient(45deg, #6C63FF 30%, #4ECDC4 90%)',
                  color: 'white',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #5952FF 30%, #3DBDB4 90%)',
                  },
                }}
              />
            )
          )}
        </Stack>

        {loading && (
          <Box display="flex" justifyContent="center" my={4}>
            <CircularProgress size={60} thickness={4} />
          </Box>
        )}

        {error && (
          <Alert
            severity="error"
            sx={{
              borderRadius: 4,
              fontSize: '1rem',
            }}
          >
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          {news.map((article, index) => (
            <Grid item xs={12} md={6} key={index}>
              <Card
                elevation={0}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                  background: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(108, 99, 255, 0.1)',
                }}
              >
                {article.urlToImage && (
                  <CardMedia
                    component="img"
                    height="200"
                    image={article.urlToImage}
                    alt={article.title}
                    sx={{ objectFit: 'cover' }}
                  />
                )}
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" gutterBottom fontWeight={700}>
                    <Link
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{ textDecoration: 'none', color: 'inherit' }}
                    >
                      {article.title}
                    </Link>
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {article.description}
                  </Typography>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{ mt: 2 }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      {article.source.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {new Date(article.publishedAt).toLocaleString()}
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>
    </Stack>
  );
}

export default NewsResearch; 
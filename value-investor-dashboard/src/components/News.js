import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Link,
  CircularProgress,
  Alert,
} from '@mui/material';
import { useStock } from '../contexts/StockContext';
import axios from 'axios';

function News() {
  const { stockData } = useStock();
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (stockData?.overview?.Symbol) {
      fetchNews(stockData.overview.Symbol);
    }
  }, [stockData]);

  const fetchNews = async (symbol) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`https://www.alphavantage.co/query`, {
        params: {
          function: 'NEWS_SENTIMENT',
          tickers: symbol,
          apikey: process.env.REACT_APP_ALPHA_VANTAGE_API_KEY,
        },
      });

      if (response.data.feed) {
        setNews(response.data.feed.slice(0, 10)); // Get latest 10 news items
      }
    } catch (err) {
      setError('Error fetching news. Please try again later.');
      console.error(err);
    }
    setLoading(false);
  };

  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Latest News {stockData?.overview?.Symbol ? `for ${stockData.overview.Symbol}` : ''}
        </Typography>
        <Grid container spacing={2}>
          {news.map((item, index) => (
            <Grid item xs={12} key={index}>
              <Box sx={{ mb: 2 }}>
                <Link 
                  href={item.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  sx={{ color: 'inherit', textDecoration: 'none' }}
                >
                  <Typography variant="h6">{item.title}</Typography>
                </Link>
                <Typography variant="body2" color="text.secondary">
                  {new Date(item.time_published).toLocaleDateString()} - {item.source}
                </Typography>
                <Typography variant="body1">
                  {item.summary}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
}

export default News; 
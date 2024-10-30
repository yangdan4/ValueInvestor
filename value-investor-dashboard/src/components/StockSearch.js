import React, { useState, useEffect } from 'react';
import { Autocomplete, TextField, Box, CircularProgress } from '@mui/material';
import { useStock } from '../contexts/StockContext';
import axios from 'axios';

const ALPHA_VANTAGE_API_KEY = process.env.REACT_APP_ALPHA_VANTAGE_API_KEY;

export default function StockSearch() {
  const { selectedSymbol, setSelectedSymbol } = useStock();
  const [options, setOptions] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSearch = async (value) => {
    if (value.length < 2) return;
    setLoading(true);
    try {
      const response = await axios.get(
        `https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${value}&apikey=${ALPHA_VANTAGE_API_KEY}`
      );
      const results = response.data.bestMatches?.map(match => ({
        symbol: match['1. symbol'],
        name: match['2. name'],
        type: match['3. type'],
        region: match['4. region']
      })) || [];
      setOptions(results.filter(result => result.region === 'United States'));
    } catch (error) {
      console.error('Error searching stocks:', error);
      setOptions([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (selectedSymbol) {
      setInputValue(selectedSymbol);
    }
  }, [selectedSymbol]);

  return (
    <Box sx={{ width: '100%', maxWidth: 500, mx: 'auto' }}>
      <Autocomplete
        value={selectedSymbol}
        onChange={(event, newValue) => {
          if (newValue) {
            setSelectedSymbol(typeof newValue === 'string' ? newValue : newValue.symbol);
          }
        }}
        inputValue={inputValue}
        onInputChange={(event, newInputValue) => {
          setInputValue(newInputValue);
          handleSearch(newInputValue);
        }}
        options={options}
        getOptionLabel={(option) => {
          if (typeof option === 'string') return option;
          return `${option.symbol} - ${option.name}`;
        }}
        isOptionEqualToValue={(option, value) => {
          if (typeof option === 'string' && typeof value === 'string') {
            return option === value;
          }
          return option.symbol === value;
        }}
        loading={loading}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Search Stock Symbol"
            variant="outlined"
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>
                  {loading ? <CircularProgress color="inherit" size={20} /> : null}
                  {params.InputProps.endAdornment}
                </>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '30px',
                backgroundColor: 'white',
              },
            }}
          />
        )}
      />
    </Box>
  );
}
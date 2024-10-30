import React, { useState } from 'react';
import { Autocomplete, TextField, Box } from '@mui/material';
import { useStock } from '../contexts/StockContext';
import FinancialDataService from '../services/api';

export default function StockSearch() {
  const { selectedSymbol, setSelectedSymbol } = useStock();
  const [options, setOptions] = useState([]);
  const [inputValue, setInputValue] = useState('');

  const handleSearch = async (value) => {
    if (value.length < 2) return;
    try {
      const results = await FinancialDataService.searchStocks(value);
      setOptions(results);
    } catch (error) {
      console.error('Error searching stocks:', error);
    }
  };

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
        renderInput={(params) => (
          <TextField
            {...params}
            label="Search Stock Symbol"
            variant="outlined"
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
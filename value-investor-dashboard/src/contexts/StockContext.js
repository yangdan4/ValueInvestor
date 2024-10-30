import React, { createContext, useState, useContext } from 'react';
import { useStockData } from '../hooks/useStockData';

const StockContext = createContext();

export function StockProvider({ children }) {
  const [selectedSymbol, setSelectedSymbol] = useState('AAPL');
  const { data: stockData, loading, error } = useStockData(selectedSymbol);

  return (
    <StockContext.Provider value={{ 
      selectedSymbol, 
      setSelectedSymbol, 
      stockData, 
      loading, 
      error 
    }}>
      {children}
    </StockContext.Provider>
  );
}

export function useStock() {
  const context = useContext(StockContext);
  if (!context) {
    throw new Error('useStock must be used within a StockProvider');
  }
  return context;
}
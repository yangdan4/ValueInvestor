import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const StockContext = createContext();
const ALPHA_VANTAGE_API_KEY = process.env.REACT_APP_ALPHA_VANTAGE_API_KEY;

export function StockProvider({ children }) {
  const [selectedSymbol, setSelectedSymbol] = useState(null);
  const [stockData, setStockData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!selectedSymbol) {
      setStockData(null);
      return;
    }

    const fetchStockData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [overview, income, balance, cashflow] = await Promise.all([
          axios.get(`https://www.alphavantage.co/query?function=OVERVIEW&symbol=${selectedSymbol}&apikey=${ALPHA_VANTAGE_API_KEY}`),
          axios.get(`https://www.alphavantage.co/query?function=INCOME_STATEMENT&symbol=${selectedSymbol}&apikey=${ALPHA_VANTAGE_API_KEY}`),
          axios.get(`https://www.alphavantage.co/query?function=BALANCE_SHEET&symbol=${selectedSymbol}&apikey=${ALPHA_VANTAGE_API_KEY}`),
          axios.get(`https://www.alphavantage.co/query?function=CASH_FLOW&symbol=${selectedSymbol}&apikey=${ALPHA_VANTAGE_API_KEY}`)
        ]);

        setStockData({
          overview: overview.data,
          income: income.data.annualReports,
          balance: balance.data.annualReports,
          cashflow: cashflow.data.annualReports,
          lastUpdated: new Date().toISOString()
        });
      } catch (err) {
        setError('Error fetching stock data. Please try again.');
        console.error('Error fetching stock data:', err);
      }
      setLoading(false);
    };

    fetchStockData();
  }, [selectedSymbol]);

  return (
    <StockContext.Provider value={{ selectedSymbol, setSelectedSymbol, stockData, loading, error }}>
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
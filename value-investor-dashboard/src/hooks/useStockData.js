import { useState, useEffect } from 'react';
import FinancialDataService from '../services/api';

export const useStockData = (symbol) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!symbol) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const [profile, statements, quote, news] = await Promise.all([
          FinancialDataService.getCompanyProfile(symbol),
          FinancialDataService.getFinancialStatements(symbol),
          FinancialDataService.getStockQuote(symbol),
          FinancialDataService.getCompanyNews(symbol),
        ]);

        setData({
          ...profile,
          ...statements,
          quote,
          news,
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [symbol]);

  return { data, loading, error };
}; 
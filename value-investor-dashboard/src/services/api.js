import axios from 'axios';

const ALPHA_VANTAGE_API_KEY = process.env.REACT_APP_ALPHA_VANTAGE_API_KEY;
const BASE_URL = 'https://www.alphavantage.co/query';
const NEWS_API_KEY = process.env.REACT_APP_NEWS_API_KEY;
const NEWS_BASE_URL = 'https://newsapi.org/v2';

class FinancialDataService {
  static async getCompanyProfile(symbol) {
    try {
      const [overview, income, balance, cashflow] = await Promise.all([
        axios.get(`${BASE_URL}?function=OVERVIEW&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`),
        axios.get(`${BASE_URL}?function=INCOME_STATEMENT&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`),
        axios.get(`${BASE_URL}?function=BALANCE_SHEET&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`),
        axios.get(`${BASE_URL}?function=CASH_FLOW&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`)
      ]);

      return {
        overview: overview.data,
        metrics: {
          peRatio: parseFloat(overview.data.PERatio) || 0,
          pbRatio: parseFloat(overview.data.PriceToBookRatio) || 0,
          evToEBITDA: parseFloat(overview.data.EVToEBITDA) || 0,
          priceToSalesRatio: parseFloat(overview.data.PriceToSalesRatio) || 0
        },
        ratios: this.calculateFinancialRatios(income.data, balance.data, cashflow.data)
      };
    } catch (error) {
      console.error('Error fetching company profile:', error);
      throw error;
    }
  }

  static calculateFinancialRatios(income, balance, cashflow) {
    const latest = {
      income: income.annualReports?.[0] || {},
      balance: balance.annualReports?.[0] || {},
      cashflow: cashflow.annualReports?.[0] || {}
    };

    return {
      currentRatio: latest.balance.totalCurrentAssets && latest.balance.totalCurrentLiabilities
        ? parseFloat(latest.balance.totalCurrentAssets) / parseFloat(latest.balance.totalCurrentLiabilities)
        : 0,
      quickRatio: latest.balance.totalCurrentAssets && latest.balance.inventory && latest.balance.totalCurrentLiabilities
        ? (parseFloat(latest.balance.totalCurrentAssets) - parseFloat(latest.balance.inventory)) / parseFloat(latest.balance.totalCurrentLiabilities)
        : 0,
      debtToEquity: latest.balance.totalShareholderEquity && latest.balance.totalLiabilities
        ? parseFloat(latest.balance.totalLiabilities) / parseFloat(latest.balance.totalShareholderEquity)
        : 0,
      returnOnEquity: latest.income.netIncome && latest.balance.totalShareholderEquity
        ? (parseFloat(latest.income.netIncome) / parseFloat(latest.balance.totalShareholderEquity)) * 100
        : 0,
      returnOnAssets: latest.income.netIncome && latest.balance.totalAssets
        ? (parseFloat(latest.income.netIncome) / parseFloat(latest.balance.totalAssets)) * 100
        : 0
    };
  }

  static async getFinancialStatements(symbol) {
    try {
      const [income, balance, cashflow] = await Promise.all([
        axios.get(`${BASE_URL}?function=INCOME_STATEMENT&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`),
        axios.get(`${BASE_URL}?function=BALANCE_SHEET&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`),
        axios.get(`${BASE_URL}?function=CASH_FLOW&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`)
      ]);

      return {
        income: income.data.annualReports || [],
        balance: balance.data.annualReports || [],
        cashflow: cashflow.data.annualReports || []
      };
    } catch (error) {
      console.error('Error fetching financial statements:', error);
      throw error;
    }
  }

  static async getStockQuote(symbol) {
    try {
      const response = await axios.get(
        `${BASE_URL}?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`
      );
      return response.data['Global Quote'] || null;
    } catch (error) {
      console.error('Error fetching stock quote:', error);
      throw error;
    }
  }

  static async getCompanyNews(symbol) {
    try {
      const response = await axios.get(`${NEWS_BASE_URL}/everything`, {
        params: {
          q: symbol,
          apiKey: NEWS_API_KEY,
          language: 'en',
          sortBy: 'relevancy',
          pageSize: 10,
        },
      });
      return response.data.articles || [];
    } catch (error) {
      console.error('Error fetching company news:', error);
      throw error;
    }
  }

  static async getHistoricalPrices(symbol) {
    try {
      const response = await axios.get(
        `${BASE_URL}?function=TIME_SERIES_DAILY_ADJUSTED&symbol=${symbol}&outputsize=compact&apikey=${ALPHA_VANTAGE_API_KEY}`
      );
      const timeSeriesData = response.data['Time Series (Daily)'] || {};
      return Object.entries(timeSeriesData).map(([date, values]) => ({
        date,
        close: parseFloat(values['4. close']),
        volume: parseFloat(values['6. volume'])
      }));
    } catch (error) {
      console.error('Error fetching historical prices:', error);
      throw error;
    }
  }

  static async getEconomicIndicators() {
    try {
      const [gdp, inflation, unemployment] = await Promise.all([
        axios.get(`${BASE_URL}?function=REAL_GDP&interval=quarterly&apikey=${ALPHA_VANTAGE_API_KEY}`),
        axios.get(`${BASE_URL}?function=INFLATION&apikey=${ALPHA_VANTAGE_API_KEY}`),
        axios.get(`${BASE_URL}?function=UNEMPLOYMENT&apikey=${ALPHA_VANTAGE_API_KEY}`)
      ]);

      return {
        gdp: gdp.data.data || [],
        inflation: inflation.data.data || [],
        unemployment: unemployment.data.data || []
      };
    } catch (error) {
      console.error('Error fetching economic indicators:', error);
      throw error;
    }
  }

  static async searchStocks(query) {
    try {
      const response = await axios.get(
        `${BASE_URL}?function=SYMBOL_SEARCH&keywords=${query}&apikey=${ALPHA_VANTAGE_API_KEY}`
      );
      return (response.data.bestMatches || []).map(match => ({
        symbol: match['1. symbol'],
        name: match['2. name'],
        type: match['3. type'],
        region: match['4. region']
      }));
    } catch (error) {
      console.error('Error searching stocks:', error);
      throw error;
    }
  }

  static async getDetailedFinancialMetrics(symbol) {
    try {
      const [overview, income, balance] = await Promise.all([
        axios.get(`${BASE_URL}?function=OVERVIEW&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`),
        axios.get(`${BASE_URL}?function=INCOME_STATEMENT&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`),
        axios.get(`${BASE_URL}?function=BALANCE_SHEET&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`)
      ]);

      const latestIncome = income.data.annualReports?.[0] || {};
      const latestBalance = balance.data.annualReports?.[0] || {};

      return {
        overview: overview.data,
        metrics: {
          peRatio: parseFloat(overview.data.PERatio) || 0,
          pbRatio: parseFloat(overview.data.PriceToBookRatio) || 0,
          evToEBITDA: parseFloat(overview.data.EVToEBITDA) || 0,
          priceToSalesRatio: parseFloat(overview.data.PriceToSalesRatio) || 0,
          profitMargin: parseFloat(overview.data.ProfitMargin) || 0,
          operatingMargin: latestIncome.operatingIncome && latestIncome.totalRevenue
            ? (parseFloat(latestIncome.operatingIncome) / parseFloat(latestIncome.totalRevenue)) * 100
            : 0,
          returnOnEquity: parseFloat(overview.data.ReturnOnEquityTTM) || 0,
          returnOnAssets: parseFloat(overview.data.ReturnOnAssetsTTM) || 0
        }
      };
    } catch (error) {
      console.error('Error fetching detailed metrics:', error);
      throw error;
    }
  }
}

export default FinancialDataService;
import axios from 'axios';

const FMP_API_KEY = process.env.REACT_APP_FMP_API_KEY;
const NEWS_API_KEY = process.env.REACT_APP_NEWS_API_KEY;
const ALPHA_VANTAGE_API_KEY = process.env.REACT_APP_ALPHA_VANTAGE_API_KEY;

const FMP_BASE_URL = 'https://financialmodelingprep.com/api/v3';
const NEWS_BASE_URL = 'https://newsapi.org/v2';
const ALPHA_VANTAGE_BASE_URL = 'https://www.alphavantage.co/query';

class FinancialDataService {
  static async getCompanyProfile(symbol) {
    try {
      const [profile, metrics, ratios] = await Promise.all([
        axios.get(`${FMP_BASE_URL}/profile/${symbol}?apikey=${FMP_API_KEY}`),
        axios.get(`${FMP_BASE_URL}/key-metrics-ttm/${symbol}?apikey=${FMP_API_KEY}`),
        axios.get(`${FMP_BASE_URL}/ratios-ttm/${symbol}?apikey=${FMP_API_KEY}`),
      ]);

      return {
        overview: profile.data[0],
        metrics: metrics.data[0],
        ratios: ratios.data[0],
      };
    } catch (error) {
      console.error('Error fetching company profile:', error);
      throw error;
    }
  }

  static async getFinancialStatements(symbol) {
    try {
      const [income, balance, cashflow] = await Promise.all([
        axios.get(`${FMP_BASE_URL}/income-statement/${symbol}?limit=20&apikey=${FMP_API_KEY}`),
        axios.get(`${FMP_BASE_URL}/balance-sheet-statement/${symbol}?limit=20&apikey=${FMP_API_KEY}`),
        axios.get(`${FMP_BASE_URL}/cash-flow-statement/${symbol}?limit=20&apikey=${FMP_API_KEY}`),
      ]);

      return {
        financials: income.data,
        balanceSheet: balance.data,
        cashFlow: cashflow.data,
      };
    } catch (error) {
      console.error('Error fetching financial statements:', error);
      throw error;
    }
  }

  static async getStockQuote(symbol) {
    try {
      const response = await axios.get(`${FMP_BASE_URL}/quote/${symbol}?apikey=${FMP_API_KEY}`);
      return response.data[0];
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
      return response.data.articles;
    } catch (error) {
      console.error('Error fetching company news:', error);
      throw error;
    }
  }

  static async getIndustryPeers(symbol) {
    try {
      const profile = await this.getCompanyProfile(symbol);
      const peers = await axios.get(
        `${FMP_BASE_URL}/stock-screener?sector=${profile.overview.sector}&industry=${profile.overview.industry}&apikey=${FMP_API_KEY}`
      );
      return peers.data.filter(peer => peer.symbol !== symbol);
    } catch (error) {
      console.error('Error fetching industry peers:', error);
      throw error;
    }
  }

  static async getHistoricalPrices(symbol, timeframe = '1year') {
    try {
      const response = await axios.get(`${FMP_BASE_URL}/historical-price-full/${symbol}?apikey=${FMP_API_KEY}`);
      return response.data.historical;
    } catch (error) {
      console.error('Error fetching historical prices:', error);
      throw error;
    }
  }

  static async getInsiderTransactions(symbol) {
    try {
      const response = await axios.get(`${FMP_BASE_URL}/insider/transactions/${symbol}?apikey=${FMP_API_KEY}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching insider transactions:', error);
      throw error;
    }
  }

  static async getFinancialGrowth(symbol) {
    try {
      const response = await axios.get(`${FMP_BASE_URL}/financial-growth/${symbol}?apikey=${FMP_API_KEY}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching financial growth:', error);
      throw error;
    }
  }

  static async getEconomicIndicators() {
    try {
      const [gdp, inflation, unemployment] = await Promise.all([
        axios.get(`${ALPHA_VANTAGE_BASE_URL}?function=REAL_GDP&interval=quarterly&apikey=${ALPHA_VANTAGE_API_KEY}`),
        axios.get(`${ALPHA_VANTAGE_BASE_URL}?function=INFLATION&apikey=${ALPHA_VANTAGE_API_KEY}`),
        axios.get(`${ALPHA_VANTAGE_BASE_URL}?function=UNEMPLOYMENT&apikey=${ALPHA_VANTAGE_API_KEY}`),
      ]);

      return {
        gdp: gdp.data,
        inflation: inflation.data,
        unemployment: unemployment.data,
      };
    } catch (error) {
      console.error('Error fetching economic indicators:', error);
      throw error;
    }
  }

  static async getStockScreener(filters) {
    try {
      const queryParams = new URLSearchParams({
        ...filters,
        apikey: FMP_API_KEY,
      });

      const response = await axios.get(`${FMP_BASE_URL}/stock-screener?${queryParams}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching stock screener results:', error);
      throw error;
    }
  }

  static async getCompanyESGScore(symbol) {
    try {
      const response = await axios.get(`${FMP_BASE_URL}/esg-score/${symbol}?apikey=${FMP_API_KEY}`);
      return response.data[0];
    } catch (error) {
      console.error('Error fetching ESG score:', error);
      throw error;
    }
  }

  static async getSECFilings(symbol) {
    try {
      const response = await axios.get(`${FMP_BASE_URL}/sec_filings/${symbol}?apikey=${FMP_API_KEY}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching SEC filings:', error);
      throw error;
    }
  }


  static async searchStocks(query) {
    try {
      const response = await axios.get(`${FMP_BASE_URL}/search?query=${query}&limit=10&apikey=${FMP_API_KEY}`);
      return response.data.map(item => ({
        symbol: item.symbol,
        name: item.name,
        exchange: item.exchangeShortName
      }));
    } catch (error) {
      console.error('Error searching stocks:', error);
      throw error;
    }
  }

  static async getIndustryAverages(sector) {
    try {
      const response = await axios.get(
        `${FMP_BASE_URL}/stock-market-averages/${sector}?apikey=${FMP_API_KEY}`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching industry averages:', error);
      throw error;
    }
  }

  static async getDetailedFinancialMetrics(symbol) {
    try {
      const [keyMetrics, ratios, growth] = await Promise.all([
        axios.get(`${FMP_BASE_URL}/key-metrics-ttm/${symbol}?apikey=${FMP_API_KEY}`),
        axios.get(`${FMP_BASE_URL}/ratios-ttm/${symbol}?apikey=${FMP_API_KEY}`),
        axios.get(`${FMP_BASE_URL}/financial-growth/${symbol}?apikey=${FMP_API_KEY}`)
      ]);
      return {
        metrics: keyMetrics.data[0],
        ratios: ratios.data[0],
        growth: growth.data[0]
      };
    } catch (error) {
      console.error('Error fetching detailed metrics:', error);
      throw error;
    }
  }
}

export default FinancialDataService;
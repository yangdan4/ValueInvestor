import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { useStock } from '../contexts/StockContext';

function FinancialStatements() {
  const { stockData, loading, error } = useStock();
  const [activeTab, setActiveTab] = useState(0);
  const [timeframe, setTimeframe] = useState('annual');

  const formatLargeNumber = (num) => {
    if (!num) return '-';
    num = parseFloat(num);
    if (isNaN(num)) return '-';
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    return `$${num.toFixed(2)}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const prepareChartData = (statements) => {
    if (!statements || !Array.isArray(statements)) return [];
    
    return statements
      .map(statement => ({
        date: formatDate(statement.fiscalDateEnding),
        revenue: statement.totalRevenue ? parseFloat(statement.totalRevenue) / 1e6 : 0,
        grossProfit: statement.grossProfit ? parseFloat(statement.grossProfit) / 1e6 : 0,
        operatingIncome: statement.operatingIncome ? parseFloat(statement.operatingIncome) / 1e6 : 0,
        netIncome: statement.netIncome ? parseFloat(statement.netIncome) / 1e6 : 0,
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  const calculateGrowth = (current, previous) => {
    if (!current || !previous || previous === 0) return '-';
    const growth = ((parseFloat(current) - parseFloat(previous)) / Math.abs(parseFloat(previous))) * 100;
    return `${growth >= 0 ? '+' : ''}${growth.toFixed(2)}%`;
  };

  const renderIncomeStatement = () => {
    if (!stockData?.income || !Array.isArray(stockData.income)) {
      return (
        <Alert severity="warning">
          Income statement data is not available
        </Alert>
      );
    }

    const statements = stockData.income;
    const chartData = prepareChartData(statements);

    return (
      <Box>
        <Box sx={{ height: 400, mb: 4 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(value) => [`$${value.toFixed(2)}M`, '']} />
              <Legend />
              <Line type="monotone" dataKey="revenue" name="Revenue" stroke="#6C63FF" strokeWidth={2} />
              <Line type="monotone" dataKey="grossProfit" name="Gross Profit" stroke="#4ECDC4" strokeWidth={2} />
              <Line type="monotone" dataKey="operatingIncome" name="Operating Income" stroke="#FF6B6B" strokeWidth={2} />
              <Line type="monotone" dataKey="netIncome" name="Net Income" stroke="#45B7D1" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Metric</TableCell>
                {statements.slice(0, 4).map((statement) => (
                  <TableCell key={statement.fiscalDateEnding} align="right">
                    {formatDate(statement.fiscalDateEnding)}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {[
                { key: 'totalRevenue', label: 'Revenue' },
                { key: 'grossProfit', label: 'Gross Profit' },
                { key: 'operatingIncome', label: 'Operating Income' },
                { key: 'netIncome', label: 'Net Income' },
                { key: 'eps', label: 'EPS' },
              ].map((row) => (
                <TableRow key={row.key}>
                  <TableCell component="th" scope="row">
                    {row.label}
                  </TableCell>
                  {statements.slice(0, 4).map((statement, index) => (
                    <TableCell key={index} align="right">
                      {formatLargeNumber(statement[row.key])}
                      {index < statements.length - 1 && (
                        <Typography variant="caption" display="block" color="textSecondary">
                          {calculateGrowth(statement[row.key], statements[index + 1]?.[row.key])}
                        </Typography>
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  };

  const renderBalanceSheet = () => {
    if (!stockData?.balance || !Array.isArray(stockData.balance)) {
      return (
        <Alert severity="warning">
          Balance sheet data is not available
        </Alert>
      );
    }

    const statements = stockData.balance;

    return (
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Metric</TableCell>
              {statements.slice(0, 4).map((statement) => (
                <TableCell key={statement.fiscalDateEnding} align="right">
                  {formatDate(statement.fiscalDateEnding)}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {[
              { key: 'totalAssets', label: 'Total Assets' },
              { key: 'totalCurrentAssets', label: 'Current Assets' },
              { key: 'cashAndCashEquivalents', label: 'Cash & Equivalents' },
              { key: 'totalLiabilities', label: 'Total Liabilities' },
              { key: 'totalCurrentLiabilities', label: 'Current Liabilities' },
              { key: 'totalShareholderEquity', label: 'Shareholder Equity' },
            ].map((row) => (
              <TableRow key={row.key}>
                <TableCell component="th" scope="row">
                  {row.label}
                </TableCell>
                {statements.slice(0, 4).map((statement, index) => (
                  <TableCell key={index} align="right">
                    {formatLargeNumber(statement[row.key])}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  const renderCashFlow = () => {
    if (!stockData?.cashflow || !Array.isArray(stockData.cashflow)) {
      return (
        <Alert severity="warning">
          Cash flow statement data is not available
        </Alert>
      );
    }

    const statements = stockData.cashflow;

    return (
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Metric</TableCell>
              {statements.slice(0, 4).map((statement) => (
                <TableCell key={statement.fiscalDateEnding} align="right">
                  {formatDate(statement.fiscalDateEnding)}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {[
              { key: 'operatingCashflow', label: 'Operating Cash Flow' },
              { key: 'capitalExpenditures', label: 'Capital Expenditures' },
              { key: 'cashflowFromInvestment', label: 'Investment Cash Flow' },
              { key: 'cashflowFromFinancing', label: 'Financing Cash Flow' },
              { key: 'freeCashFlow', label: 'Free Cash Flow' },
            ].map((row) => (
              <TableRow key={row.key}>
                <TableCell component="th" scope="row">
                  {row.label}
                </TableCell>
                {statements.slice(0, 4).map((statement, index) => (
                  <TableCell key={index} align="right">
                    {formatLargeNumber(statement[row.key])}
                    {index < statements.length - 1 && (
                      <Typography variant="caption" display="block" color="textSecondary">
                        {calculateGrowth(statement[row.key], statements[index + 1]?.[row.key])}
                      </Typography>
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" my={4}>
        <CircularProgress size={60} thickness={4} />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ borderRadius: 4, fontSize: '1.1rem' }}>
        {error}
      </Alert>
    );
  }

  if (!stockData) {
    return (
      <Alert severity="info" sx={{ borderRadius: 4, fontSize: '1.1rem' }}>
        Please select a stock to view financial statements
      </Alert>
    );
  }

  return (
    <Card
      elevation={0}
      sx={{
        background: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(108, 99, 255, 0.1)',
      }}
    >
      <CardContent>
        <Typography variant="h5" gutterBottom fontWeight={700}>
          Financial Statements
        </Typography>

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs
            value={activeTab}
            onChange={(e, newValue) => setActiveTab(newValue)}
            variant="fullWidth"
          >
            <Tab label="Income Statement" />
            <Tab label="Balance Sheet" />
            <Tab label="Cash Flow" />
          </Tabs>
        </Box>

        {activeTab === 0 && renderIncomeStatement()}
        {activeTab === 1 && renderBalanceSheet()}
        {activeTab === 2 && renderCashFlow()}
      </CardContent>
    </Card>
  );
}

export default FinancialStatements;
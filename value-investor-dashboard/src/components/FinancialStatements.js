import React, { useState, useEffect } from 'react';
import FinancialDataService from '../services/api';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Stack,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
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
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useStock } from '../contexts/StockContext';
function FinancialStatements() {
    const { stockData } = useStock();
  const [activeTab, setActiveTab] = useState(0);
  const [timeframe, setTimeframe] = useState('quarterly');

  const formatLargeNumber = (num) => {
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    return `$${num.toFixed(2)}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const prepareChartData = (statements) => {
    return statements.map(statement => ({
      date: formatDate(statement.date),
      revenue: statement.revenue / 1e6,
      grossProfit: statement.grossProfit / 1e6,
      operatingIncome: statement.operatingIncome / 1e6,
      netIncome: statement.netIncome / 1e6,
    })).reverse();
  };

  const calculateGrowth = (current, previous) => {
    if (!previous || previous === 0) return 'N/A';
    const growth = ((current - previous) / Math.abs(previous)) * 100;
    return `${growth >= 0 ? '+' : ''}${growth.toFixed(2)}%`;
  };

  const renderIncomeStatement = () => {
    const statements = timeframe === 'quarterly' ? 
      stockData.financials.slice(0, 8) : 
      stockData.financials.filter((_, index) => index % 4 === 0).slice(0, 5);

    const chartData = prepareChartData(statements);

    return (
      <Stack spacing={3}>
        <Card
          elevation={0}
          sx={{
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(108, 99, 255, 0.1)',
          }}
        >
          <CardContent>
            <Typography variant="h6" gutterBottom fontWeight={700}>
              Key Metrics Trend
            </Typography>
            <Box sx={{ height: 400 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="revenue" name="Revenue" stroke="#6C63FF" />
                  <Line type="monotone" dataKey="grossProfit" name="Gross Profit" stroke="#4ECDC4" />
                  <Line type="monotone" dataKey="operatingIncome" name="Operating Income" stroke="#FF6B6B" />
                  <Line type="monotone" dataKey="netIncome" name="Net Income" stroke="#45B7D1" />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>

        <TableContainer component={Card}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Metric</TableCell>
                {statements.map((statement, index) => (
                  <TableCell key={index} align="right">
                    {formatDate(statement.date)}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {[
                { label: 'Revenue', key: 'revenue' },
                { label: 'Cost of Revenue', key: 'costOfRevenue' },
                { label: 'Gross Profit', key: 'grossProfit' },
                { label: 'Operating Expenses', key: 'operatingExpenses' },
                { label: 'Operating Income', key: 'operatingIncome' },
                { label: 'Net Income', key: 'netIncome' },
                { label: 'EPS', key: 'eps' },
                { label: 'EBITDA', key: 'ebitda' },
              ].map((row) => (
                <TableRow key={row.label}>
                  <TableCell component="th" scope="row">
                    {row.label}
                  </TableCell>
                  {statements.map((statement, index) => (
                    <TableCell key={index} align="right">
                      <Stack>
                        <Typography>
                          {row.key === 'eps' 
                            ? `$${statement[row.key].toFixed(2)}`
                            : formatLargeNumber(statement[row.key])}
                        </Typography>
                        {index < statements.length - 1 && (
                          <Typography variant="caption" color="text.secondary">
                            {calculateGrowth(statement[row.key], statements[index + 1][row.key])}
                          </Typography>
                        )}
                      </Stack>
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Stack>
    );
  };

  const renderBalanceSheet = () => {
    const statements = timeframe === 'quarterly' ? 
      stockData.balanceSheet.slice(0, 8) : 
      stockData.balanceSheet.filter((_, index) => index % 4 === 0).slice(0, 5);

    return (
      <TableContainer component={Card}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Metric</TableCell>
              {statements.map((statement, index) => (
                <TableCell key={index} align="right">
                  {formatDate(statement.date)}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {[
              { label: 'Total Assets', key: 'totalAssets' },
              { label: 'Current Assets', key: 'totalCurrentAssets' },
              { label: 'Cash & Equivalents', key: 'cashAndCashEquivalents' },
              { label: 'Total Liabilities', key: 'totalLiabilities' },
              { label: 'Current Liabilities', key: 'totalCurrentLiabilities' },
              { label: 'Long Term Debt', key: 'longTermDebt' },
              { label: 'Total Equity', key: 'totalStockholdersEquity' },
              { label: 'Retained Earnings', key: 'retainedEarnings' },
            ].map((row) => (
              <TableRow key={row.label}>
                <TableCell component="th" scope="row">
                  {row.label}
                </TableCell>
                {statements.map((statement, index) => (
                  <TableCell key={index} align="right">
                    <Stack>
                      <Typography>
                        {formatLargeNumber(statement[row.key])}
                      </Typography>
                      {index < statements.length - 1 && (
                        <Typography variant="caption" color="text.secondary">
                          {calculateGrowth(statement[row.key], statements[index + 1][row.key])}
                        </Typography>
                      )}
                    </Stack>
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
    const statements = timeframe === 'quarterly' ? 
      stockData.cashFlow.slice(0, 8) : 
      stockData.cashFlow.filter((_, index) => index % 4 === 0).slice(0, 5);

    const chartData = statements.map(statement => ({
      date: formatDate(statement.date),
      operating: statement.operatingCashFlow / 1e6,
      investing: statement.investingCashFlow / 1e6,
      financing: statement.financingCashFlow / 1e6,
      freeCashFlow: statement.freeCashFlow / 1e6,
    })).reverse();

    return (
      <Stack spacing={3}>
        <Card
          elevation={0}
          sx={{
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(108, 99, 255, 0.1)',
          }}
        >
          <CardContent>
            <Typography variant="h6" gutterBottom fontWeight={700}>
              Cash Flow Trend
            </Typography>
            <Box sx={{ height: 400 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="operating" name="Operating CF" stroke="#6C63FF" />
                  <Line type="monotone" dataKey="investing" name="Investing CF" stroke="#4ECDC4" />
                  <Line type="monotone" dataKey="financing" name="Financing CF" stroke="#FF6B6B" />
                  <Line type="monotone" dataKey="freeCashFlow" name="Free Cash Flow" stroke="#45B7D1" />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>

        <TableContainer component={Card}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Metric</TableCell>
                {statements.map((statement, index) => (
                  <TableCell key={index} align="right">
                    {formatDate(statement.date)}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {[
                { label: 'Operating Cash Flow', key: 'operatingCashFlow' },
                { label: 'Investing Cash Flow', key: 'investingCashFlow' },
                { label: 'Financing Cash Flow', key: 'financingCashFlow' },
                { label: 'Free Cash Flow', key: 'freeCashFlow' },
                { label: 'Capital Expenditure', key: 'capitalExpenditure' },
                { label: 'Dividends Paid', key: 'dividendsPaid' },
              ].map((row) => (
                <TableRow key={row.label}>
                  <TableCell component="th" scope="row">
                    {row.label}
                  </TableCell>
                  {statements.map((statement, index) => (
                    <TableCell key={index} align="right">
                      <Stack>
                        <Typography>
                          {formatLargeNumber(statement[row.key])}
                        </Typography>
                        {index < statements.length - 1 && (
                          <Typography variant="caption" color="text.secondary">
                            {calculateGrowth(statement[row.key], statements[index + 1][row.key])}
                          </Typography>
                        )}
                      </Stack>
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Stack>
    );
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
        <Typography variant="h4" gutterBottom fontWeight={800}>
          Financial Statements 📊
        </Typography>

        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
          <Tabs
            value={activeTab}
            onChange={(e, newValue) => setActiveTab(newValue)}
            sx={{ mb: 2 }}
          >
            <Tab label="Income Statement" />
            <Tab label="Balance Sheet" />
            <Tab label="Cash Flow" />
          </Tabs>

          <ToggleButtonGroup
            value={timeframe}
            exclusive
            onChange={(e, value) => value && setTimeframe(value)}
            size="small"
          >
            <ToggleButton value="quarterly">Quarterly</ToggleButton>
            <ToggleButton value="annual">Annual</ToggleButton>
          </ToggleButtonGroup>
        </Stack>

        {activeTab === 0 && renderIncomeStatement()}
        {activeTab === 1 && renderBalanceSheet()}
        {activeTab === 2 && renderCashFlow()}
      </Paper>
    </Stack>
  );
}

export default FinancialStatements;
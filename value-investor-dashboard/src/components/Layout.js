import React, { useState } from 'react';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  useTheme,
  Divider,
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import CalculateIcon from '@mui/icons-material/Calculate';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import FilterListIcon from '@mui/icons-material/FilterList';
import NewspaperIcon from '@mui/icons-material/Newspaper';
import ChecklistIcon from '@mui/icons-material/CheckBox';
import WarningIcon from '@mui/icons-material/Warning';
import ShowChartIcon from '@mui/icons-material/ShowChart';

const drawerWidth = 280;

function Layout({ children }) {
  const [open, setOpen] = useState(true);
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const navigationItems = [
    { title: 'Dashboard', path: '/', icon: <DashboardIcon /> },
    { title: 'Stock Analysis', path: '/analysis', icon: <AnalyticsIcon /> },
    { title: 'Valuation Models', path: '/valuation', icon: <CalculateIcon /> },
    { title: 'Portfolio Tracker', path: '/portfolio', icon: <AccountBalanceIcon /> },
    { title: 'Stock Screener', path: '/screener', icon: <FilterListIcon /> },
    { title: 'News & Research', path: '/news', icon: <NewspaperIcon /> },
    { title: 'Investment Checklist', path: '/checklist', icon: <ChecklistIcon /> },
    { title: 'Risk Assessment', path: '/risk', icon: <WarningIcon /> },
  ];

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          zIndex: theme.zIndex.drawer + 1,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(108, 99, 255, 0.1)',
        }}
      >
        <Toolbar>
          <IconButton
            color="primary"
            aria-label="open drawer"
            onClick={() => setOpen(!open)}
            edge="start"
            sx={{ mr: 2 }}
          >
            {open ? <ChevronLeftIcon /> : <MenuIcon />}
          </IconButton>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <ShowChartIcon sx={{ color: '#6C63FF', mr: 1 }} />
            <Typography variant="h6" color="primary" fontWeight={800}>
              ValueInvestor
            </Typography>
          </Box>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: 'border-box',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
            border: 'none',
            borderRight: '1px solid rgba(108, 99, 255, 0.1)',
            transform: open ? 'translateX(0)' : `translateX(-${drawerWidth}px)`,
            transition: theme.transitions.create('transform', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
          },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto', mt: 2 }}>
          <List>
            {navigationItems.map((item) => (
              <ListItem
                button
                key={item.title}
                onClick={() => navigate(item.path)}
                sx={{
                  mb: 1,
                  mx: 2,
                  borderRadius: 2,
                  backgroundColor:
                    location.pathname === item.path
                      ? 'rgba(108, 99, 255, 0.1)'
                      : 'transparent',
                  '&:hover': {
                    backgroundColor: 'rgba(108, 99, 255, 0.05)',
                  },
                }}
              >
                <ListItemIcon sx={{ color: '#6C63FF' }}>{item.icon}</ListItemIcon>
                <ListItemText
                  primary={item.title}
                  sx={{
                    '& .MuiListItemText-primary': {
                      fontWeight: location.pathname === item.path ? 600 : 400,
                      color: location.pathname === item.path ? '#6C63FF' : 'inherit',
                    },
                  }}
                />
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 4,
          background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8eb 100%)',
          minHeight: '100vh',
          marginLeft: open ? 0 : `-${drawerWidth}px`,
          transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
}

export default Layout;
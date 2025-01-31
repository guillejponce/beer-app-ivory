import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import BeerCounter from './pages/BeerCounter';
import Stats from './pages/Stats';
import PersonalStats from './pages/PersonalStats';
import { 
  Tabs, 
  Tab, 
  Box, 
  useTheme, 
  useMediaQuery,
  IconButton,
  Menu,
  MenuItem,
  Typography
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useState } from 'react';

function NavTabs() {
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [anchorEl, setAnchorEl] = useState(null);

  const COLORS = {
    primary: '#8B4513',
    light: '#FFE4C4',
  };

  const getTabValue = () => {
    const path = location.pathname;
    if (path === '/') return 0;
    if (path === '/stats') return 1;
    if (path === '/personal') return 2;
    return 0;
  };

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  if (isMobile) {
    return (
      <>
        <IconButton
          size="large"
          edge="start"
          color="inherit"
          aria-label="menu"
          onClick={handleMenuClick}
          sx={{ ml: 2 }}
        >
          <MenuIcon />
        </IconButton>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          sx={{
            '& .MuiPaper-root': {
              backgroundColor: COLORS.primary,
              color: 'white',
            }
          }}
        >
          <MenuItem 
            component={Link} 
            to="/" 
            onClick={handleMenuClose}
            selected={location.pathname === '/'}
          >
            Counter
          </MenuItem>
          <MenuItem 
            component={Link} 
            to="/stats" 
            onClick={handleMenuClose}
            selected={location.pathname === '/stats'}
          >
            Stats Generales
          </MenuItem>
          <MenuItem 
            component={Link} 
            to="/personal" 
            onClick={handleMenuClose}
            selected={location.pathname === '/personal'}
          >
            Stats Individuales
          </MenuItem>
        </Menu>
      </>
    );
  }

  return (
    <Tabs 
      value={getTabValue()} 
      sx={{ 
        '& .MuiTab-root': {
          color: 'rgba(255, 255, 255, 0.7)',
          '&.Mui-selected': {
            color: 'white',
          },
        },
        '& .MuiTabs-indicator': {
          backgroundColor: COLORS.light,
        },
      }}
    >
      <Tab label="Counter" component={Link} to="/" />
      <Tab label="Stats Generales" component={Link} to="/stats" />
      <Tab label="Stats Individuales" component={Link} to="/personal" />
    </Tabs>
  );
}

function App() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Box sx={{ 
          bgcolor: '#8B4513',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
        }}>
          <div className="container mx-auto">
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center',
              justifyContent: isMobile ? 'space-between' : 'flex-start',
              p: 2,
            }}>
              <Typography 
                variant={isMobile ? "h6" : "h5"} 
                component="h1" 
                sx={{ 
                  color: 'white',
                  fontWeight: 'bold',
                  flexShrink: 0,
                }}
              >
                🍺 Ivory Toast
              </Typography>
              <NavTabs />
            </Box>
          </div>
        </Box>

        <main className="container mx-auto p-4">
          <Routes>
            <Route path="/" element={<BeerCounter />} />
            <Route path="/stats" element={<Stats />} />
            <Route path="/personal" element={<PersonalStats />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;

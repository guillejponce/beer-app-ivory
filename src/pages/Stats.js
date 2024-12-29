import React, { useEffect, useState } from 'react';
import { getStats } from '../utils/excelUtils';
import {
  Container,
  Typography,
  Paper,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box,
  Card,
  CardContent,
  Chip,
  ToggleButton,
  ToggleButtonGroup,
  useTheme,
  LinearProgress,
  useMediaQuery,
} from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Stats = () => {
  const [stats, setStats] = useState(null);
  const [graphMetric, setGraphMetric] = useState('volume');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Beer-themed colors
  const COLORS = {
    primary: '#8B4513', // Saddle Brown
    secondary: '#DEB887', // Burlywood
    accent: '#D2691E', // Chocolate
    light: '#FFE4C4', // Bisque
    background: '#FFF8DC', // Cornsilk
    highlight: '#DAA520', // Goldenrod
  };

  useEffect(() => {
    const fetchStats = async () => {
      const data = await getStats();
      setStats(data);
    };
    fetchStats();
  }, []);

  const handleMetricChange = (event, newMetric) => {
    if (newMetric !== null) {
      setGraphMetric(newMetric);
    }
  };

  if (!stats) {
    return <Typography>Loading...</Typography>;
  }

  const totalProgress = (stats.summary.totalBeers / 5000) * 100;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h3" gutterBottom align="center" 
        sx={{ 
          fontWeight: 'bold', 
          color: COLORS.primary,
          textShadow: '2px 2px 4px rgba(139, 69, 19, 0.1)',
          mb: 4 
        }}>
        🏆 Ivory Toast Stats 🍺
      </Typography>

      {/* Progress Bar */}
      <Paper sx={{ 
        p: 3, 
        mb: 4,
        bgcolor: COLORS.background,
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      }}>
        <Typography variant="h6" gutterBottom sx={{ color: COLORS.primary }}>
          Progreso hacia las 5000 cervezas 🎯
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Box sx={{ width: '100%', mr: 1 }}>
            <LinearProgress 
              variant="determinate" 
              value={Math.min(totalProgress, 100)} 
              sx={{
                height: 10,
                borderRadius: 5,
                backgroundColor: COLORS.light,
                '& .MuiLinearProgress-bar': {
                  backgroundColor: COLORS.highlight,
                }
              }}
            />
          </Box>
          <Box sx={{ minWidth: 35 }}>
            <Typography variant="body2" color="text.secondary">{`${totalProgress.toFixed(1)}%`}</Typography>
          </Box>
        </Box>
        <Typography variant="body2" color="text.secondary">
          {`${stats.summary.totalBeers} de 5000 cervezas`}
        </Typography>
      </Paper>

      {/* Achievements Section */}
      {stats.achievements && stats.achievements.length > 0 && (
        <Box mb={4}>
          <Typography variant="h5" gutterBottom sx={{ 
            color: COLORS.primary,
            textShadow: '1px 1px 2px rgba(139, 69, 19, 0.1)',
            mb: 3
          }}>
            🌟 Logros del Equipo
          </Typography>
          <Grid container spacing={2}>
            {stats.achievements.map((achievement, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Card sx={{ 
                  height: '100%',
                  backgroundColor: achievement.player === 'Team' ? COLORS.background : COLORS.light,
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 6px 12px rgba(0,0,0,0.15)'
                  }
                }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom color={COLORS.primary}>
                      {achievement.title}
                    </Typography>
                    <Typography variant="body1">
                      {achievement.description}
                    </Typography>
                    <Box mt={1}>
                      <Chip 
                        label={achievement.player} 
                        sx={{ 
                          backgroundColor: achievement.player === 'Team' ? COLORS.primary : COLORS.accent,
                          color: 'white',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                        }}
                        size="small"
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Summary Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={6} md={3}>
          <Paper sx={{ 
            p: 2, 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            bgcolor: COLORS.background,
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            transition: 'transform 0.2s',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 6px 12px rgba(0,0,0,0.15)'
            }
          }}>
            <Typography variant="h6" color={COLORS.primary}>Total Litros</Typography>
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: COLORS.accent }}>{stats.summary.totalVolume}L</Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} md={3}>
          <Paper sx={{ 
            p: 2, 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            bgcolor: COLORS.background,
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            transition: 'transform 0.2s',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 6px 12px rgba(0,0,0,0.15)'
            }
          }}>
            <Typography variant="h6" color={COLORS.primary}>Total Cervezas</Typography>
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: COLORS.accent }}>{stats.summary.totalBeers}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} md={3}>
          <Paper sx={{ 
            p: 2, 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            bgcolor: COLORS.background,
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            transition: 'transform 0.2s',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 6px 12px rgba(0,0,0,0.15)'
            }
          }}>
            <Typography variant="h6" color={COLORS.primary}>Participantes</Typography>
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: COLORS.accent }}>{stats.summary.totalParticipants}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} md={3}>
          <Paper sx={{ 
            p: 2, 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            bgcolor: COLORS.background,
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            transition: 'transform 0.2s',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 6px 12px rgba(0,0,0,0.15)'
            }
          }}>
            <Typography variant="h6" color={COLORS.primary}>Promedio L/Persona</Typography>
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: COLORS.accent }}>{stats.summary.averageBeers.toFixed(1)}L</Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Rankings Table */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ 
            p: 2, 
            mb: 4,
            bgcolor: COLORS.background,
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          }}>
            <Typography variant="h6" gutterBottom sx={{ color: COLORS.primary }}>
              🏆 Ranking Individual
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ color: COLORS.primary }}>Jugador</TableCell>
                    <TableCell align="right" sx={{ color: COLORS.primary }}>Litros</TableCell>
                    <TableCell align="right" sx={{ color: COLORS.primary }}>Cantidad</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {stats.rankings.map((player, index) => (
                    <TableRow key={player.name} sx={{ 
                      backgroundColor: index === 0 ? COLORS.light : 'inherit',
                      '&:hover': { 
                        backgroundColor: COLORS.light,
                        transform: 'scale(1.01)',
                        transition: 'all 0.2s'
                      }
                    }}>
                      <TableCell>{index === 0 ? `🌟 ${player.name}` : player.name}</TableCell>
                      <TableCell align="right">{player.totalVolume}L</TableCell>
                      <TableCell align="right">{player.totalQuantity}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Brand Stats */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ 
            p: 2, 
            mb: 4,
            bgcolor: COLORS.background,
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          }}>
            <Typography variant="h6" gutterBottom sx={{ color: COLORS.primary }}>
              🍺 Cervezas Favoritas
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ color: COLORS.primary }}>Marca</TableCell>
                    <TableCell align="right" sx={{ color: COLORS.primary }}>Litros</TableCell>
                    <TableCell align="right" sx={{ color: COLORS.primary }}>Cantidad</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {stats.brandStats.map((brand, index) => (
                    <TableRow key={brand.name} sx={{ 
                      backgroundColor: index === 0 ? COLORS.light : 'inherit',
                      '&:hover': { 
                        backgroundColor: COLORS.light,
                        transform: 'scale(1.01)',
                        transition: 'all 0.2s'
                      }
                    }}>
                      <TableCell>{index === 0 ? `🌟 ${brand.name}` : brand.name}</TableCell>
                      <TableCell align="right">{brand.volume.toFixed(1)}L</TableCell>
                      <TableCell align="right">{brand.quantity}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Graphs Section */}
      <Box mb={4}>
        <Box mb={2} display="flex" justifyContent="center">
          <ToggleButtonGroup
            value={graphMetric}
            exclusive
            onChange={handleMetricChange}
            aria-label="graph metric"
            sx={{ 
              mb: 2,
              '& .MuiToggleButton-root': {
                color: COLORS.primary,
                '&.Mui-selected': {
                  backgroundColor: COLORS.light,
                  color: COLORS.accent,
                  '&:hover': {
                    backgroundColor: COLORS.light,
                  }
                }
              }
            }}
          >
            <ToggleButton value="volume" aria-label="volume">
              Litros
            </ToggleButton>
            <ToggleButton value="quantity" aria-label="quantity">
              Cantidad
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {/* Daily Stats Chart */}
        <Paper sx={{ 
          p: 2, 
          mb: 4,
          bgcolor: COLORS.background,
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        }}>
          <Typography variant="h6" gutterBottom sx={{ color: COLORS.primary }}>
            📈 Consumo Diario
          </Typography>
          <Box sx={{ height: isMobile ? 200 : 300 }}>
            <ResponsiveContainer>
              <LineChart data={stats.dailyStats}>
                <CartesianGrid strokeDasharray="3 3" stroke={COLORS.secondary} />
                <XAxis 
                  dataKey="date" 
                  tick={{ fill: COLORS.primary }}
                  interval={isMobile ? 6 : 2}
                />
                <YAxis tick={{ fill: COLORS.primary }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: COLORS.background,
                    borderColor: COLORS.primary
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey={graphMetric === 'volume' ? 'volume' : 'quantity'} 
                  stroke={COLORS.accent} 
                  name={graphMetric === 'volume' ? 'Litros' : 'Cantidad'}
                  strokeWidth={2}
                  dot={{ fill: COLORS.accent, strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Stats; 
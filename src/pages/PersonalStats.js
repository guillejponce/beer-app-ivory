import React, { useEffect, useState } from 'react';
import { getStats, readExcelData, getPlayerFavoriteBeer, getPlayerLastRecord } from '../utils/excelUtils';
import {
  Container,
  Typography,
  Paper,
  Box,
  Card,
  CardContent,
  Grid,
  useTheme,
  useMediaQuery,
} from '@mui/material';

const ROAST_MESSAGES = [
  "🏆 El más alcohólico del grupo. Necesitas ayuda profesional urgente, felicitaciones ctm! 🍺",
  "🥈 Segundo lugar, el primero de los perdedores. Sigue así alcoholico ql! 🏃",
  "🥉 El bronce es de los mediocres, pero al menos estás en el podio borracho ql! 🎭",
  "😤 Cuarto lugar, ni pa'l podio sirves. Toma más rápido csm! 🍺",
  "🎭 Quinto lugar, el mejor del resto de los perkines. Dale con todo nomás! 🏃‍♂️",
  "🍺 Sexto lugar, vas bien pero necesitas más chelas. Ponle weno! 🎯",
  "🎪 Séptimo, mejor anda a tomar jugo. Despierta conchetumare! 🧃",
  "🌟 Octavo lugar, ni fu ni fa. Échale ganas perrito! 🐕",
  "🎭 Noveno, ¿en serio esto es lo mejor que puedes hacer? Ponle más empeño! 🎪",
  "🎪 Décimo, estás más perdido que guagua en el metro. Reacciona! 👶",
  "😴 Decimoprimero, ¿viniste a tomar o a mirar? Despierta ctm! 🌱",
  "🐌 Decimosegundo, más lento que tortuga en el desierto. Acelera! 🏃",
  "🐣 Decimotercero, la guagua del grupo. ¿Necesitas que te compre un juguito perrin? 🧃",
  "💤 Decimocuarto, mejor anda a tomar agua. Ponle weno csm! 🚰",
  "🦥 Último lugar, la vergüenza del grupo. Necesitas clases de chupar! 🎓"
];

const PersonalStats = () => {
  const [stats, setStats] = useState(null);
  const [rawData, setRawData] = useState(null);
  const theme = useTheme();

  const COLORS = {
    primary: '#8B4513',
    secondary: '#DEB887',
    accent: '#D2691E',
    light: '#FFE4C4',
    background: '#FFF8DC',
    highlight: '#DAA520',
  };

  useEffect(() => {
    const fetchData = async () => {
      const statsData = await getStats();
      const rawData = await readExcelData();
      setStats(statsData);
      setRawData(rawData);
    };
    fetchData();
  }, []);

  if (!stats || !rawData) {
    return <Typography>Loading...</Typography>;
  }

  // Get formatted date like in other views
  const getFormattedDate = (record) => {
    if (!record || !record.TIMESTAMP) return 'Sin registros';

    const date = record.DATE.split('-').reverse().slice(0, 2).join('/');
    const time = new Date(record.TIMESTAMP).toLocaleTimeString('es-CL', {
      timeZone: 'America/Santiago',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });

    return `${date} ${time}`;
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h3" gutterBottom align="center" 
        sx={{ 
          fontWeight: 'bold', 
          color: COLORS.primary,
          textShadow: '2px 2px 4px rgba(139, 69, 19, 0.1)',
          mb: 4 
        }}>
        🍺 Ranking de Borrachos 🏆
      </Typography>

      <Grid container spacing={3}>
        {stats.rankings.map((player, index) => {
          const favoriteBeer = getPlayerFavoriteBeer(rawData, player.name);
          const lastRecord = getPlayerLastRecord(rawData, player.name);

          return (
            <Grid item xs={12} key={player.name}>
              <Card sx={{ 
                backgroundColor: index === 0 ? COLORS.highlight : COLORS.background,
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 6px 12px rgba(0,0,0,0.15)',
                  transition: 'all 0.3s ease'
                }
              }}>
                <CardContent>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={3}>
                      <Typography variant="h5" sx={{ color: COLORS.primary, fontWeight: 'bold' }}>
                        #{index + 1} {player.name}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={9}>
                      <Typography variant="body1" sx={{ color: COLORS.accent, mb: 2 }}>
                        {ROAST_MESSAGES[index]}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                        <Paper sx={{ p: 1, bgcolor: COLORS.light, flex: 1 }}>
                          <Typography variant="subtitle2" color={COLORS.primary}>Total Consumido</Typography>
                          <Typography variant="h6" color={COLORS.accent}>
                            {player.totalVolume}L ({player.totalQuantity} 🍺)
                          </Typography>
                        </Paper>
                        <Paper sx={{ p: 1, bgcolor: COLORS.light, flex: 1 }}>
                          <Typography variant="subtitle2" color={COLORS.primary}>Cerveza Favorita</Typography>
                          <Typography variant="h6" color={COLORS.accent}>
                            {favoriteBeer ? (
                              <>
                                {favoriteBeer.name} ({favoriteBeer.volume.toFixed(1)}L)
                              </>
                            ) : 'N/A'}
                          </Typography>
                        </Paper>
                        <Paper sx={{ p: 1, bgcolor: COLORS.light, flex: 1 }}>
                          <Typography variant="subtitle2" color={COLORS.primary}>Último Registro</Typography>
                          <Typography variant="h6" color={COLORS.accent}>
                            {getFormattedDate(lastRecord)}
                          </Typography>
                        </Paper>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Container>
  );
};

export default PersonalStats; 
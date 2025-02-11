const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const getChileDate = () => {
  return new Date().toLocaleString('en-US', {
    timeZone: 'America/Santiago',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).split(',')[0].split('/').map(n => n.padStart(2, '0')).reverse().join('-');
};

const TEAM_GOAL = {
  beers: 5000,
  deadline: new Date('2025-12-31'),
  startDate: new Date('2023-01-01')
};

const calculateProgress = (currentBeers) => {
  const now = new Date();
  const totalDays = (TEAM_GOAL.deadline - TEAM_GOAL.startDate) / (1000 * 60 * 60 * 24);
  const daysPassed = (now - TEAM_GOAL.startDate) / (1000 * 60 * 60 * 24);
  const daysLeft = (TEAM_GOAL.deadline - now) / (1000 * 60 * 60 * 24);
  
  const progress = (currentBeers / TEAM_GOAL.beers) * 100;
  const expectedProgress = (daysPassed / totalDays) * 100;
  const beersPerDay = daysLeft > 0 ? (TEAM_GOAL.beers - currentBeers) / daysLeft : 0;
  
  return {
    current: currentBeers,
    goal: TEAM_GOAL.beers,
    progress: Number(progress.toFixed(1)),
    expectedProgress: Number(expectedProgress.toFixed(1)),
    beersNeeded: TEAM_GOAL.beers - currentBeers,
    daysLeft: Math.ceil(daysLeft),
    beersPerDay: Math.ceil(beersPerDay)
  };
};

const getAchievements = (stats) => {
  const achievements = [];
  const progress = calculateProgress(stats.summary.totalBeers);
  
  // Goal Progress Achievement
  achievements.push({
    player: 'Team',
    title: '🎯 Objetivo 5000',
    description: `¡${progress.current} de ${progress.goal} cervezas! (${progress.progress}%)
    Faltan ${progress.beersNeeded} cervezas en ${progress.daysLeft} días.
    Necesitamos ${progress.beersPerDay} cervezas/día para lograrlo!`
  });

  // Progress Status
  if (progress.progress > progress.expectedProgress) {
    achievements.push({
      player: 'Team',
      title: '🚀 Ahead of Schedule',
      description: `¡Vamos adelantados! Deberíamos estar en ${progress.expectedProgress}% y ya vamos en ${progress.progress}%!`
    });
  }

  // Personal achievements
  stats.rankings.forEach(player => {
    if (player.totalVolume >= 50) {
      achievements.push({
        player: player.name,
        title: '🏆 Ivory Legend',
        description: `${player.name} ha superado los 50L! Un verdadero Ivory Toast champion!`
      });
    }
    if (player.totalQuantity >= 100) {
      achievements.push({
        player: player.name,
        title: '🌟 Beer Master',
        description: `${player.name} ha tomado más de 100 cervezas! La leyenda crece!`
      });
    }
  });

  // Team achievements
  if (stats.summary.totalVolume >= 500) {
    achievements.push({
      player: 'Team',
      title: '🎉 Team Victory',
      description: `Ivory Toast ha superado los 500L! Somos imparables!`
    });
  }

  // Daily achievements
  const todayStats = stats.dailyStats.find(day => day.date === getChileDate());
  if (todayStats && todayStats.volume >= 5) {
    achievements.push({
      player: 'Team',
      title: '🔥 Hot Streak',
      description: `El equipo está on fire! Más de 5L hoy!`
    });
  }

  // Brand loyalty
  const favoriteBeers = stats.brandStats.slice(0, 3).map(beer => ({
    name: beer.name,
    percentage: ((beer.volume / stats.summary.totalVolume) * 100).toFixed(1)
  }));

  if (favoriteBeers.length > 0) {
    achievements.push({
      player: 'Team',
      title: '🍺 Team Favorites',
      description: `Las cervezas favoritas de Ivory Toast: ${favoriteBeers.map(beer => 
        `${beer.name} (${beer.percentage}%)`).join(', ')}`
    });
  }

  return achievements;
};

const fetchWithRetry = async (url, options, retries = 3, delay = 2000) => {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response;
    } catch (error) {
      console.log(`Attempt ${i + 1} failed. Retrying in ${delay}ms...`);
      await wait(delay);
      if (i === retries - 1) throw error;
    }
  }
};

export const readExcelData = async () => {
  try {
    const response = await fetch(`${API_URL}/beers`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error reading Excel file:', error);
    return [];
  }
};

export const writeExcelData = async (data) => {
  try {
    const payload = { data };
    console.log('📦 Payload a enviar:', payload);
    console.log('📏 Tamaño del payload:', JSON.stringify(payload).length, 'bytes');
    console.log('🔍 Detalle del payload:', {
      registros: payload.data.length,
      primerRegistro: payload.data[0],
      ultimoRegistro: payload.data[payload.data.length - 1]
    });

    const response = await fetch(`${API_URL}/beers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    console.log('📡 Status de la respuesta:', response.status);
    const result = await response.json();
    console.log('✅ Respuesta del servidor:', result);
    
    return result.success;
  } catch (error) {
    console.error('❌ Error writing to Excel file:', error);
    return false;
  }
};

export const addBeerRecord = async (player, brand, volume, amount, timestamp) => {
  const currentData = await readExcelData();
  const newId = currentData.length > 0 ? Math.max(...currentData.map(record => record.ID)) + 1 : 1;
  
  const newRecord = {
    ID: newId,
    PLAYER: player,
    BRAND: brand,
    DATE: getChileDate(),
    VOLUME: volume,
    AMOUNT: amount,
    TOTAL_VOLUME: volume * amount,
    TIMESTAMP: timestamp
  };

  const updatedData = [...currentData, newRecord];
  return writeExcelData(updatedData);
};

export const deleteBeerRecord = async (id) => {
  const currentData = await readExcelData();
  const updatedData = currentData.filter(record => record.ID !== id);
  return writeExcelData(updatedData);
};

export const getStats = async () => {
  const data = await readExcelData();
  
  const beersByPerson = data.reduce((acc, record) => {
    if (!acc[record.PLAYER]) {
      acc[record.PLAYER] = {
        totalVolume: 0,
        totalQuantity: 0
      };
    }
    acc[record.PLAYER].totalVolume += record.TOTAL_VOLUME;
    acc[record.PLAYER].totalQuantity += record.AMOUNT;
    return acc;
  }, {});

  const rankings = Object.entries(beersByPerson)
    .map(([name, stats]) => ({
      name,
      totalVolume: Number(stats.totalVolume.toFixed(2)),
      totalQuantity: stats.totalQuantity
    }))
    .sort((a, b) => b.totalVolume - a.totalVolume);

  const brandStats = data.reduce((acc, record) => {
    if (!acc[record.BRAND]) {
      acc[record.BRAND] = {
        name: record.BRAND,
        volume: 0,
        quantity: 0
      };
    }
    acc[record.BRAND].volume += record.TOTAL_VOLUME;
    acc[record.BRAND].quantity += record.AMOUNT;
    return acc;
  }, {});

  const dailyStats = data.reduce((acc, record) => {
    if (!acc[record.DATE]) {
      acc[record.DATE] = {
        date: record.DATE,
        volume: 0,
        quantity: 0
      };
    }
    acc[record.DATE].volume += record.TOTAL_VOLUME;
    acc[record.DATE].quantity += record.AMOUNT;
    return acc;
  }, {});

  const totalBeers = rankings.reduce((sum, person) => sum + person.totalQuantity, 0);
  const totalVolume = rankings.reduce((sum, person) => sum + person.totalVolume, 0);
  const totalParticipants = rankings.length;
  const averageBeers = totalParticipants ? (totalVolume / totalParticipants) : 0;

  const stats = {
    rankings,
    brandStats: Object.values(brandStats)
      .filter(beer => beer.name.toLowerCase() !== 'otras')
      .sort((a, b) => b.volume - a.volume),
    dailyStats: Object.values(dailyStats)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .map(day => ({
        ...day,
        volume: Number(day.volume.toFixed(2))
      })),
    summary: {
      totalBeers,
      totalVolume: Number(totalVolume.toFixed(2)),
      totalParticipants,
      averageBeers: Number(averageBeers.toFixed(2))
    }
  };

  // También actualizar el cálculo de favoriteBeers en getAchievements
  const favoriteBeers = stats.brandStats.slice(0, 3).map(beer => ({
    name: beer.name,
    percentage: ((beer.volume / stats.summary.totalVolume) * 100).toFixed(1)
  }));

  // Add achievements to stats
  stats.achievements = getAchievements(stats);
  
  return stats;
};

export const getPlayerFavoriteBeer = (data, playerName) => {
  // Create a map of beer consumption for this player
  const beerMap = data.reduce((acc, record) => {
    if (record.PLAYER === playerName) {
      if (!acc[record.BRAND]) {
        acc[record.BRAND] = {
          name: record.BRAND,
          volume: 0,
          quantity: 0
        };
      }
      acc[record.BRAND].volume += record.TOTAL_VOLUME;
      acc[record.BRAND].quantity += record.AMOUNT;
    }
    return acc;
  }, {});

  // Convert to array and sort by volume
  const beerStats = Object.values(beerMap)
    .filter(beer => beer.name.toLowerCase() !== 'otras')
    .sort((a, b) => b.volume - a.volume);

  return beerStats[0] || null;
};

export const getPlayerLastRecord = (data, playerName) => {
  const playerRecords = data
    .filter(record => record.PLAYER === playerName && record.TIMESTAMP)
    .sort((a, b) => {
      const dateA = new Date(a.TIMESTAMP);
      const dateB = new Date(b.TIMESTAMP);
      return dateB - dateA;
    });

  return playerRecords[0] || null;
}; 
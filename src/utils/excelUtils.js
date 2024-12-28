const API_URL = process.env.NODE_ENV === 'production' 
  ? '/api'
  : 'http://localhost:3001/api';

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
    const response = await fetch(`${API_URL}/beers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data }),
    });
    const result = await response.json();
    return result.success;
  } catch (error) {
    console.error('Error writing to Excel file:', error);
    return false;
  }
};

export const deleteBeerRecord = async (id) => {
  const currentData = await readExcelData();
  const updatedData = currentData.filter(record => record.ID !== id);
  return writeExcelData(updatedData);
};

export const addBeerRecord = async (player, brand, volume, amount) => {
  const currentData = await readExcelData();
  const newId = currentData.length > 0 ? Math.max(...currentData.map(record => record.ID)) + 1 : 1;
  
  const newRecord = {
    ID: newId,
    PLAYER: player,
    BRAND: brand,
    DATE: new Date().toISOString().split('T')[0], // Format: YYYY-MM-DD
    VOLUME: volume,
    AMOUNT: amount,
    TOTAL_VOLUME: volume * amount // Adding total volume for easier calculations
  };

  const updatedData = [...currentData, newRecord];
  return writeExcelData(updatedData);
};

export const getStats = async () => {
  const data = await readExcelData();
  
  // Group beers by player for both volume and quantity
  const playerStats = data.reduce((acc, record) => {
    const totalVolume = record.TOTAL_VOLUME || (record.VOLUME * (record.AMOUNT || 1));
    const amount = record.AMOUNT || 1;

    if (!acc[record.PLAYER]) {
      acc[record.PLAYER] = {
        name: record.PLAYER,
        totalVolume: 0,
        totalQuantity: 0
      };
    }

    acc[record.PLAYER].totalVolume += totalVolume;
    acc[record.PLAYER].totalQuantity += amount;
    return acc;
  }, {});

  // Convert to array
  const rankings = Object.values(playerStats);

  const totalBeers = rankings.reduce((sum, player) => sum + player.totalQuantity, 0);
  const totalVolume = rankings.reduce((sum, player) => sum + player.totalVolume, 0);
  const totalParticipants = rankings.length;
  const averageBeers = totalParticipants ? (totalVolume / totalParticipants).toFixed(1) : 0;

  // Get brand statistics using total volume
  const brandStats = data.reduce((acc, record) => {
    const totalVolume = record.TOTAL_VOLUME || (record.VOLUME * (record.AMOUNT || 1));
    acc[record.BRAND] = (acc[record.BRAND] || 0) + totalVolume;
    return acc;
  }, {});

  return {
    rankings,
    brandStats: Object.entries(brandStats)
      .map(([brand, volume]) => ({ name: brand, volume }))
      .sort((a, b) => b.volume - a.volume),
    summary: {
      totalBeers,
      totalVolume,
      totalParticipants,
      averageBeers: parseFloat(averageBeers),
    }
  };
}; 
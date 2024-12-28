const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

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

export const addBeerRecord = async (player, brand, volume, amount) => {
  const currentData = await readExcelData();
  const newId = currentData.length > 0 ? Math.max(...currentData.map(record => record.ID)) + 1 : 1;
  
  const newRecord = {
    ID: newId,
    PLAYER: player,
    BRAND: brand,
    DATE: new Date().toISOString().split('T')[0],
    VOLUME: volume,
    AMOUNT: amount,
    TOTAL_VOLUME: volume * amount
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

  return {
    rankings,
    brandStats: Object.values(brandStats).sort((a, b) => b.volume - a.volume),
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
}; 
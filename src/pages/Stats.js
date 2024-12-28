import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { getStats } from '../utils/excelUtils';

const GOAL = 10000;
const DEADLINE = new Date('2025-12-31T23:59:59');

// Ivory Toast theme colors
const COLORS = {
  primary: '#FFD700', // Gold
  secondary: '#8B4513', // Saddle Brown (toast color)
  accent: '#FFA500', // Orange
  background: '#FFFAF0', // Floral White
  text: '#4A3728', // Dark Brown
  success: '#2E8B57', // Sea Green
  warning: '#FF6B6B', // Light Red
  chart: '#D4AF37', // Metallic Gold
};

export default function Stats() {
  const [stats, setStats] = useState({
    rankings: [],
    brandStats: [],
    summary: { totalBeers: 0, totalVolume: 0, totalParticipants: 0, averageBeers: 0 }
  });
  const [sortBy, setSortBy] = useState('volume');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadStats = async () => {
      try {
        setIsLoading(true);
        const data = await getStats();
        setStats(data);
        setError(null);
      } catch (err) {
        setError('¡Oops! Algo salió mal al cargar las estadísticas');
        console.error('Error loading stats:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadStats();
  }, []);

  const getSortedRankings = () => {
    return [...stats.rankings].sort((a, b) => 
      sortBy === 'volume' 
        ? b.totalVolume - a.totalVolume 
        : b.totalQuantity - a.totalQuantity
    );
  };

  const calculateProgress = () => {
    const progress = (stats.summary.totalBeers / GOAL) * 100;
    return Math.min(100, Math.max(0, progress));
  };

  const calculateDaysLeft = () => {
    const now = new Date();
    const diffTime = DEADLINE - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const calculateDailyGoal = () => {
    const daysLeft = calculateDaysLeft();
    if (daysLeft === 0) return 0;
    const remaining = GOAL - stats.summary.totalBeers;
    return Math.max(0, Math.ceil(remaining / daysLeft));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-amber-50">
        <div className="text-lg" style={{ color: COLORS.text }}>
          🍺 Cargando las chelas del Ivory Toast...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-amber-50">
        <div className="text-lg" style={{ color: COLORS.warning }}>
          {error}
        </div>
      </div>
    );
  }

  if (!stats.rankings.length) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-amber-50">
        <div className="text-lg" style={{ color: COLORS.text }}>
          ¡Aún no hay chelas registradas en el Ivory Toast! ¿Qué están esperando? 🍻
        </div>
      </div>
    );
  }

  const sortedRankings = getSortedRankings();
  const progress = calculateProgress();
  const daysLeft = calculateDaysLeft();
  const dailyGoal = calculateDailyGoal();

  return (
    <div className="space-y-8 p-6 min-h-screen" style={{ backgroundColor: COLORS.background }}>
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2" style={{ color: COLORS.text }}>
          🍺 Ivory Toast 🍻
        </h1>
        <p className="text-lg" style={{ color: COLORS.secondary }}>
          El club más sediento del mundo
        </p>
      </div>

      {/* Goal Progress */}
      <div className="bg-white rounded-xl shadow-md p-6" style={{ borderTop: `4px solid ${COLORS.primary}` }}>
        <h2 className="text-2xl font-bold mb-6" style={{ color: COLORS.text }}>
          🎯 Meta Grupal del Ivory Toast: ¡10.000 Chelas!
        </h2>
        <div className="space-y-4">
          <div className="relative pt-1">
            <div className="flex mb-2 items-center justify-between">
              <div>
                <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full" 
                      style={{ backgroundColor: COLORS.primary, color: COLORS.text }}>
                  Progreso Épico
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold inline-block" style={{ color: COLORS.text }}>
                  {progress.toFixed(1)}% 🏆
                </span>
              </div>
            </div>
            <div className="overflow-hidden h-6 mb-4 text-xs flex rounded-full bg-amber-100">
              <div
                style={{ 
                  width: `${progress}%`,
                  backgroundColor: COLORS.primary,
                  transition: 'width 1s ease-in-out'
                }}
                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center animate-pulse"
              >
                {progress > 10 && `${stats.summary.totalBeers} / ${GOAL}`}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg" style={{ backgroundColor: COLORS.primary + '20' }}>
              <h3 className="text-sm font-medium" style={{ color: COLORS.text }}>Chelas Conquistadas</h3>
              <p className="text-3xl font-bold" style={{ color: COLORS.secondary }}>
                {stats.summary.totalBeers} 🍺
              </p>
            </div>
            <div className="p-4 rounded-lg" style={{ backgroundColor: COLORS.secondary + '20' }}>
              <h3 className="text-sm font-medium" style={{ color: COLORS.text }}>Faltan</h3>
              <p className="text-3xl font-bold" style={{ color: COLORS.secondary }}>
                {GOAL - stats.summary.totalBeers} 🎯
              </p>
            </div>
            <div className="p-4 rounded-lg" style={{ backgroundColor: COLORS.accent + '20' }}>
              <h3 className="text-sm font-medium" style={{ color: COLORS.text }}>Días Para Lograrlo</h3>
              <p className="text-3xl font-bold" style={{ color: COLORS.secondary }}>
                {daysLeft} 📅
              </p>
            </div>
          </div>
          <div className="mt-4 p-4 rounded-lg" style={{ backgroundColor: COLORS.warning + '20' }}>
            <h3 className="text-sm font-medium" style={{ color: COLORS.text }}>
              Misión Diaria del Ivory Toast
            </h3>
            <p className="text-3xl font-bold" style={{ color: COLORS.secondary }}>
              {dailyGoal} chelas por día 🍻
            </p>
            <p className="text-xs mt-1" style={{ color: COLORS.text }}>
              ¡Vamos por esas 10.000 antes del 31 de diciembre de 2025!
            </p>
          </div>
        </div>
      </div>

      {/* Rankings */}
      <div className="bg-white rounded-xl shadow-md p-6" style={{ borderTop: `4px solid ${COLORS.secondary}` }}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold" style={{ color: COLORS.text }}>
            👑 Leyendas del Ivory Toast
          </h2>
          <div className="flex items-center space-x-2">
            <span className="text-sm" style={{ color: COLORS.text }}>Ordenar por:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-sm border rounded-md px-2 py-1 focus:outline-none focus:ring-2"
              style={{ borderColor: COLORS.primary, color: COLORS.text }}
            >
              <option value="volume">Litros</option>
              <option value="quantity">Cantidad</option>
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-amber-200">
            <thead className="bg-amber-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: COLORS.text }}>
                  Rango
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: COLORS.text }}>
                  Leyenda
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: COLORS.text }}>
                  Litros Totales
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: COLORS.text }}>
                  Chelas
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-amber-100">
              {sortedRankings.map((person, index) => (
                <tr key={person.name} 
                    className="transition-colors hover:bg-amber-50"
                    style={{ backgroundColor: index === 0 ? COLORS.primary + '20' : 'white' }}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className="font-bold text-lg">
                      {index === 0 ? '🏆' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium" style={{ color: COLORS.text }}>
                    {person.name}
                    {index === 0 ? ' 👑' : index === 1 ? ' 🌟' : index === 2 ? ' ⭐' : ''}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: COLORS.secondary }}>
                    {person.totalVolume.toFixed(1)}L 🍺
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: COLORS.secondary }}>
                    {person.totalQuantity} 🍻
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl shadow-md p-6" style={{ borderTop: `4px solid ${COLORS.accent}` }}>
          <h2 className="text-2xl font-bold mb-6" style={{ color: COLORS.text }}>
            📊 Consumo por Leyenda
          </h2>
          <div className="w-full overflow-x-auto">
            <BarChart width={500} height={300} data={sortedRankings} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={COLORS.primary + '40'} />
              <XAxis dataKey="name" stroke={COLORS.text} />
              <YAxis stroke={COLORS.text} />
              <Tooltip 
                contentStyle={{ backgroundColor: COLORS.background, borderColor: COLORS.primary }}
              />
              <Legend />
              <Bar 
                dataKey={sortBy === 'volume' ? 'totalVolume' : 'totalQuantity'} 
                name={sortBy === 'volume' ? 'Litros 🍺' : 'Chelas 🍻'} 
                fill={COLORS.chart}
              />
            </BarChart>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6" style={{ borderTop: `4px solid ${COLORS.success}` }}>
          <h2 className="text-2xl font-bold mb-6" style={{ color: COLORS.text }}>
            🍺 Chelas Favoritas
          </h2>
          <div className="w-full overflow-x-auto">
            <BarChart width={500} height={300} data={stats.brandStats} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={COLORS.primary + '40'} />
              <XAxis dataKey="name" stroke={COLORS.text} />
              <YAxis stroke={COLORS.text} />
              <Tooltip 
                contentStyle={{ backgroundColor: COLORS.background, borderColor: COLORS.primary }}
              />
              <Legend />
              <Bar dataKey="volume" name="Litros 🍺" fill={COLORS.secondary} />
            </BarChart>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-white rounded-xl shadow-md p-6" style={{ borderTop: `4px solid ${COLORS.primary}` }}>
        <h2 className="text-2xl font-bold mb-6" style={{ color: COLORS.text }}>
          📈 Resumen del Ivory Toast
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg" style={{ backgroundColor: COLORS.primary + '20' }}>
            <h3 className="text-lg font-medium" style={{ color: COLORS.text }}>Total Litros</h3>
            <p className="text-3xl font-bold" style={{ color: COLORS.secondary }}>
              {stats.summary.totalVolume.toFixed(1)}L 🍺
            </p>
          </div>
          <div className="p-4 rounded-lg" style={{ backgroundColor: COLORS.secondary + '20' }}>
            <h3 className="text-lg font-medium" style={{ color: COLORS.text }}>Total Chelas</h3>
            <p className="text-3xl font-bold" style={{ color: COLORS.secondary }}>
              {stats.summary.totalBeers} 🍻
            </p>
          </div>
          <div className="p-4 rounded-lg" style={{ backgroundColor: COLORS.accent + '20' }}>
            <h3 className="text-lg font-medium" style={{ color: COLORS.text }}>Leyendas</h3>
            <p className="text-3xl font-bold" style={{ color: COLORS.secondary }}>
              {stats.summary.totalParticipants} 👑
            </p>
          </div>
          <div className="p-4 rounded-lg" style={{ backgroundColor: COLORS.success + '20' }}>
            <h3 className="text-lg font-medium" style={{ color: COLORS.text }}>Promedio/Leyenda</h3>
            <p className="text-3xl font-bold" style={{ color: COLORS.secondary }}>
              {stats.summary.averageBeers}L 🏆
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center mt-8 pb-8">
        <p className="text-sm" style={{ color: COLORS.text }}>
          Ivory Toast - Haciendo historia, una chela a la vez 🍻
        </p>
      </div>
    </div>
  );
} 
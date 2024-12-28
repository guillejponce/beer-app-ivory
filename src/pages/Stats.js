import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { getStats } from '../utils/excelUtils';
import { Link } from 'react-router-dom';

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
          ¡Aún no hay chelas registradas! ¿Qué están esperando, jugadores? 🍻
        </div>
      </div>
    );
  }

  const sortedRankings = getSortedRankings();
  const progress = calculateProgress();
  const daysLeft = calculateDaysLeft();
  const dailyGoal = calculateDailyGoal();

  return (
    <div className="min-h-screen bg-amber-50 py-6 px-4">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-6 text-amber-900">🎯 Meta del Equipo - 10.000 beers</h2>
          <div className="space-y-4">
            <div className="relative pt-1">
              <div className="flex mb-2 items-center justify-between">
                <div>
                  <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full bg-amber-600 text-white">
                    Progreso Épico
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold inline-block text-amber-900">
                    {calculateProgress().toFixed(1)}% 🏆
                  </span>
                </div>
              </div>
              <div className="w-full bg-amber-200 rounded-full h-4">
                <div
                  className="bg-amber-600 h-4 rounded-full transition-all duration-500 animate-pulse"
                  style={{ width: `${calculateProgress()}%` }}
                >
                  {calculateProgress() > 10 && (
                    <span className="absolute inset-0 text-center text-xs text-white leading-4">
                      {stats.summary.totalBeers} / {GOAL}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-amber-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-amber-900">Chelas Tomadas</h3>
                <p className="text-3xl font-bold text-amber-700">
                  {stats.summary.totalBeers} 🍺
                </p>
              </div>
              <div className="bg-amber-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-amber-900">Faltan</h3>
                <p className="text-3xl font-bold text-amber-700">
                  {GOAL - stats.summary.totalBeers} 🎯
                </p>
              </div>
              <div className="bg-amber-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-amber-900">Días Restantes</h3>
                <p className="text-3xl font-bold text-amber-700">
                  {calculateDaysLeft()} 📅
                </p>
              </div>
              <div className="bg-amber-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-amber-900">Meta Diaria</h3>
                <p className="text-3xl font-bold text-amber-700">
                  {calculateDailyGoal()} 🍻
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-amber-900">🏆 Ranking</h2>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="rounded-md border-amber-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 text-amber-900"
              >
                <option value="volume">Por Volumen</option>
                <option value="quantity">Por Cantidad</option>
              </select>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-amber-200">
                <thead className="bg-amber-50">
                  <tr>
                    <th className="px-3 py-3 text-left text-xs font-medium text-amber-700 uppercase">Jugador</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-amber-700 uppercase">Volumen</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-amber-700 uppercase">Cantidad</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-amber-100">
                  {getSortedRankings().map((player, index) => (
                    <tr key={player.name} className={index === 0 ? 'bg-amber-50' : ''}>
                      <td className="px-3 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="text-lg mr-2">{index === 0 ? '👑' : index === 1 ? '🥈' : index === 2 ? '🥉' : ''}</span>
                          <span className="font-medium text-amber-900">{player.name}</span>
                        </div>
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-amber-700">
                        {player.totalVolume}L
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-amber-700">
                        {player.totalQuantity}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-6 text-amber-900">📊 Consumo por Jugador</h2>
            <div className="w-full overflow-x-auto">
              <BarChart 
                width={500} 
                height={300} 
                data={getSortedRankings()}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#FFD700" opacity={0.2} />
                <XAxis dataKey="name" stroke="#4A3728" />
                <YAxis stroke="#4A3728" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#FFFBEB', 
                    borderColor: '#FFD700',
                    borderRadius: '0.375rem'
                  }}
                />
                <Legend />
                <Bar 
                  dataKey={sortBy === 'volume' ? 'totalVolume' : 'totalQuantity'} 
                  name={sortBy === 'volume' ? 'Volumen (L)' : 'Cantidad'} 
                  fill="#D4AF37"
                />
              </BarChart>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-6 text-amber-900">🍺 Marcas Favoritas</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-amber-200">
                <thead className="bg-amber-50">
                  <tr>
                    <th className="px-3 py-3 text-left text-xs font-medium text-amber-700 uppercase">Marca</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-amber-700 uppercase">Volumen</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-amber-700 uppercase">Cantidad</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-amber-100">
                  {stats.brandStats.map((brand) => (
                    <tr key={brand.name}>
                      <td className="px-3 py-4 whitespace-nowrap font-medium text-amber-900">
                        {brand.name}
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-amber-700">
                        {brand.volume}L
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-amber-700">
                        {brand.quantity}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-6 text-amber-900">📊 Consumo por Marca</h2>
            <div className="w-full overflow-x-auto">
              <BarChart 
                width={500} 
                height={300} 
                data={stats.brandStats}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#FFD700" opacity={0.2} />
                <XAxis dataKey="name" stroke="#4A3728" />
                <YAxis stroke="#4A3728" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#FFFBEB', 
                    borderColor: '#FFD700',
                    borderRadius: '0.375rem'
                  }}
                />
                <Legend />
                <Bar dataKey="volume" name="Volumen (L)" fill="#8B4513" />
                <Bar dataKey="quantity" name="Cantidad" fill="#D4AF37" />
              </BarChart>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-6 text-amber-900">📈 Resumen Total</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-amber-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-amber-900">Total Volumen</h3>
              <p className="text-3xl font-bold text-amber-700">
                {stats.summary.totalVolume}L 🍺
              </p>
            </div>
            <div className="bg-amber-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-amber-900">Total Chelas</h3>
              <p className="text-3xl font-bold text-amber-700">
                {stats.summary.totalBeers} 🍻
              </p>
            </div>
            <div className="bg-amber-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-amber-900">Jugadores</h3>
              <p className="text-3xl font-bold text-amber-700">
                {stats.summary.totalParticipants} 👥
              </p>
            </div>
            <div className="bg-amber-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-amber-900">Promedio/Jugador</h3>
              <p className="text-3xl font-bold text-amber-700">
                {stats.summary.averageBeers}L 📊
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-center pt-6">
          <Link
            to="/"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-amber-600 hover:bg-amber-700"
          >
            ← Volver a Registrar
          </Link>
        </div>
      </div>
    </div>
  );
} 
import { useState, useEffect } from 'react';
import Select from 'react-select';
import { addBeerRecord, readExcelData, deleteBeerRecord } from '../utils/excelUtils';
import { PLAYERS, BEER_BRANDS, VOLUMES } from '../constants/options';
import { Link } from 'react-router-dom';

export default function BeerCounter() {
  const [currentPlayer, setCurrentPlayer] = useState(null);
  const [passcode, setPasscode] = useState('');
  const [passcodeError, setPasscodeError] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [brand, setBrand] = useState(null);
  const [volume, setVolume] = useState(null);
  const [amount, setAmount] = useState(1);
  const [todayRecords, setTodayRecords] = useState([]);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadTodayRecords = async () => {
    const data = await readExcelData();
    
    // Get today's date in Chile's timezone (UTC-3)
    const chileDate = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Santiago" }));
    const today = chileDate.toLocaleDateString('en-US', {
      timeZone: 'America/Santiago',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).split('/').reverse().join('-');

    // Filter today's records and sort by timestamp
    const todaysData = data
      .filter(record => record.DATE === today)
      .sort((a, b) => {
        const timeA = new Date(a.TIMESTAMP || `${a.DATE}T00:00:00-03:00`);
        const timeB = new Date(b.TIMESTAMP || `${b.DATE}T00:00:00-03:00`);
        return timeB - timeA; // Most recent first
      });

    setTodayRecords(todaysData);
  };

  useEffect(() => {
    loadTodayRecords();
  }, []);

  const handlePlayerSelect = (selectedOption) => {
    setCurrentPlayer(selectedOption);
    setPasscodeError('');
    setPasscode('');
    setIsVerified(false);
  };

  const verifyPasscode = () => {
    const player = PLAYERS.find(p => p.value === currentPlayer?.value);
    if (player && player.passcode === passcode) {
      setIsVerified(true);
      setPasscodeError('');
    } else {
      setIsVerified(false);
      setPasscodeError('Número de jugador incorrecto. ¡No seas intruso! 🚫');
    }
  };

  const handlePasscodeSubmit = (e) => {
    e.preventDefault();
    verifyPasscode();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentPlayer || !brand || !volume || amount < 1 || isLoading) return;

    setIsLoading(true);
    try {
      // Get current timestamp in Chile's timezone
      const now = new Date().toLocaleString("en-US", { timeZone: "America/Santiago" });
      const timestamp = new Date(now).toISOString();

      const success = await addBeerRecord(
        currentPlayer.label, 
        brand.label, 
        volume.value, 
        amount,
        timestamp
      );
      
      if (success) {
        await loadTodayRecords();
        
        // Reset form except player
        setBrand(null);
        setVolume(null);
        setAmount(1);
      }
    } catch (error) {
      console.error('Error adding record:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = (record) => {
    if (record.PLAYER !== currentPlayer?.label) {
      alert("¡Solo puedes borrar tus propias chelas!");
      return;
    }
    setDeleteConfirm(record);
  };

  const confirmDelete = async () => {
    if (!deleteConfirm || isLoading) return;

    setIsLoading(true);
    try {
      const success = await deleteBeerRecord(deleteConfirm.ID);
      if (success) {
        await loadTodayRecords();
      }
    } catch (error) {
      console.error('Error deleting record:', error);
    } finally {
      setIsLoading(false);
      setDeleteConfirm(null);
    }
  };

  const customStyles = {
    control: (base) => ({
      ...base,
      borderColor: '#FFD700',
      '&:hover': {
        borderColor: '#D4AF37',
      },
      backgroundColor: 'white',
      borderRadius: '0.375rem',
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected ? '#FFD700' : state.isFocused ? '#FFF8DC' : 'white',
      color: '#4A3728',
      '&:hover': {
        backgroundColor: '#FFF8DC',
      },
    }),
    menu: (base) => ({
      ...base,
      backgroundColor: 'white',
      borderRadius: '0.375rem',
      marginTop: '4px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    }),
  };

  return (
    <div className="min-h-screen bg-amber-50 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20 w-full max-w-md mx-auto">
        {!currentPlayer ? (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-6 text-center text-amber-900">¿Quién eres? 🎮</h2>
            <Select
              options={PLAYERS}
              onChange={handlePlayerSelect}
              className="w-full"
              styles={customStyles}
              placeholder="Selecciona tu nombre..."
            />
          </div>
        ) : !isVerified ? (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-6 text-center text-amber-900">Verificación 🔒</h2>
            <form onSubmit={handlePasscodeSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-amber-700">
                  Número de Jugador
                </label>
                <input
                  type="password"
                  value={passcode}
                  onChange={(e) => {
                    setPasscode(e.target.value);
                    setPasscodeError('');
                  }}
                  className="mt-1 block w-full rounded-md border-amber-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                  placeholder="Ingresa tu número..."
                />
              </div>
              {passcodeError && (
                <div className="text-red-500 text-sm mt-2">{passcodeError}</div>
              )}
              <button
                type="submit"
                className="w-full bg-amber-600 text-white py-2 px-4 rounded-md hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
              >
                Verificar
              </button>
            </form>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-sm text-amber-700">Jugando como:</span>
              <span className="font-medium text-amber-900">{currentPlayer.label}</span>
            </div>
            
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-amber-900">🍺 ¡A Registrar!</h2>
              
              <Select
                options={BEER_BRANDS}
                value={brand}
                onChange={setBrand}
                className="w-full"
                styles={customStyles}
                placeholder="Marca de la Chela..."
              />
              
              <Select
                options={VOLUMES}
                value={volume}
                onChange={setVolume}
                className="w-full"
                styles={customStyles}
                placeholder="Volumen (ml)..."
              />
              
              <div>
                <label className="block text-sm font-medium text-amber-700">Cantidad</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Math.max(1, parseInt(e.target.value) || 1))}
                  min="1"
                  className="mt-1 block w-full rounded-md border-amber-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                />
              </div>
              
              <button
                onClick={handleSubmit}
                disabled={!brand || !volume || !amount}
                className="w-full bg-amber-600 text-white py-3 px-4 rounded-md hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Registrar 🍻
              </button>
            </div>

            {todayRecords.length > 0 && (
              <div className="mt-8">
                <h3 className="text-lg font-medium text-amber-900 mb-4">Últimos Registros</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-amber-200">
                    <thead className="bg-amber-50">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-amber-700">Fecha y Hora</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-amber-700">Jugador</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-amber-700">Marca</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-amber-700">Vol.</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-amber-700">Cant.</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-amber-700"></th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-amber-100">
                      {todayRecords.map((record) => (
                        <tr key={record.ID} className={record.PLAYER === currentPlayer?.label ? 'bg-amber-50' : 'hover:bg-amber-50'}>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-amber-900">
                            <div>
                              {record.DATE.split('-').reverse().slice(0, 2).join('/')}
                            </div>
                            <div className="text-xs text-amber-600">
                              {record.TIMESTAMP ? (
                                new Date(record.TIMESTAMP).toLocaleTimeString('es-CL', {
                                  timeZone: 'America/Santiago',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                  hour12: false
                                })
                              ) : (
                                '(sin hora)'
                              )}
                            </div>
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-amber-900">
                            {record.PLAYER}
                            {record.PLAYER === currentPlayer?.label && ' 👈'}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-amber-900">{record.BRAND}</td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-amber-900">{record.VOLUME}ml</td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-amber-900">{record.AMOUNT}</td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm">
                            {record.PLAYER === currentPlayer?.label && (
                              <button
                                onClick={() => handleDelete(record)}
                                className="text-red-600 hover:text-red-900"
                              >
                                🗑️
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            
            <div className="flex justify-between items-center pt-4 border-t border-amber-200">
              <button
                onClick={() => {
                  setCurrentPlayer(null);
                  setPasscode('');
                  setPasscodeError('');
                }}
                className="text-sm text-amber-600 hover:text-amber-900"
              >
                Cambiar Jugador
              </button>
              <Link
                to="/stats"
                className="text-sm text-amber-600 hover:text-amber-900"
              >
                Ver Estadísticas 📊
              </Link>
            </div>
          </div>
        )}
        
        {deleteConfirm && (
          <div className="fixed inset-0 bg-amber-900 bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 max-w-sm w-full">
              <h3 className="text-lg font-medium text-amber-900 mb-4">¿Eliminar registro?</h3>
              <p className="text-sm text-amber-700 mb-4">
                {deleteConfirm.BRAND} - {deleteConfirm.VOLUME}L x{deleteConfirm.AMOUNT}
              </p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="px-4 py-2 text-sm font-medium text-amber-700 hover:bg-amber-50 rounded-md"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 
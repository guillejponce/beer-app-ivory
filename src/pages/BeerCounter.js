import { useState, useEffect } from 'react';
import Select from 'react-select';
import { addBeerRecord, readExcelData, deleteBeerRecord } from '../utils/excelUtils';
import { PLAYERS, BEER_BRANDS, VOLUMES } from '../constants/options';

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
    const today = new Date().toISOString().split('T')[0];
    const todaysData = data.filter(record => record.DATE === today);
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
      const success = await addBeerRecord(currentPlayer.label, brand.label, volume.value, amount);
      
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
      borderColor: '#D1D5DB',
      '&:hover': {
        borderColor: '#3B82F6',
      },
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected ? '#3B82F6' : state.isFocused ? '#BFDBFE' : 'white',
      color: state.isSelected ? 'white' : '#111827',
    }),
  };

  if (!currentPlayer || !isVerified) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 space-y-6">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-amber-800">🍺 Ivory Toast 🍻</h1>
            <p className="text-lg text-amber-700">El club más sediento del mundo</p>
          </div>

          <div className="space-y-6">
            <div className="space-y-4">
              <label className="block text-lg font-medium text-amber-900">
                ¿Quién eres, leyenda? 🎮
              </label>
              <Select
                value={currentPlayer}
                onChange={handlePlayerSelect}
                options={PLAYERS.map(p => ({ value: p.value, label: p.value }))}
                styles={customStyles}
                placeholder="Selecciona tu nombre..."
                isClearable={false}
                isSearchable
                className="text-lg"
              />
            </div>

            {currentPlayer && (
              <form onSubmit={handlePasscodeSubmit} className="space-y-4">
                <label className="block text-lg font-medium text-amber-900">
                  Número de Jugador 🔒
                </label>
                <div className="flex space-x-2">
                  <input
                    type="password"
                    value={passcode}
                    onChange={(e) => {
                      setPasscode(e.target.value);
                      setPasscodeError('');
                    }}
                    placeholder="Ingresa tu número..."
                    className="flex-1 px-4 py-2 text-lg border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 text-white bg-amber-600 rounded-lg hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
                  >
                    Entrar
                  </button>
                </div>
                {passcodeError && (
                  <p className="text-red-500 text-sm animate-bounce">
                    {passcodeError}
                  </p>
                )}
              </form>
            )}
          </div>

          <div className="pt-4">
            <p className="text-sm text-amber-700 text-center">
              Solo los verdaderos miembros del Ivory Toast pueden entrar 🏆
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 p-6">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-amber-600 to-amber-800 p-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-white">🍺 ¡A Registrar!</h2>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-amber-200">Jugando como:</span>
              <span className="font-medium text-white">{currentPlayer.value}</span>
              <button
                onClick={() => {
                  setCurrentPlayer(null);
                  setPasscode('');
                }}
                className="text-sm text-amber-200 hover:text-white transition-colors"
              >
                (Cambiar)
              </button>
            </div>
          </div>
        </div>
      
        <div className="p-6 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="brand" className="block text-sm font-medium text-amber-900">Marca de la Chela</label>
              <Select
                id="brand"
                value={brand}
                onChange={setBrand}
                options={BEER_BRANDS}
                styles={customStyles}
                placeholder="¿Qué estás tomando?"
                isClearable
                isSearchable
                isDisabled={isLoading}
                required
              />
            </div>

            <div>
              <label htmlFor="volume" className="block text-sm font-medium text-amber-900">Tamaño</label>
              <Select
                id="volume"
                value={volume}
                onChange={setVolume}
                options={VOLUMES}
                styles={customStyles}
                placeholder="¿Cuánto mide?"
                isClearable
                isSearchable
                isDisabled={isLoading}
                required
              />
            </div>

            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-amber-900">Cantidad</label>
              <input
                type="number"
                id="amount"
                value={amount}
                onChange={(e) => setAmount(Math.max(1, parseInt(e.target.value) || 1))}
                min="1"
                className="mt-1 block w-full rounded-lg border-amber-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                disabled={isLoading}
                required
              />
            </div>

            <button
              type="submit"
              disabled={!brand || !volume || amount < 1 || isLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
            >
              {isLoading ? 'Procesando...' : '¡Registrar! 🍻'}
            </button>
          </form>

          <div className="mt-8">
            <h3 className="text-lg font-medium text-amber-900 mb-4 flex items-center">
              <span className="mr-2">📝</span>
              Registro de Hoy
            </h3>
            <div className="overflow-x-auto rounded-lg border border-amber-200">
              <table className="min-w-full divide-y divide-amber-200">
                <thead className="bg-amber-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-amber-800 uppercase">Jugador</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-amber-800 uppercase">Marca</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-amber-800 uppercase">Tamaño</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-amber-800 uppercase">Cantidad</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-amber-800 uppercase">Total</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-amber-800 uppercase">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-amber-100">
                  {todayRecords.map((record) => (
                    <tr 
                      key={record.ID} 
                      className={`${record.PLAYER === currentPlayer.label ? 'bg-amber-50' : ''} hover:bg-amber-50 transition-colors`}
                    >
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-amber-900">
                        {record.PLAYER}
                        {record.PLAYER === currentPlayer.label && ' 👈'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-amber-700">{record.BRAND}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-amber-700">{record.VOLUME}L</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-amber-700">{record.AMOUNT}x</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-amber-700">{record.TOTAL_VOLUME}L</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-amber-700">
                        {record.PLAYER === currentPlayer.label && (
                          <button
                            onClick={() => handleDelete(record)}
                            className="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            disabled={isLoading}
                          >
                            Borrar
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-xl font-bold text-amber-900 flex items-center">
              <span className="mr-2">🤔</span>
              ¿Seguro que quieres borrar esto?
            </h3>
            <div className="bg-amber-50 rounded-lg p-4 space-y-2">
              <p className="text-sm text-amber-900">
                <span className="font-medium">Detalles:</span>
              </p>
              <div className="grid grid-cols-2 gap-2 text-sm text-amber-800">
                <p>Marca: <span className="font-medium">{deleteConfirm.BRAND}</span></p>
                <p>Tamaño: <span className="font-medium">{deleteConfirm.VOLUME}L</span></p>
                <p>Cantidad: <span className="font-medium">{deleteConfirm.AMOUNT}x</span></p>
                <p>Total: <span className="font-medium">{deleteConfirm.TOTAL_VOLUME}L</span></p>
              </div>
            </div>
            <p className="text-sm text-red-600 font-medium">
              ¡Esta acción no se puede deshacer!
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-sm font-medium text-amber-700 bg-amber-100 hover:bg-amber-200 rounded-lg transition-colors"
                disabled={isLoading}
              >
                Nah, me arrepentí
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                {isLoading ? 'Borrando...' : 'Sí, borrar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 
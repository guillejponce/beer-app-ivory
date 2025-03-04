const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const XLSX = require('xlsx');

const app = express();
app.use(cors());
app.use(express.json());

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../build')));

// Store the Excel file in the persistent disk in production, or locally in development
const EXCEL_FILE = process.env.NODE_ENV === 'production' 
  ? path.join('/data', 'beer_counter.xlsx')
  : path.join(__dirname, 'beer_counter.xlsx');

console.log('Environment:', process.env.NODE_ENV);
console.log('Using Excel file:', EXCEL_FILE);
console.log('Static files path:', path.join(__dirname, '../build'));

const initializeExcelFile = () => {
  console.log('Checking Excel file...');
  
  try {
    // Ensure the directory exists in production
    if (process.env.NODE_ENV === 'production') {
      const dir = path.dirname(EXCEL_FILE);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    }

    if (!fs.existsSync(EXCEL_FILE)) {
      console.log('Creating new Excel file...');
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet([]);
      XLSX.utils.book_append_sheet(workbook, worksheet, 'BeerCounter');
      XLSX.writeFile(workbook, EXCEL_FILE);
    }
  } catch (error) {
    console.error('Error in initializeExcelFile:', error);
  }
};

// Initialize Excel file
initializeExcelFile();

// API Routes
app.get('/api/beers', (req, res) => {
  try {
    if (!fs.existsSync(EXCEL_FILE)) {
      return res.json([]);
    }
    
    const workbook = XLSX.readFile(EXCEL_FILE);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);
    res.json(data);
  } catch (error) {
    console.error('Error reading Excel file:', error);
    res.json([]);
  }
});

// Add a single beer record
app.post('/api/beers/add', (req, res) => {
  try {
    const { record } = req.body;
    
    // Leer el archivo actual
    const workbook = XLSX.readFile(EXCEL_FILE);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const currentData = XLSX.utils.sheet_to_json(worksheet);
    
    // Agregar el nuevo registro
    currentData.push(record);
    
    // Escribir de vuelta al archivo
    const newWorksheet = XLSX.utils.json_to_sheet(currentData);
    const newWorkbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(newWorkbook, newWorksheet, 'BeerCounter');
    XLSX.writeFile(newWorkbook, EXCEL_FILE);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error adding record to Excel file:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete a single beer record
app.delete('/api/beers/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    // Leer el archivo actual
    const workbook = XLSX.readFile(EXCEL_FILE);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const currentData = XLSX.utils.sheet_to_json(worksheet);
    
    // Filtrar el registro a eliminar
    const updatedData = currentData.filter(record => record.ID !== id);
    
    // Escribir de vuelta al archivo
    const newWorksheet = XLSX.utils.json_to_sheet(updatedData);
    const newWorkbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(newWorkbook, newWorksheet, 'BeerCounter');
    XLSX.writeFile(newWorkbook, EXCEL_FILE);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting record from Excel file:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/beers', (req, res) => {
  try {
    const { data } = req.body;
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'BeerCounter');
    XLSX.writeFile(workbook, EXCEL_FILE);
    res.json({ success: true });
  } catch (error) {
    console.error('Error writing Excel file:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// The "catch-all" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../build/index.html'));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`API Server running on port ${PORT}`);
}); 
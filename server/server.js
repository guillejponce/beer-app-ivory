const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const XLSX = require('xlsx');

const app = express();
app.use(cors());
app.use(express.json());

// Ensure we're using the persistent disk in production
const DATA_DIR = process.env.NODE_ENV === 'production' ? '/data' : path.join(__dirname, '..', 'data');
const EXCEL_FILE = path.join(DATA_DIR, 'beer_counter.xlsx');

console.log('Environment:', process.env.NODE_ENV);
console.log('Using DATA_DIR:', DATA_DIR);

const initializeDataDirectory = () => {
  console.log('Initializing data directory...');
  
  try {
    if (!fs.existsSync(DATA_DIR)) {
      console.log(`Creating directory: ${DATA_DIR}`);
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    
    if (!fs.existsSync(EXCEL_FILE)) {
      console.log('Creating new Excel file...');
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet([]);
      XLSX.utils.book_append_sheet(workbook, worksheet, 'BeerCounter');
      XLSX.writeFile(workbook, EXCEL_FILE);
    }
  } catch (error) {
    console.error('Error in initializeDataDirectory:', error);
  }
};

// Initialize data directory
initializeDataDirectory();

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

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`API Server running on port ${PORT}`);
}); 
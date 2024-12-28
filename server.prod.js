const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const XLSX = require('xlsx');

const app = express();
app.use(cors());
app.use(express.json());

// Ensure we're using the persistent disk in production
const DATA_DIR = process.env.NODE_ENV === 'production'
  ? process.env.DATA_DIR  // This will be /data in Render
  : path.join(__dirname, 'data');

const EXCEL_FILE = path.join(DATA_DIR, 'beer_counter.xlsx');

const initializeDataDirectory = () => {
  console.log('Initializing data directory...');
  console.log('DATA_DIR:', DATA_DIR);
  console.log('EXCEL_FILE:', EXCEL_FILE);
  
  // Create directory if it doesn't exist
  if (!fs.existsSync(DATA_DIR)) {
    console.log(`Creating directory: ${DATA_DIR}`);
    fs.mkdirSync(DATA_DIR, { recursive: true, mode: 0o777 });
  }

  // Set directory permissions
  fs.chmodSync(DATA_DIR, 0o777);
  
  // Create Excel file if it doesn't exist
  if (!fs.existsSync(EXCEL_FILE)) {
    console.log('Creating new Excel file...');
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet([]);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'BeerCounter');
    XLSX.writeFile(workbook, EXCEL_FILE);
    // Set file permissions
    fs.chmodSync(EXCEL_FILE, 0o666);
  } else {
    console.log('Excel file already exists');
  }
  
  console.log('Data directory initialized successfully');
};

// Initialize data directory after a short delay to ensure disk is mounted
setTimeout(initializeDataDirectory, 5000);

// Serve static files from the React build
app.use(express.static(path.join(__dirname, 'build')));

// API Routes
app.get('/api/beers', (req, res) => {
  try {
    // Ensure directory and file exist before reading
    if (!fs.existsSync(EXCEL_FILE)) {
      console.log('Excel file not found, initializing...');
      initializeDataDirectory();
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
    // Ensure directory and file exist before writing
    if (!fs.existsSync(DATA_DIR)) {
      console.log('Data directory not found, initializing...');
      initializeDataDirectory();
    }
    
    const { data } = req.body;
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'BeerCounter');
    XLSX.writeFile(workbook, EXCEL_FILE);
    
    // Reset file permissions after writing
    fs.chmodSync(EXCEL_FILE, 0o666);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error writing Excel file:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Handle React routing, return all requests to React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 
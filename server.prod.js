const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const XLSX = require('xlsx');

const app = express();
app.use(cors());
app.use(express.json());

// Ensure we're using the persistent disk in production
const DATA_DIR = process.env.NODE_ENV === 'production' ? '/data' : path.join(__dirname, 'data');
const EXCEL_FILE = path.join(DATA_DIR, 'beer_counter.xlsx');

console.log('Environment:', process.env.NODE_ENV);
console.log('Using DATA_DIR:', DATA_DIR);

const initializeDataDirectory = () => {
  console.log('Initializing data directory...');
  console.log('DATA_DIR:', DATA_DIR);
  console.log('EXCEL_FILE:', EXCEL_FILE);
  
  try {
    // Always try to create the directory
    if (!fs.existsSync(DATA_DIR)) {
      console.log(`Creating directory: ${DATA_DIR}`);
      try {
        fs.mkdirSync(DATA_DIR, { recursive: true, mode: 0o777 });
        console.log('Directory created successfully');
      } catch (dirError) {
        console.error('Error creating directory:', dirError);
        // Continue even if directory creation fails, it might already exist
      }
    } else {
      console.log('Directory already exists');
    }

    // Try to set directory permissions anyway
    try {
      fs.chmodSync(DATA_DIR, 0o777);
      console.log('Directory permissions set');
    } catch (chmodError) {
      console.error('Error setting directory permissions:', chmodError);
      // Continue even if chmod fails
    }
    
    // Create Excel file if it doesn't exist
    if (!fs.existsSync(EXCEL_FILE)) {
      console.log('Creating new Excel file...');
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet([]);
      XLSX.utils.book_append_sheet(workbook, worksheet, 'BeerCounter');
      
      // Try to create the file
      try {
        XLSX.writeFile(workbook, EXCEL_FILE);
        console.log('Excel file created successfully');
        
        // Try to set file permissions
        fs.chmodSync(EXCEL_FILE, 0o666);
        console.log('Excel file permissions set');
      } catch (writeError) {
        console.error('Error writing Excel file:', writeError);
        throw writeError; // Re-throw to be caught by outer try-catch
      }
    } else {
      console.log('Excel file already exists');
      // Try to read the file to verify permissions
      const workbook = XLSX.readFile(EXCEL_FILE);
      console.log('Excel file is readable');
    }
  } catch (error) {
    console.error('Error in initializeDataDirectory:', error);
    if (error.code === 'EACCES') {
      console.error('Permission denied. Please check directory and file permissions.');
    }
  }
};

// Initialize with retries in production
if (process.env.NODE_ENV === 'production') {
  let retries = 5;
  const retryInterval = 3000; // 3 seconds

  const initializeWithRetry = () => {
    console.log(`Initialization attempt ${6 - retries} of 5`);
    try {
      initializeDataDirectory();
    } catch (error) {
      if (retries > 1) {
        retries--;
        console.log(`Retrying in ${retryInterval/1000} seconds...`);
        setTimeout(initializeWithRetry, retryInterval);
      } else {
        console.error('Failed to initialize after all retries');
      }
    }
  };

  initializeWithRetry();
} else {
  setTimeout(initializeDataDirectory, 1000);
}

// API Routes
app.get('/api/beers', (req, res) => {
  try {
    if (!fs.existsSync(EXCEL_FILE)) {
      console.log('Excel file not found on read request');
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

// Write Excel file (mantener por compatibilidad, pero ya no se usa)
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

// Serve static files from the React build
app.use(express.static(path.join(__dirname, 'build')));

// Handle React routing, return all requests to React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 
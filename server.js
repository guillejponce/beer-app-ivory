const express = require('express');
const cors = require('cors');
const fs = require('fs');
const XLSX = require('xlsx');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// Read Excel file
app.get('/api/beers', (req, res) => {
  try {
    const workbook = XLSX.readFile('beer_counter.xlsx');
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);
    res.json(data);
  } catch (error) {
    console.error('Error reading Excel file:', error);
    res.json([]);
  }
});

// Write Excel file
app.post('/api/beers', (req, res) => {
  try {
    const { data } = req.body;
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'BeerCounter');
    XLSX.writeFile(workbook, 'beer_counter.xlsx');
    res.json({ success: true });
  } catch (error) {
    console.error('Error writing Excel file:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 
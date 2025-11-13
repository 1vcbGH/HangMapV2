
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// Servir el frontend (index.html, script.js, etc) desde la carpeta raíz del proyecto
app.use(express.static(path.join(__dirname, '..')));

// Ruta ABSOLUTA al JSON de fiestas (dentro de /server)
const dataPath = path.join(__dirname, 'fiestas.json');

function loadFiestas() {
  try {
    if (!fs.existsSync(dataPath)) {
      return [];
    }
    const raw = fs.readFileSync(dataPath, 'utf8').trim();
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error parseando fiestas.json, usando []:', err);
    return [];
  }
}

function saveFiestas(fiestas) {
  try {
    fs.writeFileSync(dataPath, JSON.stringify(fiestas, null, 2));
  } catch (err) {
    console.error('Error escribiendo fiestas.json:', err);
    throw err;
  }
}

// Asegurar que el archivo exista
if (!fs.existsSync(dataPath)) {
  saveFiestas([]);
}

// GET /api/fiestas
app.get('/api/fiestas', (req, res) => {
  try {
    const fiestas = loadFiestas();
    res.json(fiestas);
  } catch (err) {
    console.error('GET /api/fiestas error:', err);
    res.status(500).json({ error: 'Error al leer fiestas' });
  }
});

// POST /api/fiestas
app.post('/api/fiestas', (req, res) => {
  try {
    const fiestas = loadFiestas();
    const nueva = req.body || {};
    if (!nueva.fechaGuardado) nueva.fechaGuardado = Date.now();
    fiestas.push(nueva);
    saveFiestas(fiestas);
    res.status(201).json(nueva);
  } catch (err) {
    console.error('POST /api/fiestas error:', err);
    res.status(500).json({ error: 'Error al guardar la fiesta' });
  }
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Servidor HangMap ejecutándose en http://0.0.0.0:${port}`);
});

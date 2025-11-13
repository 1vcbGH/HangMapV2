const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('./'));

// Ruta para almacenar los datos
const dataPath = path.join(__dirname, 'fiestas.json');

// Inicializar archivo de datos si no existe
if (!fs.existsSync(dataPath)) {
  fs.writeFileSync(dataPath, JSON.stringify([]));
}

// Obtener todas las fiestas
app.get('/api/fiestas', (req, res) => {
  try {
    const fiestas = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    res.json(fiestas);
  } catch (error) {
    console.error('Error al leer las fiestas:', error);
    res.status(500).json({ error: 'Error al leer las fiestas' });
  }
});

// Añadir una nueva fiesta
app.post('/api/fiestas', (req, res) => {
  try {
    const fiestas = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    const nuevaFiesta = req.body;
    
    // Añadir fecha de guardado si no existe
    if (!nuevaFiesta.fechaGuardado) {
      nuevaFiesta.fechaGuardado = Date.now();
    }
    
    fiestas.push(nuevaFiesta);
    fs.writeFileSync(dataPath, JSON.stringify(fiestas));
    
    res.status(201).json(nuevaFiesta);
  } catch (error) {
    console.error('Error al guardar la fiesta:', error);
    res.status(500).json({ error: 'Error al guardar la fiesta' });
  }
});

// Eliminar una fiesta
app.delete('/api/fiestas/:index', (req, res) => {
  try {
    const index = parseInt(req.params.index);
    const fiestas = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    
    if (index >= 0 && index < fiestas.length) {
      fiestas.splice(index, 1);
      fs.writeFileSync(dataPath, JSON.stringify(fiestas));
      res.status(200).json({ message: 'Fiesta eliminada correctamente' });
    } else {
      res.status(404).json({ error: 'Fiesta no encontrada' });
    }
  } catch (error) {
    console.error('Error al eliminar la fiesta:', error);
    res.status(500).json({ error: 'Error al eliminar la fiesta' });
  }
});

// Iniciar el servidor
app.listen(port, '0.0.0.0', () => {
  console.log(`Servidor HangMap ejecutándose en http://0.0.0.0:${port}`);
});
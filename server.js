const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;

// Middleware para manejar datos JSON
app.use(express.json());

// Servir archivos estáticos (carpetas como "files", "styles")
app.use(express.static(path.join(__dirname, 'files')));
app.use(express.static(path.join(__dirname, 'styles')));

// Ruta para obtener los productos de la compra
app.get('/api/compra', (req, res) => {
    fs.readFile('./db/compra.json', 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ message: 'Error al leer los datos' });
        }
        res.json(JSON.parse(data));
    });
});

// Ruta para agregar un producto a la compra
app.post('/api/compra', (req, res) => {
    const nuevoItem = req.body;

    // Leer el archivo existente de compra.json
    fs.readFile('./db/compra.json', 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ message: 'Error al leer los datos' });
        }

        const compra = JSON.parse(data);
        compra.push(nuevoItem);

        // Guardar el archivo actualizado
        fs.writeFile('./db/compra.json', JSON.stringify(compra, null, 2), (err) => {
            if (err) {
                return res.status(500).json({ message: 'Error al guardar el archivo' });
            }
            res.status(201).json({ message: 'Producto añadido al carrito' });
        });
    });
});

// Ruta para eliminar un producto del carrito
app.delete('/api/compra/:nombre', (req, res) => {
    const nombre = req.params.nombre;

    fs.readFile('./db/compra.json', 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ message: 'Error al leer los datos' });
        }

        let compra = JSON.parse(data);
        compra = compra.filter(item => item.nombre !== nombre);

        fs.writeFile('./db/compra.json', JSON.stringify(compra, null, 2), (err) => {
            if (err) {
                return res.status(500).json({ message: 'Error al guardar el archivo' });
            }
            res.status(200).json({ message: 'Producto eliminado del carrito' });
        });
    });
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

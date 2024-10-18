const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;

// Middleware para manejar datos JSON
app.use(express.json());

// Servir archivos estáticos (carpetas como "files", "styles", "includes", "pages")
app.use(express.static(path.join(__dirname)));
app.use(express.static(path.join(__dirname, 'files')));
app.use(express.static(path.join(__dirname, 'styles')));
app.use(express.static(path.join(__dirname, 'includes')));
app.use(express.static(path.join(__dirname, 'pages')));

// Ruta para obtener los productos de la compra
app.get('/api/compra', (req, res) => {
    fs.readFile('./db/compra.json', 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ message: 'Error al leer los datos' });
        }
        res.json(JSON.parse(data));
    });
});

const { v4: uuidv4 } = require('uuid'); // Importar la función para generar IDs únicos

// Ruta para agregar un producto a la compra
app.post('/api/compra', (req, res) => {
    const nuevoItem = req.body;
    nuevoItem.id = uuidv4();  // Asignar un ID único al producto

    // Leer el archivo existente de compra.json
    fs.readFile('./db/compra.json', 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ message: 'Error al leer los datos' });
        }

        let compra = JSON.parse(data);
        if (!Array.isArray(compra)) {
            return res.status(500).json({ message: 'Formato de datos incorrecto en compra.json' });
        }

        compra.push(nuevoItem);

        // Guardar el archivo actualizado
        fs.writeFile('./db/compra.json', JSON.stringify(compra, null, 2), (err) => {
            if (err) {
                return res.status(500).json({ message: 'Error al guardar el archivo' });
            }
            res.status(201).json({ message: 'Producto añadido al carrito', id: nuevoItem.id });
        });
    });
});

// Ruta para eliminar un producto del carrito usando su ID
app.delete('/api/compra/:id', (req, res) => {
    const id = req.params.id;

    fs.readFile('./db/compra.json', 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ message: 'Error al leer los datos' });
        }

        let compra = JSON.parse(data);

        // Filtrar los items para eliminar el que coincide con el ID
        compra = compra.filter(item => item.id !== id);

        // Sobreescribir el archivo compra.json con la nueva lista de productos
        fs.writeFile('./db/compra.json', JSON.stringify(compra, null, 2), (err) => {
            if (err) {
                return res.status(500).json({ message: 'Error al guardar los datos' });
            }
            res.status(200).json({ message: 'Producto eliminado del carrito' });
        });
    });
});

// Ruta para servir el archivo index.html
app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

// script.js

// Cuando el DOM esté cargado, inicializa el código
// Esto asegura que todos los elementos estén disponibles
document.addEventListener("DOMContentLoaded", function() {
    let cartItems = [];

    // Carga contenido HTML de manera dinámica en elementos con el ID especificado
    function loadHTML(filePath, elementId) {
        return fetch(filePath)
            .then(response => response.text())
            .then(data => {
                const element = document.getElementById(elementId);
                if (element) {
                    element.innerHTML = data;
                }
            })
            .catch(error => console.error(error));
    }

    // Carga el Nav, Footer, Sidebar y Modal
    loadHTML('/includes/nav.html', 'nav-placeholder');
    loadHTML('/includes/footer.html', 'footer-placeholder');
    loadHTML('/includes/sidebar.html', 'sidebar-placeholder');
    loadHTML('/includes/modal.html', 'modal-placeholder').then(() => {
        // Inicializa el modal del producto una vez que el HTML se ha cargado
        var productModal = new bootstrap.Modal(document.getElementById('productModal'));
        
        // Cuando se hace clic en el botón "Agregar al carrito" dentro del modal
        document.getElementById('add-to-cart-btn').addEventListener('click', function() {
            const nombre = document.getElementById('modal-product-name').textContent;
            const precio = parseFloat(document.getElementById('modal-product-price').textContent.replace('€', ''));
            const imagen = document.getElementById('modal-product-image').src;
            const cantidad = parseInt(document.getElementById('modal-cantidad').value);

            agregarAlCarrito(nombre, precio, imagen, cantidad);
            productModal.hide(); // Cierra el modal
        });
    });

    // Carga la página según el hash de la URL
    function loadPage() {
        let page = window.location.hash.substring(1); // Obtiene el hash sin el '#'
        if (page === "") {
            page = "home"; // Página por defecto
        }

        // Carga el header correspondiente
        if (page === "home") {
            loadHTML('/includes/header.html', 'header-placeholder');
        } else {
            loadHTML('/includes/small-header.html', 'header-placeholder'); // Versión pequeña del header
        }

        // Carga el contenido de la página
        loadHTML(`/pages/${page}.html`, 'page-content')
            .then(() => {
                if (page === "catalogo") {
                    cargarCatalogo(); // Carga el catálogo si estamos en esa página
                }
                if (page === "home") {
                    cargarHomeSofas(); // Carga los sofás en la página principal
                }
            });
    }

    // Carga los sofás en la página principal (home)
    function cargarHomeSofas() {
        const homeContainer = document.getElementById('lo-ultimo-sofas');
        // Asegúrate de que el selector apunte al contenedor correcto en home.html
    
        // Carga los sofás desde "sofas.json"
        fetch('/db/sofas.json')
            .then(response => response.json())
            .then(data => {
                // Selecciona los últimos 3 sofás para mostrar
                const sofasToShow = data.slice(-3);
        
                sofasToShow.forEach((sofa) => {
                    const sofaCard = document.createElement('div');
                    sofaCard.classList.add('col-md-4', 'mb-4');
                    sofaCard.innerHTML = `
                        <div class="card h-100">
                            <img src="${sofa.imagen}" class="card-img-top" alt="${sofa.nombre}">
                            <div class="card-body d-flex flex-column">
                                <h5 class="card-title">${sofa.nombre}</h5>
                                <p class="card-text">${sofa.descripcion}</p>
                                <button class="btn btn-primary mt-auto comprar-btn" data-nombre="${sofa.nombre}" data-precio="${sofa.precio}" data-imagen="${sofa.imagen}">Comprar</button>
                            </div>
                        </div>
                    `;
                    homeContainer.appendChild(sofaCard);
                });
        
                // Asigna eventos a los botones de compra
                homeContainer.querySelectorAll('.comprar-btn').forEach(button => {
                    button.addEventListener('click', function() {
                        const nombre = button.getAttribute('data-nombre');
                        const precio = parseFloat(button.getAttribute('data-precio'));
                        const imagen = button.getAttribute('data-imagen');
        
                        // Abre el modal con los detalles del producto
                        abrirModal(nombre, precio, imagen);
                    });
                });
            })
            .catch(error => console.error('Error al cargar los sofás para home:', error));
    }

    // Carga la página inicial
    loadPage();
    window.addEventListener("hashchange", loadPage); // Escucha cambios en el hash de la URL

    // Carga el catálogo de sofás y aplica filtros
    function cargarCatalogo() {
        const catalogoContainer = document.getElementById('catalogo-container');
        const filterPrecio = document.getElementById('filterPrecio');
        const precioMinimoLabel = document.getElementById('precioMinimo');
        const precioMaximoLabel = document.getElementById('precioMaximo');
        const filterTipo = document.getElementById('filterTipo');
        const filterOferta = document.getElementById('filterOferta');
        const searchNombre = document.getElementById('searchNombre');

        let sofas = [];

        // Carga el JSON de sofás
        fetch('/db/sofas.json')
            .then(response => response.json())
            .then(data => {
                sofas = data;

                // Obtiene los precios mínimo y máximo del JSON
                const precios = sofas.map(sofa => sofa.precio);
                const precioMinimo = Math.min(...precios);
                const precioMaximo = Math.max(...precios);

                // Actualiza los valores del input range y etiquetas
                filterPrecio.min = precioMinimo;
                filterPrecio.max = precioMaximo;
                precioMinimoLabel.textContent = `€${precioMinimo}`;
                precioMaximoLabel.textContent = `€${precioMaximo}`;
                filterPrecio.value = precioMaximo;

                mostrarSofas(sofas);

                // Asigna eventos a los filtros
                filterPrecio.addEventListener('input', aplicarFiltros);
                filterTipo.addEventListener('change', aplicarFiltros);
                filterOferta.addEventListener('change', aplicarFiltros);
                searchNombre.addEventListener('input', aplicarFiltros);
            })
            .catch(error => console.error('Error al cargar los sofás:', error));

        // Muestra los sofás en el contenedor
        function mostrarSofas(sofas) {
            catalogoContainer.innerHTML = ''; // Limpia el contenedor
            sofas.forEach(sofa => {
                const sofaCard = document.createElement('div');
                sofaCard.classList.add('col-md-4', 'mb-4');
                sofaCard.innerHTML = `
                    <div class="card h-100">
                        <img src="${sofa.imagen}" class="card-img-top" alt="${sofa.nombre}">
                        <div class="card-body d-flex flex-column">
                            <h5 class="card-title">${sofa.nombre}</h5>
                            <p class="card-text">${sofa.descripcion}</p>
                            <p><strong>Tipo:</strong> ${sofa.tipo}</p>
                            <p><strong>Colección:</strong> ${sofa.coleccion}</p>
                            <p><strong>Fecha de lanzamiento:</strong> ${new Date(sofa.fecha_salida).toLocaleDateString()}</p>
                            <p><strong>Precio:</strong> 
                                ${sofa.oferta ? `
                                    <span class="text-muted text-decoration-line-through">€${sofa.precio_antiguo}</span> 
                                    <span class="text-danger">€${sofa.precio}</span>` 
                                : `€${sofa.precio}`}
                            </p>
                            <button class="btn btn-primary mt-auto comprar-btn" data-nombre="${sofa.nombre}" data-precio="${sofa.precio}" data-imagen="${sofa.imagen}">Comprar</button>
                        </div>
                    </div>
                `;
                catalogoContainer.appendChild(sofaCard);
            });

            // Asigna eventos a los botones de compra después de cargar los sofás
            catalogoContainer.querySelectorAll('.comprar-btn').forEach(button => {
                button.addEventListener('click', function() {
                    const nombre = button.getAttribute('data-nombre');
                    const precio = parseFloat(button.getAttribute('data-precio'));
                    const imagen = button.getAttribute('data-imagen');

                    // Abre el modal con los detalles del producto
                    abrirModal(nombre, precio, imagen);
                });
            });
        }

        // Aplica los filtros al catálogo
        function aplicarFiltros() {
            let sofasFiltrados = sofas;

            // Filtra por precio
            const precioMaximo = parseFloat(filterPrecio.value);
            if (precioMaximo) {
                sofasFiltrados = sofasFiltrados.filter(sofa => sofa.precio <= precioMaximo);
            }

            // Filtra por tipo de sofá
            const tipo = filterTipo.value;
            if (tipo) {
                sofasFiltrados = sofasFiltrados.filter(sofa => sofa.tipo === tipo);
            }

            // Filtra por oferta
            if (filterOferta.checked) {
                sofasFiltrados = sofasFiltrados.filter(sofa => sofa.oferta);
            }

            // Busca por nombre
            const nombre = searchNombre.value.toLowerCase();
            if (nombre) {
                sofasFiltrados = sofasFiltrados.filter(sofa => sofa.nombre.toLowerCase().includes(nombre));
            }

            mostrarSofas(sofasFiltrados); // Muestra los sofás filtrados
        }
    }

    // Abre el modal con los detalles del producto
    function abrirModal(nombre, precio, imagen) {
        document.getElementById('modal-product-name').textContent = nombre;
        document.getElementById('modal-product-description').textContent = "Descripción detallada del producto."; // Personaliza esto
        document.getElementById('modal-product-price').textContent = `€${precio}`;
        document.getElementById('modal-product-image').src = imagen;

        // Muestra el modal
        var productModal = new bootstrap.Modal(document.getElementById('productModal'));
        productModal.show();
    }

    // Agrega un sofá al carrito
    function agregarAlCarrito(nombre, precio, imagen, cantidad = 1) {
        const nuevoProducto = { nombre, precio, cantidad, imagen };
    
        // Comprueba si el producto ya existe para no duplicarlo
        const productoExistente = cartItems.find(item => item.nombre === nombre);
        if (productoExistente) {
            productoExistente.cantidad += cantidad;
            guardarCarrito();
            updateCart();
            return;
        }

        // Envía el producto al servidor y obtiene el ID generado
        fetch('/api/compra', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(nuevoProducto)
        })
            .then(response => response.json())
            .then(data => {
                console.log(data.message);

                // Asigna el ID generado al nuevo producto
                nuevoProducto.id = data.id;

                // Agrega el producto al carrito
                cartItems.push(nuevoProducto);
                guardarCarrito();
                updateCart();
            })
            .catch(error => console.error('Error al agregar el producto:', error));
    }

    // Carga el carrito desde el servidor
    function loadCart() {
        fetch('/api/compra')
            .then(response => response.json())
            .then(data => {
                cartItems = Array.isArray(data) ? data : [];
                updateCart(); // Actualiza el carrito en la interfaz
            })
            .catch(error => console.error('Error al cargar el carrito:', error));
    }

    // Actualiza la interfaz del carrito
    function updateCart() {
        const cartItemsContainer = document.getElementById('cart-items-container');
        const cartCount = document.getElementById('cart-count');
        let totalItems = 0;
        let totalPrice = 0;
    
        cartItemsContainer.innerHTML = ''; // Limpia el contenedor
        cartItems.forEach(item => {
            totalItems += item.cantidad;
            totalPrice += item.precio * item.cantidad;
    
            const itemRow = document.createElement('div');
            itemRow.classList.add('d-flex', 'justify-content-between', 'align-items-center', 'mb-3');
            itemRow.innerHTML = `
                <div class="d-flex align-items-center">
                    <img src="${item.imagen}" alt="${item.nombre}" style="width: 50px; height: 50px; margin-right: 10px;">
                    <strong>${item.nombre}</strong> - €${item.precio} x ${item.cantidad}
                </div>
                <div>
                    <button class="btn btn-sm btn-outline-secondary increment" data-id="${item.id}">+</button>
                    <button class="btn btn-sm btn-outline-secondary decrement" data-id="${item.id}">-</button>
                    <button class="btn btn-sm btn-outline-danger remove" data-id="${item.id}">Eliminar</button>
                </div>
            `;
            cartItemsContainer.appendChild(itemRow);
        });
    
        // Actualiza la cantidad total de items en el icono del carrito
        cartCount.textContent = totalItems;
    
        document.getElementById('total-price').textContent = `€${totalPrice.toFixed(2)}`;
    
        // Asigna eventos a los botones de incrementar, decrementar y eliminar
        document.querySelectorAll('.increment').forEach(button => {
            button.addEventListener('click', function() {
                const id = button.getAttribute('data-id');
                incrementarItem(id);
            });
        });
    
        document.querySelectorAll('.decrement').forEach(button => {
            button.addEventListener('click', function() {
                const id = button.getAttribute('data-id');
                decrementarItem(id);
            });
        });
    
        // Asigna evento para eliminar el producto
        document.querySelectorAll('.remove').forEach(button => {
            button.addEventListener('click', function() {
                const id = button.getAttribute('data-id');
                eliminarItem(id);
            });
        });
    }

    // Incrementa la cantidad de un producto
    function incrementarItem(id) {
        const item = cartItems.find(item => item.id === id);
        if (item) {
            item.cantidad += 1;
            guardarCarrito();
            updateCart();
        }
    }

    // Decrementa la cantidad de un producto
    function decrementarItem(id) {
        const item = cartItems.find(item => item.id === id);
        if (item && item.cantidad > 1) {
            item.cantidad -= 1;
            guardarCarrito();
            updateCart();
        } else if (item) {
            eliminarItem(id);
        }
    }

    // Elimina un producto del carrito
    function eliminarItem(id) {
        fetch(`/api/compra/${id}`, {
            method: 'DELETE'
        })
            .then(response => response.json())
            .then(data => {
                console.log(data.message);
        
                // Actualiza la lista del carrito en el cliente
                cartItems = cartItems.filter(item => item.id !== id);
                guardarCarrito();
                updateCart();
            })
            .catch(error => console.error('Error al eliminar el producto:', error));
    }

    // Guarda el carrito en el servidor
    function guardarCarrito() {
        fetch('/api/compra', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(cartItems)
        })
            .then(response => response.json())
            .then(data => {
                console.log(data.message);
            })
            .catch(error => console.error('Error al guardar el carrito:', error));
    }

    // Carga el carrito cuando la página esté lista
    loadCart();
});

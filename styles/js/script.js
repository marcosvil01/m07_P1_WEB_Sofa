// script.js
document.addEventListener("DOMContentLoaded", function() {
    let cartItems = [];

    // Función para cargar el HTML dinámicamente
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

    // Cargar el Nav, Footer, Sidebar y Modal
    loadHTML('/includes/nav.html', 'nav-placeholder');
    loadHTML('/includes/footer.html', 'footer-placeholder');
    loadHTML('/includes/sidebar.html', 'sidebar-placeholder');
    loadHTML('/includes/modal.html', 'modal-placeholder').then(() => {
        // Inicializar el modal después de cargarlo
        var productModal = new bootstrap.Modal(document.getElementById('productModal'));
        
        // Asignar evento al botón "Agregar a la Cesta" del modal
        document.getElementById('add-to-cart-btn').addEventListener('click', function() {
            const nombre = document.getElementById('modal-product-name').textContent;
            const precio = parseFloat(document.getElementById('modal-product-price').textContent.replace('€', ''));
            const imagen = document.getElementById('modal-product-image').src;
            const cantidad = parseInt(document.getElementById('modal-cantidad').value);

            agregarAlCarrito(nombre, precio, imagen, cantidad);
            productModal.hide(); // Cerrar el modal
        });
    });

    // Función para cargar la página según el hash
    function loadPage() {
        let page = window.location.hash.substring(1); // Obtener el hash sin el #
        if (page === "") {
            page = "home"; // Página por defecto
        }

        // Cargar el header normalmente en la página 'home'
        if (page === "home") {
            loadHTML('/includes/header.html', 'header-placeholder');
        } else {
            loadHTML('/includes/small-header.html', 'header-placeholder'); // Cargar una versión pequeña del header
        }

        loadHTML(`/pages/${page}.html`, 'page-content')
        .then(() => {
            if (page === "catalogo") {
                cargarCatalogo();
            }
            if (page === "home") {
                cargarHomeSofas();
            }
        });
    }

    loadPage();
    window.addEventListener("hashchange", loadPage); // Escuchar cambios en el hash

    // Función para cargar el catálogo de sofás desde un JSON y aplicar filtros
    function cargarCatalogo() {
        const catalogoContainer = document.getElementById('catalogo-container');
        const filterPrecio = document.getElementById('filterPrecio');
        const precioMinimoLabel = document.getElementById('precioMinimo');
        const precioMaximoLabel = document.getElementById('precioMaximo');
        const filterTipo = document.getElementById('filterTipo');
        const filterOferta = document.getElementById('filterOferta');
        const searchNombre = document.getElementById('searchNombre');

        let sofas = [];

        // Cargar JSON de sofás
        fetch('/db/sofas.json')
            .then(response => response.json())
            .then(data => {
                sofas = data;

                // Obtener precios mínimos y máximos del JSON
                const precios = sofas.map(sofa => sofa.precio);
                const precioMinimo = Math.min(...precios);
                const precioMaximo = Math.max(...precios);

                // Actualizar los valores del input range y etiquetas
                filterPrecio.min = precioMinimo;
                filterPrecio.max = precioMaximo;
                precioMinimoLabel.textContent = `€${precioMinimo}`;
                precioMaximoLabel.textContent = `€${precioMaximo}`;
                filterPrecio.value = precioMaximo;

                mostrarSofas(sofas);
            })
            .catch(error => console.error('Error al cargar los sofás:', error));

        // Mostrar los sofás en el contenedor
        function mostrarSofas(sofas) {
            catalogoContainer.innerHTML = ''; // Limpiar contenedor
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
                            <p><strong>Fecha de salida:</strong> ${new Date(sofa.fecha_salida).toLocaleDateString()}</p>
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

            // Asignar eventos de compra a los botones
            document.querySelectorAll('.comprar-btn').forEach(button => {
                button.addEventListener('click', function() {
                    const nombre = button.getAttribute('data-nombre');
                    const precio = parseFloat(button.getAttribute('data-precio'));
                    const imagen = button.getAttribute('data-imagen');

                    // Abrir el modal con los detalles del producto
                    abrirModal(nombre, precio, imagen);
                });
            });
        }

        // Filtros y búsqueda
        filterPrecio.addEventListener('input', aplicarFiltros);
        filterTipo.addEventListener('change', aplicarFiltros);
        filterOferta.addEventListener('change', aplicarFiltros);
        searchNombre.addEventListener('input', aplicarFiltros);

        function aplicarFiltros() {
            let sofasFiltrados = sofas;

            // Filtrar por precio
            const precioMaximo = parseFloat(filterPrecio.value);
            if (precioMaximo) {
                sofasFiltrados = sofasFiltrados.filter(sofa => sofa.precio <= precioMaximo);
            }

            // Filtrar por tipo de sofá
            const tipo = filterTipo.value;
            if (tipo) {
                sofasFiltrados = sofasFiltrados.filter(sofa => sofa.tipo === tipo);
            }

            // Filtrar por oferta
            if (filterOferta.checked) {
                sofasFiltrados = sofasFiltrados.filter(sofa => sofa.oferta);
            }

            // Buscar por nombre
            const nombre = searchNombre.value.toLowerCase();
            if (nombre) {
                sofasFiltrados = sofasFiltrados.filter(sofa => sofa.nombre.toLowerCase().includes(nombre));
            }

            mostrarSofas(sofasFiltrados); // Mostrar los sofás filtrados
        }
    }

    // Función para cargar los sofás en home.html y asignar eventos de compra
    function cargarHomeSofas() {
        const homeContainer = document.getElementById('lo-ultimo-sofas');
        // Asegúrate de que el selector apunte al contenedor correcto en home.html

        // Cargar los sofás desde "sofas.json"
        fetch('/db/sofas.json')
            .then(response => response.json())
            .then(data => {
                // Filtrar los últimos sofás o seleccionar algunos para mostrar
                const sofasToShow = data.slice(-3); // Últimos 3 sofás

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

                // Asignar eventos de compra a los botones
                homeContainer.querySelectorAll('.comprar-btn').forEach(button => {
                    button.addEventListener('click', function() {
                        const nombre = button.getAttribute('data-nombre');
                        const precio = parseFloat(button.getAttribute('data-precio'));
                        const imagen = button.getAttribute('data-imagen');

                        // Abrir el modal con los detalles del producto
                        abrirModal(nombre, precio, imagen);
                    });
                });
            })
            .catch(error => console.error('Error al cargar los sofás para home:', error));
    }

    // Función para abrir el modal con los detalles del producto
    function abrirModal(nombre, precio, imagen) {
        document.getElementById('modal-product-name').textContent = nombre;
        document.getElementById('modal-product-description').textContent = "Descripción detallada del producto."; // Puedes personalizar esto
        document.getElementById('modal-product-price').textContent = `€${precio}`;
        document.getElementById('modal-product-image').src = imagen;

        // Mostrar el modal
        var productModal = new bootstrap.Modal(document.getElementById('productModal'));
        productModal.show();
    }

    // Función para agregar un sofá al carrito
    function agregarAlCarrito(nombre, precio, imagen, cantidad) {
        const existingItem = cartItems.find(item => item.nombre === nombre);
        if (existingItem) {
            existingItem.cantidad += cantidad;
        } else {
            cartItems.push({
                nombre: nombre,
                precio: precio,
                imagen: imagen,
                cantidad: cantidad
            });
        }

        updateCart();
        guardarCarrito();
    }

    // Función para actualizar la cesta
    function updateCart() {
        const cartCount = document.getElementById('cart-count');
        const cartItemsContainer = document.getElementById('cart-items-container');
        let totalItems = 0;
        let totalPrice = 0;

        cartItemsContainer.innerHTML = ''; // Limpiar contenedor
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
                    <button class="btn btn-sm btn-outline-secondary increment" data-nombre="${item.nombre}">+</button>
                    <button class="btn btn-sm btn-outline-secondary decrement" data-nombre="${item.nombre}">-</button>
                    <button class="btn btn-sm btn-outline-danger remove" data-nombre="${item.nombre}">Eliminar</button>
                </div>
            `;
            cartItemsContainer.appendChild(itemRow);
        });

        // Actualizar contador de artículos en la cesta
        cartCount.textContent = totalItems;

        // Asignar eventos a los botones de incrementar, decrementar y eliminar
        document.querySelectorAll('.increment').forEach(button => {
            button.addEventListener('click', function() {
                const nombre = button.getAttribute('data-nombre');
                incrementarItem(nombre);
            });
        });

        document.querySelectorAll('.decrement').forEach(button => {
            button.addEventListener('click', function() {
                const nombre = button.getAttribute('data-nombre');
                decrementarItem(nombre);
            });
        });

        document.querySelectorAll('.remove').forEach(button => {
            button.addEventListener('click', function() {
                const nombre = button.getAttribute('data-nombre');
                eliminarItem(nombre);
            });
        });

        // Actualizar el precio total en la cesta
        const totalPriceElement = document.getElementById('total-price');
        totalPriceElement.textContent = `€${totalPrice}`;
    }

    // Funciones para incrementar, decrementar y eliminar artículos en la cesta
    function incrementarItem(nombre) {
        const item = cartItems.find(item => item.nombre === nombre);
        if (item) {
            item.cantidad += 1;
            updateCart();
            guardarCarrito();
        }
    }

    function decrementarItem(nombre) {
        const item = cartItems.find(item => item.nombre === nombre);
        if (item && item.cantidad > 1) {
            item.cantidad -= 1;
            updateCart();
            guardarCarrito();
        } else {
            eliminarItem(nombre);
        }
    }

    function eliminarItem(nombre) {
        cartItems = cartItems.filter(item => item.nombre !== nombre);
        updateCart();
        guardarCarrito();
    }

    // Función para guardar el carrito en localStorage
    function guardarCarrito() {
        localStorage.setItem('carrito', JSON.stringify(cartItems));
    }

    // Función para cargar el carrito desde localStorage o desde compra.json
    function cargarCarrito() {
        const carritoGuardado = localStorage.getItem('carrito');
        if (carritoGuardado) {
            cartItems = JSON.parse(carritoGuardado);
            updateCart();
        } else {
            // Cargar desde compra.json
            fetch('/db/compra.json')
                .then(response => response.json())
                .then(data => {
                    cartItems = data;
                    guardarCarrito();
                    updateCart();
                })
                .catch(error => console.error('Error al cargar compra.json:', error));
        }
    }

    // Cargar la cesta cuando la página esté lista
    cargarCarrito();
});

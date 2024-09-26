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

    // Función para abrir el modal con los detalles del producto
    function abrirModal(nombre, precio, imagen) {
        document.getElementById('modal-product-name').textContent = nombre;
        document.getElementById('modal-product-description').textContent = "Descripción detallada del producto."; // Personaliza esto
        document.getElementById('modal-product-price').textContent = `€${precio}`;
        document.getElementById('modal-product-image').src = imagen;

        // Mostrar el modal
        var productModal = new bootstrap.Modal(document.getElementById('productModal'));
        productModal.show();
    }

    // Función para agregar un sofá al carrito
    function agregarAlCarrito(nombre, precio, imagen, cantidad = 1) {
        const nuevoProducto = { nombre, precio, cantidad, imagen };
    
        fetch('/api/compra', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(nuevoProducto)
        })
        .then(response => response.json())
        .then(data => {
            console.log(data.message);
            loadCart();  // Recargar la cesta
        })
        .catch(error => console.error('Error:', error));
    }

    // Cargar la cesta cuando la página esté lista
    loadCart();
});


# Proyecto Web - Venta de Sofás

Este proyecto es una página web para la venta de sofás, desarrollada con funcionalidades basadas en Node.js. Incluye una base de datos simulada y múltiples páginas que permiten a los usuarios explorar diferentes tipos de sofás, realizar "compras" y más.

## Estructura del Proyecto

- **db/**
  - `compra.json`: Base de datos simulada para las compras realizadas.
  - `sofas.json`: Base de datos simulada con información de los sofás disponibles.
  
- **files/**
  - `carousel_images/`: Imágenes utilizadas en el carrusel de la página.
  - `favicon/`: Icono de la página web.
  - `img/`: Imágenes adicionales para la web.
  - `logo.png`: Logotipo principal de la página.

- **includes/**
  - `footer.html`: Pie de página común en todas las páginas.
  - `header.html`: Encabezado con el logo y navegación.
  - `modal.html`: Modales emergentes para interacciones.
  - `nav.html`: Barra de navegación principal.
  - `sidebar.html`: Barra lateral para navegar dentro del sitio.
  - `small-header.html`: Encabezado reducido para ciertas páginas.

- **pages**
  - `catalogo.html`: Página de catálogo de sofás.
  - `compra.html`: Resumen de la compra.
  - `contacto.html`: Página de contacto de la tienda.
  - `home.html`: Página principal del sitio.
  - `login.html`: Página de inicio de sesión de usuarios.
  - `sofa_clasico.html`: Detalles sobre sofás clásicos.
  - `sofa_medida.html`: Detalles sobre sofás a medida.
  - `sofa_moderno.html`: Detalles sobre sofás modernos.

- **styles/**
  - **css/**
    - `style.css`: Archivo CSS para los estilos principales.
  - **js/**
    - `script.js`: Archivo de JavaScript con la lógica de la página.

- **dependencies.bat**: Script para instalar las dependencias del proyecto.
- **iniciar_servidor.bat**: Script para iniciar el servidor localmente.
- **index.html**: Página principal de la web.
- **server.js**: Archivo de configuración del servidor en Node.js.
- **package.json**: Archivo que especifica las dependencias del proyecto.

## Requisitos

- Node.js (versión 16 o superior recomendada).
- npm (gestor de paquetes de Node.js).

## Instalación y Ejecución

1. Clonar el repositorio o descargar los archivos.
   
   ```bash
   git clone <URL_DEL_REPOSITORIO>
   cd web
   ```

2. Instalar las dependencias:

   ```bash
   iniciar dependencies.bat
   ```

3. Iniciar el servidor:

   ```bash
   iniciar iniciar_servidor.bat
   ```

4. Abrir en el navegador:

   Visita `http://localhost:3000` para ver la web en funcionamiento.


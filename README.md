# Zara Challenge

Aplicación web desarrollada en React para la visualización, búsqueda y gestión de un catálogo de teléfonos móviles.

## Funcionalidades

### Listado de Teléfonos

- Visualización de los primeros 20 teléfonos obtenidos desde la API.
- Búsqueda en tiempo real por nombre o marca utilizando el filtrado proporcionado por la API.
- Indicador con el número de resultados encontrados.
- Diseño responsive basado en los diseños proporcionados en Figma.
- Tarjetas con:
  - Imagen del teléfono
  - Nombre
  - Marca
  - Precio base

- Barra de navegación con:
  - Enlace a la página principal
  - Indicador con el número de productos añadidos al carrito

- Navegación a la vista de detalle al seleccionar un teléfono.

### Detalle de Teléfono

- Información detallada del dispositivo seleccionado.
- Imagen principal que cambia dinámicamente según el color seleccionado.
- Selección de color y almacenamiento.
- Actualización del precio en tiempo real según la capacidad seleccionada.
- Especificaciones técnicas completas.
- Botón **"Añadir al carrito"** habilitado únicamente cuando se han seleccionado color y almacenamiento.
- Sección de productos similares.

### Carrito de Compra

- Visualización de los productos añadidos al carrito.
- Información mostrada por producto:
  - Imagen
  - Nombre
  - Color seleccionado
  - Almacenamiento seleccionado
  - Precio individual

- Eliminación individual de productos.
- Cálculo automático del importe total.
- Botón **"Continuar comprando"** para regresar al catálogo.
- Persistencia del carrito mediante `localStorage`.

---

## Tecnologías Utilizadas

- React
- React Router
- Context API
- SCSS
- Jest
- React Testing Library

---

### Estructura Principal

```text
src/
├── api/
├── components/
├── context/
├── hooks/
└── pages/
```

---

## Variables de Entorno

La configuración de la API se gestiona mediante variables de entorno.

Por motivos de seguridad y buenas prácticas, la URL de la API y la API Key no están incluidas directamente en el código fuente ni se versionan en Git.

El proyecto incluye un archivo `.env.example` con las variables necesarias:

```env
REACT_APP_API_KEY=
REACT_APP_API_URL=
```

Para ejecutar la aplicación:

1. Crear un archivo `.env` en la raíz del proyecto.
2. Copiar el contenido de `.env.example`.
3. Completar los valores correspondientes.

Ejemplo:

```env
REACT_APP_API_KEY=tu_api_key
REACT_APP_API_URL=https://api.example.com
```

El archivo `.env` está incluido en `.gitignore` para evitar exponer información sensible.

---

## Instalación

Instalar dependencias:

```bash
npm install
```

---

## Ejecución del Proyecto

### Modo Desarrollo

Inicia la aplicación con assets sin minimizar y herramientas de desarrollo activadas.

```bash
npm start
```

La aplicación estará disponible en:

```text
http://localhost:3000
```

### Modo Producción

Genera una versión optimizada para producción con assets concatenados y minimizados.

```bash
npm run build
```

Los archivos generados se almacenarán en la carpeta:

```text
build/
```

---

## Ejecución de Tests

Ejecutar la batería de pruebas:

```bash
npm test
```

---

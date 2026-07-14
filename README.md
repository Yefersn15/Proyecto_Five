# Proyecto_Five

Este proyecto es una tienda web de productos orgánicos desarrollada con React y Vite. La aplicación está diseñada para mostrar productos, navegar entre secciones y ofrecer una experiencia de compra sencilla y moderna.

## Características

- Interfaz moderna y responsiva
- Navegación entre páginas con React Router
- Estilos con Bootstrap
- Configuración lista para desarrollo y despliegue con Vite
- Preparada para publicar en GitHub Pages
- Integración con Google Sheets y Google Apps Script para mostrar y guardar productos

## Tecnologías utilizadas

- React
- Vite
- React Router DOM
- Bootstrap
- ESLint
- Google Sheets
- Google Apps Script

## Requisitos previos

Antes de ejecutar el proyecto asegúrate de tener instalado:

- Node.js 18 o superior
- npm
- Una cuenta de Google
- Un archivo de Google Sheets

## Instalación

```bash
npm install
```

## Variables de entorno

Crea un archivo .env en la raíz del proyecto basándote en este ejemplo:

```env
VITE_GOOGLE_SHEET_ENDPOINT=https://docs.google.com/spreadsheets/d/TU_SHEET_ID/edit?usp=sharing
VITE_APPS_SCRIPT_URL=https://script.google.com/macros/s/TU_DEPLOYMENT_ID/exec
```

> El valor de VITE_GOOGLE_SHEET_ENDPOINT debe ser la URL pública de tu hoja de Google Sheets.
> El valor de VITE_APPS_SCRIPT_URL debe ser la URL que obtienes al publicar tu Apps Script como Web App.

## Ejecución en desarrollo

```bash
npm run dev
```

## Construcción para producción

```bash
npm run build
```

## Despliegue

El proyecto incluye un script para publicar la aplicación en GitHub Pages:

```bash
npm run deploy
```

## Paso a paso: conectar Google Sheets y Apps Script

### 1. Crear la hoja de Google Sheets

1. Abre Google Sheets.
2. Crea un nuevo libro.
3. Crea una hoja llamada Productos.
4. Agrega estos encabezados en la fila 1:

```text
ID | Nombre | Descripción | Precio | Stock | Categoría | Imagen
```

5. Puedes agregar algunos productos de ejemplo para probar.

### 2. Hacer pública la hoja

1. Abre la hoja.
2. Haz clic en Compartir.
3. Elige "Cualquier persona con el enlace".
4. Dale permiso de "Visor".
5. Copia la URL de la hoja.

### 3. Crear el Apps Script

1. Dentro de la hoja, ve a Extensiones > Apps Script.
2. Borra el código inicial y pega este ejemplo:

```javascript
function doGet() {
  return ContentService
    .createTextOutput('Apps Script funcionando correctamente')
    .setMimeType(ContentService.MimeType.TEXT);
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);

    if (!data.nombre || !data.descripcion || !data.precio || !data.stock) {
      throw new Error('Faltan campos requeridos');
    }

    const sheetId = 'TU_SHEET_ID';
    const sheet = SpreadsheetApp.openById(sheetId).getSheetByName('Productos');
    const id = 'PROD_' + new Date().getTime();

    sheet.appendRow([
      id,
      data.nombre,
      data.descripcion,
      data.precio,
      data.stock,
      data.categoria || '',
      data.imagen || ''
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ success: true, id }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

### 4. Publicar el Apps Script como Web App

1. En Apps Script, ve a Implementar > Desplegar como aplicación web.
2. Selecciona:
   - Ejecutar como: Yo
   - Quien tiene acceso: Cualquiera
3. Haz clic en Implementar.
4. Copia la URL generada. Esa será tu VITE_APPS_SCRIPT_URL.

### 5. Conectar el proyecto

1. Crea un archivo .env en la raíz del proyecto.
2. Agrega estas variables:

```env
VITE_GOOGLE_SHEET_ENDPOINT=https://docs.google.com/spreadsheets/d/TU_SHEET_ID/edit?usp=sharing
VITE_APPS_SCRIPT_URL=https://script.google.com/macros/s/TU_DEPLOYMENT_ID/exec
```

3. Reemplaza TU_SHEET_ID por el ID real de tu Google Sheet.
4. Reemplaza TU_DEPLOYMENT_ID por el ID que aparece en tu URL de Apps Script.
5. Reinicia el proyecto con:

```bash
npm run dev
```

### 6. Probar el flujo

Puedes probar el envío de datos desde tu frontend o desde una petición HTTP como esta:

```bash
curl -X POST "https://script.google.com/macros/s/TU_DEPLOYMENT_ID/exec" \
  -H "Content-Type: application/json" \
  -d '{"nombre":"Manzana orgánica","descripcion":"Producto fresco","precio":5000,"stock":20,"categoria":"Frutas","imagen":"https://ejemplo.com/imagen.jpg"}'
```

Si todo está bien, el producto aparecerá en la hoja Productos de Google Sheets.

## ¿Qué aprendí?

Durante el desarrollo de este proyecto aprendí a:

- crear una aplicación frontend con React y Vite;
- organizar la navegación entre páginas con React Router;
- trabajar con componentes reutilizables y estilos modernos;
- preparar un proyecto para despliegue en GitHub Pages;
- integrar Google Sheets y Google Apps Script para manejar datos de forma práctica;
- mejorar la estructura y documentación de un repositorio.
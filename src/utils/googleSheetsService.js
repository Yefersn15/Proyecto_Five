/**
 * Servicio para interactuar con Google Sheets API
 *
 * Este archivo es un ejemplo de cómo se podría implementar la integración
 * con Google Sheets utilizando la variable de entorno VITE_GOOGLE_SHEET_ENDPOINT
 *
 * Para una implementación real, necesitarías:
 * 1. Configurar un proyecto en Google Cloud Console
 * 2. Habilitar la API de Google Sheets
 * 3. Crear credenciales (API Key o OAuth)
 * 4. Instalar la biblioteca googleapis con: npm install googleapis
 */

// Importamos la URL de la hoja de cálculo y del Apps Script desde las variables de entorno
const GOOGLE_SHEET_URL = import.meta.env.VITE_GOOGLE_SHEET_ENDPOINT;
const APPS_SCRIPT_URL = import.meta.env.VITE_APPS_SCRIPT_URL || 'https://script.google.com/macros/s/AKfycbxP_EE_466lOOG1UeaJR7tIe8gOTr0b26PsgcQb8TeQH1Qyn9OIJ1z60HHmw0F5_Er1/exec';

/**
 * Extrae el ID de la hoja de cálculo de Google desde la URL
 * @param {string} url - URL completa de la hoja de cálculo
 * @returns {string} - ID de la hoja de cálculo
 */
const extractSheetId = (url) => {
  // La URL tiene un formato como:
  // https://docs.google.com/spreadsheets/d/SHEET_ID/edit?usp=sharing
  const matches = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
  return matches ? matches[1] : null;
};

// Extraemos el ID de la hoja de cálculo
const SHEET_ID = extractSheetId(GOOGLE_SHEET_URL);

/**
 * Función para obtener datos de productos orgánicos desde la hoja de cálculo
 *
 * @param {string} sheetName - Nombre de la hoja específica (opcional, por defecto usa la primera)
 * @returns {Promise<Array>} - Promesa que resuelve a un array de productos
 */
export const fetchSheetData = async (sheetName = '') => {
  try {
    if (!SHEET_ID) {
      throw new Error('ID de hoja de cálculo no válido');
    }

    // Construimos la URL para acceder a la hoja como CSV público
    // Si se especifica un nombre de hoja, lo incluimos en la URL
    let publicCsvUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv`;
    if (sheetName) {
      publicCsvUrl += `&gid=${sheetName}`;
    }

    console.log('Cargando datos desde:', publicCsvUrl);

    // Hacemos la petición
    const response = await fetch(publicCsvUrl);

    if (!response.ok) {
      throw new Error(`Error al obtener datos: ${response.status} ${response.statusText}`);
    }

    // Convertimos el CSV a texto
    const csvText = await response.text();

    if (!csvText.trim()) {
      throw new Error('La hoja de cálculo está vacía');
    }

    // Parseamos el CSV a un array de objetos
    const products = parseCSVToProducts(csvText);

    console.log(`Se cargaron ${products.length} productos desde Google Sheets`);
    return products;

  } catch (error) {
    console.error('Error al obtener datos de Google Sheets:', error);

    // En caso de error, devolvemos datos de ejemplo para que la aplicación siga funcionando
    console.log('Usando datos de ejemplo debido al error');
    return getExampleProducts();
  }
};

/**
 * Parsea el texto CSV y lo convierte en un array de productos
 * @param {string} csvText - Texto CSV de la hoja de cálculo
 * @returns {Array} - Array de objetos producto
 */
const parseCSVToProducts = (csvText) => {
  const rows = csvText.split('\n').filter(row => row.trim() !== '');

  if (rows.length < 2) {
    throw new Error('La hoja de cálculo debe tener al menos una fila de encabezados y una fila de datos');
  }

  // Parseamos la primera fila como encabezados
  const headers = parseCSVRow(rows[0]);

  // Parseamos el resto de las filas como datos
  const products = [];

  for (let i = 1; i < rows.length; i++) {
    const values = parseCSVRow(rows[i]);

    if (values.length === 0 || values.every(val => val === '')) {
      continue; // Saltamos filas vacías
    }

    const product = {};

    headers.forEach((header, index) => {
      const cleanHeader = header.toLowerCase().trim();
      const value = values[index] ? values[index].trim() : '';

      // Mapeamos los encabezados a propiedades del producto
      if (cleanHeader.includes('nombre') || cleanHeader.includes('producto')) {
        product.name = value;
      } else if (cleanHeader.includes('precio')) {
        product.price = parseFloat(value.replace(/[^\d.,]/g, '').replace(',', '.')) || 0;
      } else if (cleanHeader.includes('stock') || cleanHeader.includes('cantidad') || cleanHeader.includes('disponible')) {
        product.stock = parseInt(value) || 0;
      } else if (cleanHeader.includes('descripcion') || cleanHeader.includes('descripción')) {
        product.description = value;
      } else if (cleanHeader.includes('categoria') || cleanHeader.includes('categoría')) {
        product.category = value;
      } else if (cleanHeader.includes('imagen') || cleanHeader.includes('foto')) {
        product.image = value;
      } else {
        // Para cualquier otro campo, lo agregamos tal como está
        product[cleanHeader] = value;
      }
    });

    // Solo agregamos el producto si tiene al menos un nombre
    if (product.name) {
      product.id = i; // Asignamos un ID basado en la fila
      products.push(product);
    }
  }

  return products;
};

/**
 * Parsea una fila CSV manejando comillas y comas dentro de los valores
 * @param {string} row - Fila CSV
 * @returns {Array} - Array de valores
 */
const parseCSVRow = (row) => {
  const values = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < row.length; i++) {
    const char = row[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      values.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  values.push(current); // Agregar el último valor
  return values;
};

/**
 * Devuelve productos de ejemplo en caso de que falle la carga desde Google Sheets
 * @returns {Array} - Array de productos de ejemplo
 */
const getExampleProducts = () => {
  return [
    {
      id: 1,
      name: 'Lechuga Orgánica',
      price: 2500,
      stock: 20,
      description: 'Lechuga fresca cultivada sin pesticidas',
      category: 'Verduras'
    },
    {
      id: 2,
      name: 'Tomates Orgánicos',
      price: 3000,
      stock: 15,
      description: 'Tomates rojos maduros y jugosos',
      category: 'Verduras'
    },
    {
      id: 3,
      name: 'Zanahorias Orgánicas',
      price: 2000,
      stock: 30,
      description: 'Zanahorias dulces y crujientes',
      category: 'Verduras'
    },
    {
      id: 4,
      name: 'Manzanas Orgánicas',
      price: 4000,
      stock: 25,
      description: 'Manzanas rojas sin químicos',
      category: 'Frutas'
    },
    {
      id: 5,
      name: 'Bananos Orgánicos',
      price: 1500,
      stock: 40,
      description: 'Bananos maduros y dulces',
      category: 'Frutas'
    }
  ];
};

/**
 * Función para enviar datos a Google Sheets (simulada)
 *
 * En una implementación real, esto requeriría:
 * 1. Configurar Google Apps Script o usar la API de Google Sheets
 * 2. Autenticación adecuada
 * 3. Permisos de escritura en la hoja de cálculo
 *
 * @param {Object} data - Datos a enviar
 * @returns {Promise<Object>} - Respuesta simulada
 */
export const sendDataToSheet = async (data) => {
  try {
    console.log('Enviando datos a Google Sheets:', data);

    // Simulamos un delay de red
    await new Promise(resolve => setTimeout(resolve, 1000));

    // En una implementación real, aquí harías la petición a Google Sheets API
    // o a un endpoint de Google Apps Script

    return {
      success: true,
      message: 'Datos enviados correctamente (simulado)',
      data: data
    };
  } catch (error) {
    throw new Error('Error al enviar datos a Google Sheets: ' + error.message);
  }
};

/**
 * Función específica para enviar mensajes de contacto a la hoja "Mensaje"
 * Utiliza Google Apps Script Web App para enviar datos reales
 *
 * @param {Object} messageData - Datos del mensaje de contacto
 * @returns {Promise<Object>} - Respuesta del envío
 */
export const sendContactMessage = async (messageData) => {
  try {
    if (!SHEET_ID) {
      throw new Error('ID de hoja de cálculo no válido');
    }

    // Preparar los datos según el formato esperado por Google Apps Script
    const dataToSend = {
      name: messageData.nombre || messageData.name || '',
      email: messageData.email || '',
      phone: messageData.telefono || messageData.phone || '',
      message: messageData.mensaje || messageData.message || ''
    };

    console.log('Enviando mensaje de contacto:', dataToSend);

    // URL del Web App de Google Apps Script
    const webAppUrl = APPS_SCRIPT_URL;

    // MODO DE PRODUCCIÓN: Envío real a Google Apps Script
    console.log('📤 Enviando datos reales a Google Sheets...');
    console.log('🔗 URL del Web App:', webAppUrl);
    console.log('📦 Datos a enviar:', dataToSend);

    try {
      const response = await fetch(webAppUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
        mode: 'no-cors' // Cambiar a no-cors para evitar problemas de CORS
      });

      // Con no-cors, no podemos leer la respuesta, así que asumimos éxito
      console.log('✅ Petición enviada a Google Apps Script');

      // Simular respuesta exitosa ya que no podemos leer la respuesta real con no-cors
      return {
        success: true,
        message: 'Mensaje enviado correctamente a Google Sheets',
        data: dataToSend,
        timestamp: new Date().toISOString(),
        note: 'Datos enviados con modo no-cors. Verifica tu Google Sheet para confirmar.'
      };

    } catch (fetchError) {
      console.error('❌ Error al conectar con Google Apps Script:', fetchError);

      // Fallback: Si falla el envío real, usar simulación como respaldo
      console.log('🔄 Usando modo simulación como respaldo...');

      await new Promise(resolve => setTimeout(resolve, 1000));

      return {
        success: true,
        message: 'Mensaje procesado (modo respaldo - revisar configuración del Web App)',
        data: dataToSend,
        timestamp: new Date().toISOString(),
        warning: 'El envío real falló, se usó modo simulación como respaldo',
        error: fetchError.message
      };
    }

  } catch (error) {
    console.error('Error al enviar mensaje de contacto:', error);
    throw new Error(`Error al enviar mensaje: ${error.message}`);
  }
};
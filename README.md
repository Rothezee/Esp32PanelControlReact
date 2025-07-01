# ESP32PanelControlReact

Aplicación web para el **monitoreo y administración en tiempo real de máquinas de premios y videojuegos** mediante dispositivos ESP32, desarrollada en React y TypeScript.

## Descripción

Este proyecto permite visualizar y administrar el estado de máquinas como grúas, maquinitas de premios, ticketeras y videojuegos similares. Los dispositivos ESP32 envían datos en tiempo real a través de una API, y la interfaz muestra su actividad, reportes y estadísticas para control administrativo.

## Características principales

- **Monitoreo en tiempo real** del funcionamiento de cada máquina conectada.
- Detección y visualización de eventos: encendido, juego activo, entrega de premios, etc.
- Dashboard con estado general y acceso a reportes visuales.
- Soporte para múltiples tipos de máquinas: grúa, expendedora, videojuegos, ticketera.
- Gestión de dispositivos (alta, edición, baja) desde el panel.
- Analíticas y reportes históricos por máquina.
- Acceso mediante sistema de login administrativo.

## Estructura del proyecto

- **Frontend:** React + TypeScript, rutas protegidas y dashboard interactivo.
- **Backend:** Node.js (Express), API REST para recepción y consulta de datos.
- **WebSocket:** Actualizaciones en tiempo real.
- **Base de datos:** MySQL (ejemplo clásico, adaptable a otras soluciones).
- Carpetas principales:
  - `src/` - Código fuente de React.
  - `server/` - Backend Express/Node.
  - `public/` - Recursos estáticos.
  - `sql/` - Scripts de base de datos de ejemplo.

## Requisitos

- Node.js (>= 18)
- npm o yarn
- MySQL u otra base de datos compatible
- Dispositivos ESP32 programados para enviar información a la API

## Instalación

1. **Clona este repositorio:**
   ```sh
   git clone https://github.com/Rothezee/Esp32PanelControlReact.git
   cd Esp32PanelControlReact
   ```

2. **Instala dependencias del frontend y backend:**
   ```sh
   npm install
   cd server
   npm install
   cd ..
   ```

3. **Configura la base de datos:**
   - Crea una base de datos MySQL.
   - Ejecuta los scripts SQL de ejemplo proporcionados en la carpeta `sql/`.
   - Ajusta los parámetros de conexión en los archivos de configuración (`server/.env`, etc.).

4. **Configura los ESP32** para enviar datos HTTP a las rutas de la API (`/api/esp32`).

5. **Inicia el backend:**
   ```sh
   cd server
   npm run start
   ```

6. **Inicia el frontend:**
   ```sh
   npm run dev
   ```

7. Accede a [http://localhost:5173](http://localhost:5173) o el puerto configurado.

## Uso

- Ingresa con tu usuario y contraseña.
- Visualiza el dashboard con todas las máquinas conectadas.
- Consulta reportes de actividad, premios y estadísticas.
- Agrega, edita o elimina dispositivos desde el panel.
- Administra usuarios y configuraciones (solo para administradores).

## Notas

- El sistema es extensible: puedes agregar más tipos de máquinas o sensores conectados al ESP32.
- Para dudas o contribuciones, abre un issue o pull request en este repositorio.

---

¿Dudas, sugerencias o quieres contribuir? ¡Abre un issue o pull request!

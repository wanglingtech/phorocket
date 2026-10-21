<div align="center">

  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:00F2FE,100:4FACFE&height=220&section=header&text=PHOROCKET&fontSize=80&fontColor=ffffff&fontAlignY=38&desc=Next-Gen%20Cyberpunk%20Interactive%20Audio%20Station&descAlignY=62&descAlign=50" alt="Phorocket Banner" width="100%" />
  <img src="images\img\Portada_Phorocket.png" alt="Portada Phorocket"/>

  <p align="center">
    <b>Plataforma musical interactiva de estética Cyberpunk/Sci-Fi con procesamiento de audio DSP, visualizadores en tiempo real y asistencia de IA.</b>
  </p>

  <p align="center">
    <a href="https://github.com/wanglingtech/phorocket/stargazers"><img src="https://img.shields.io/github/stars/wanglingtech/phorocket?style=for-the-badge&color=00F2FE&logo=github" alt="Stars"></a>
    <a href="https://github.com/wanglingtech/phorocket/network/members"><img src="https://img.shields.io/github/forks/wanglingtech/phorocket?style=for-the-badge&color=4FACFE&logo=github" alt="Forks"></a>
    <a href="https://github.com/wanglingtech/phorocket/blob/main/LICENSE"><img src="https://img.shields.io/github/license/wanglingtech/phorocket?style=for-the-badge&color=00F2FE" alt="License"></a>
    <a href="https://react.dev/"><img src="https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React"></a>
    <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript"></a>
    <a href="https://tailwindcss.com/"><img src="https://img.shields.io/badge/Tailwind_CSS-3.x-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind"></a>
  </p>

  <sub>Diseñado para audiófilos, desarrolladores y amantes del movimiento Cyberpunk/Synthwave.</sub>

  <br/><br/>

</div>

---

## ⚡ Vista General

**Phorocket** es una estación de audio digital de última generación desarrollada con React, TypeScript y Node.js. Combina la potencia del **Web Audio API** para procesamiento acústico digital (DSP) avanzado con una interfaz de usuario hiper-personalizable, visualizadores reactivos Canvas/D3 y **Aura AI**, un copiloto musical con reconocimiento de voz y procesamiento de lenguaje natural local y en la nube.

---

## 🔥 Características Principales

### 🎵 1. Motor de Audio & DSP (Digital Signal Processing)
* **Reproducción de Alta Fidelidad:** Scrubbing fluido, control de volumen con curva logarítmica, muting instantáneo y modos de reproducción Shuffle / Loop.
* **Ecualizador Paramétrico de 5 Bandas:**
  * Control directo en frecuencias clave: `60Hz`, `250Hz`, `1kHz`, `4kHz` y `12kHz`.
  * Presets de fábrica incluidos: *Flat, Bass Boost, Cyber Synth, Vocal Clarity, Club Master, Treble Boost*.
  * Creación, persistencia local, exportación e importación de perfiles acústicos personalizados.
* **Visualizadores Reactivos:**
  * Renderizado multi-modo en **Canvas API** y **D3.js**: Espectro de frecuencias, onda circular, radar táctico HUD y malla de partículas sub-woofer.
  * **Modo Eco / Low Resource:** Desactiva renderizados pesados con 1-clic para ahorrar batería y CPU en dispositivos móviles o laptops.

---

### 📂 2. Gestión de Biblioteca y Contenido
* **Catálogo Curado Gratis y Legal:** Pistas integradas en géneros Cyberpunk, Synthwave, Lo-Fi, Darksynth y Ambient con metadatos completos y letras sincronizadas (lyrics).
* **Smart Playlists:** Creación y edición ilimitada de listas con gradientes dinámicos e identificación personalizada.
* **Importación de Archivos Locales:** Soporte nativo de arrastrar y soltar (Drag & Drop) para formatos `MP3`, `WAV`, `FLAC` y `OGG`.
* **Integración Externa:** Mapeador y exportador de listas de reproducción hacia Spotify.

---

### 🤖 3. Aura AI — Copiloto Musical Inteligente
* **Interacción por Voz y Texto:** Controla la reproducción mediante lenguaje natural (*"reproduce Neon Orbit"*, *"pon algo de synthwave"*, *"ajusta el volumen al 80%"*).
* **Motor Offline Heurístico:** Si la conexión a la red se interrumpe, el procesador de comandos local asume el control inmediato sin depender de la nube.
* **Gestión de Credenciales:**
  * Entrada flexible de credenciales para modelos de IA o conexión transparente mediante backend Express.
  * Selector de modelos activos con monitoreo de estado de conexión.

---

### 🎨 4. Motor de Tematización & Personalización Extrema
* **Canvas de Fondo con Encuadre Interactivo (Pan & Tilt):**
  * Asignación de imágenes independientes para la **Sidebar**, **Player Bar** y **Módulos Centrales**.
  * Herramienta táctil para mover en ejes X/Y, controlar zoom, desenfoque y capas de opacidad para garantizar contraste óptimo.
* **Estudio de Color & Tipografía Global:**
  * Compatibilidad con fuentes tipográficas como *Plus Jakarta Sans, Orbitron, Rajdhani, Space Grotesk, JetBrains Mono*, entre otras.
  * Selector hexadecimal para acentos de color neón y temas oscuros preconfigurados: *Vacío Cuántico, OLED Puro, Azul Neo-Tokyo, Terminal Matrix y Carmesí Void*.
* **Layouts Modulares:**
  * Player Bar intercambiable (*Cyber-Dock flotante, Studio Rack profesional o Minimal*).
  * Carátulas en *Holograma Neón, Vinilo Giratorio, Cubo Glass 3D o Clean Flat*.

---

### 📱 5. Adaptabilidad Multi-Dispositivo
* **Escritorio:** Barra lateral expandible y soporte completo para atajos de teclado globales.
* **Tablets:** Interfaz adaptativa optimizada a layout compacto de doble columna.
* **Smartphones:** Barra de navegación inferior táctil (`MobileNav`), mini-reproductor a pantalla completa (`FullscreenPlayer`) y botón flotante de comandos por voz.
* **Simulador Smartwatch:** Modal interactivo que emula la interfaz de un reloj inteligente como control remoto secundario.

---

## ⌨️ Atajos de Teclado Globales

| Tecla | Acción |
| :--- | :--- |
| <kbd>Espacio</kbd> | Reproducir / Pausar |
| <kbd>←</kbd> / <kbd>→</kbd> | Retroceder / Adelantar 5 segundos |
| <kbd>↑</kbd> / <kbd>↓</kbd> | Subir / Bajar volumen |
| <kbd>M</kbd> | Silenciar / Activar sonido |
| <kbd>L</kbd> | Marcar / Desmarcar pista como Favorito |
| <kbd>F</kbd> | Activar / Desactivar Pantalla Completa |
| <kbd>Y</kbd> | Mostrar / Ocultar Letras Sincronizadas (Lyrics) |

---

## 🛠️ Stack Tecnológico

* **Frontend:** [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Tailwind CSS 4](https://tailwindcss.com/), Vite
* **Backend:** Node.js 20+, Express 4 (arquitectura modular), Prisma + MySQL (nube) / SQLite (local)
* **Audio & Visuales:** Web Audio API, HTML5 Canvas, D3.js, Lucide Icons
* **Monorepo:** pnpm workspaces (`frontend/`, `backend/`, `database/`, `tests/api/`)

📖 Documentación completa en [`docs/`](docs/README.md) · 🗺️ Roadmap en [`docs/roadmap.md`](docs/roadmap.md)

---

## 🚀 Instalación y Uso Local (desarrollo)

### Requisitos
* **Node.js** ≥ 20 (recomendado 24) y **pnpm** 12
* **MySQL 8+** solo para el backend con BD (opcional para probar frontend/health/IA)

### Pasos

1. **Clonar e instalar:**
   ```bash
   git clone https://github.com/wanglingtech/phorocket.git
   cd phorocket
   pnpm install
   ```

2. **Configurar entornos:**
   ```bash
   cp backend/.env.example backend/.env      # JWT secrets + DATABASE_URL
   cp database/.env.example database/.env    # credenciales MySQL
   cp frontend/.env.example frontend/.env    # opcional en dev
   ```
   Genera secretos JWT fuertes (64 hex) y crea la BD: `CREATE DATABASE phorocket CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`

3. **Base de datos:**
   ```bash
   pnpm db:generate
   pnpm db:migrate
   ```

4. **Arrancar (una terminal):**
   ```bash
   pnpm dev          # API (localhost:4000) + Web (localhost:5173)
   # o por separado:
   pnpm dev:api      # solo backend
   pnpm dev:web      # solo frontend
   ```

5. Abrir **http://localhost:5173** (el frontend hace proxy de `/api` al backend).

### Pruebas de API (Bruno)

Importar `tests/api/` como colección en [Bruno](https://usebruno.com) y elegir el entorno `local`. Ver [`docs/testing.md`](docs/testing.md).

---

## 📄 Licencia

Este proyecto está bajo la Licencia **MIT**. Consulta el archivo [LICENSE](LICENSE) para obtener más detalles.

---

<div align="center">
  <sub>Desarrollado con ❤️ por <a href="https://github.com/wanglingtech">WanglingTech</a></sub>
</div>
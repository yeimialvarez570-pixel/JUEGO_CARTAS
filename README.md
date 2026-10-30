# 🎮 NEXUS MEMORY - Juego de Memoria y Parejas (4x4)

Un juego de memoria interactivo y moderno desarrollado con **HTML5 semántico, CSS3 Vanilla avanzado y JavaScript moderno**.

---

## 🚀 Cómo jugar

Tienes dos formas muy sencillas de abrir y disfrutar el juego:

### Opción 1: Directo en tu navegador (Recomendada)
1. Ve a la carpeta del proyecto en tu computadora:  
   `C:\Users\MI ESPOSA\OneDrive\Documentos\JUEGO_PELEA`
2. Haz **doble clic** sobre el archivo [`index.html`](file:///c:/Users/MI%20ESPOSA/OneDrive/Documentos/JUEGO_PELEA/index.html).
3. Se abrirá inmediatamente en tu navegador web predeterminado (Chrome, Edge, Firefox, Brave, etc.). ¡No requiere internet!

### Opción 2: Servidor local HTTP
El servidor local ya se encuentra activo en tu equipo:
- Abre en tu navegador la dirección: [http://localhost:8080/index.html](http://localhost:8080/index.html)

---

## ✨ Características y Requisitos Implementados

| Requisito | Estado | Implementación |
| :--- | :---: | :--- |
| **Pantalla principal con el nombre del juego** | ✅ | Pantalla de inicio de alto impacto visual con el título **NEXUS MEMORY**, selector de temáticas, récords previos y botones de acceso. |
| **Tablero con 16 tarjetas (4x4)** | ✅ | Grilla CSS Grid estructurada en 4 filas y 4 columnas (`grid-template-columns: repeat(4, 1fr)`). |
| **8 parejas distribuidas aleatoriamente** | ✅ | Barajado perfecto mediante el algoritmo **Fisher-Yates Shuffle** en cada nueva partida. |
| **Selección de 2 tarjetas por turno** | ✅ | Control de turnos donde el jugador revela una primera tarjeta y luego una segunda para contrastarlas. |
| **Permanecen visibles si coinciden** | ✅ | Clase `.is-matched` con animación verde esmeralda y sonido armónico de acierto. |
| **Se ocultan si no coinciden** | ✅ | Animación sutil de temblor (*shake*) y ocultación automática tras 950 milisegundos. |
| **Contador de intentos realizados** | ✅ | Cada turno de 2 tarjetas incrementa en 1 el contador de intentos en el HUD. |
| **Contador de parejas encontradas** | ✅ | Marcador en tiempo real `X / 8` y barra de progreso porcentual dinámica. |
| **Registro de tiempo transcurrido** | ✅ | Cronómetro preciso en formato `MM:SS` que inicia con el primer movimiento del jugador. |
| **Mensaje de victoria** | ✅ | Modal elegante con trofeo animado, lluvia de confeti en `<canvas>` y fanfarria triunfal. |
| **Permitir reiniciar la partida** | ✅ | Botón "🔄 Reiniciar" en la cabecera y botón "Jugar de Nuevo" en el modal de victoria. |
| **Impedir seleccionar tarjetas ya emparejadas** | ✅ | Bloqueo estricto por CSS (`pointer-events: none`) y verificación lógica en JavaScript. |
| **Impedir seleccionar más tarjetas durante el fallo** | ✅ | Bloqueo `isLockBoard = true` durante el intervalo de ocultación para evitar selecciones accidentales. |
| **Resultado final detallado** | ✅ | Desglose completo al ganar: tiempo total, intentos realizados, parejas (8/8) y porcentaje de precisión. |

---

## 🎨 Características Adicionales Premium

1. **3 Temáticas Visuales Seleccionables:**
   - 💎 **Gemas Cósmicas:** Diamantes, orbes, estrellas, satélites, meteoros y relámpagos.
   - 🤖 **Cyberpunk:** Robots, arcades retro, microchips, naves espaciales y biotecnología.
   - 🦁 **Mundo Salvaje:** Leones, zorros, pandas, tigres, unicornios, búhos y dragones.
2. **Efectos de Sonido Sintetizados (Web Audio API):**
   - No requiere descargar archivos MP3 ni depende de conexiones externas.
   - Sonidos de volteo (*pop*), acierto (*acorde alegre*), fallo (*burbuja baja*) y victoria (*fanfarria*).
   - Incluye botón para silenciar/activar sonido en cualquier momento.
3. **Persistencia de Récord Personal:**
   - Guarda tu mejor tiempo y menor cantidad de intentos en `localStorage`.
4. **Diseño Responsivo & Glassmorphism:**
   - Totalmente adaptable a computadoras, laptops, tablets y teléfonos móviles.

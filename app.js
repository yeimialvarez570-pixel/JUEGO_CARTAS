/**
 * ============================================================================
 * NEXUS MEMORY - JUEGO DE MEMORIA 4x4 (16 TARJETAS, 8 PAREJAS)
 * ============================================================================
 * Lógica completa con control de turnos estricto, cronómetro en vivo,
 * sistema de puntuación, Web Audio API sintetizado y animación de confeti.
 */

// Conjuntos temáticos de 8 símbolos únicos
const THEMES = {
  cosmic: {
    name: 'Gemas Cósmicas',
    bodyClass: 'theme-cosmic',
    symbols: [
      { id: 'diamond', char: '💎', label: 'Diamante Astral' },
      { id: 'crystal', char: '🔮', label: 'Orbe Místico' },
      { id: 'star', char: '⭐', label: 'Estrella Nova' },
      { id: 'planet', char: '🪐', label: 'Planeta Saturno' },
      { id: 'lightning', char: '⚡', label: 'Relámpago Cósmico' },
      { id: 'moon', char: '🌙', label: 'Luna Esmeralda' },
      { id: 'sun', char: '☀️', label: 'Sol Radiante' },
      { id: 'comet', char: '☄️', label: 'Cometa de Fuego' }
    ]
  },
  cyber: {
    name: 'Cyberpunk',
    bodyClass: 'theme-cyber',
    symbols: [
      { id: 'robot', char: '🤖', label: 'Robot IA' },
      { id: 'arcade', char: '🕹️', label: 'Retro Arcade' },
      { id: 'chip', char: '💾', label: 'Cyber Chip' },
      { id: 'rocket', char: '🚀', label: 'Nave Espacial' },
      { id: 'dna', char: '🧬', label: 'Bio Neón' },
      { id: 'headset', char: '🎧', label: 'Cyber Casco' },
      { id: 'battery', char: '⚡', label: 'Voltaje' },
      { id: 'alien', char: '👾', label: 'Alien Pixel' }
    ]
  },
  nature: {
    name: 'Mundo Salvaje',
    bodyClass: 'theme-nature',
    symbols: [
      { id: 'lion', char: '🦁', label: 'León Dorado' },
      { id: 'fox', char: '🦊', label: 'Zorro Ártico' },
      { id: 'panda', char: '🐼', label: 'Panda Zen' },
      { id: 'tiger', char: '🐯', label: 'Tigre de Bengala' },
      { id: 'unicorn', char: '🦄', label: 'Unicornio Mágico' },
      { id: 'owl', char: '🦉', label: 'Búho Sabio' },
      { id: 'dolphin', char: '🐬', label: 'Delfín Oceánico' },
      { id: 'dragon', char: '🐲', label: 'Dragón Imperial' }
    ]
  }
};

// ============================================================================
// SISTEMA DE AUDIO (Web Audio API - Sin archivos externos, 100% confiable)
// ============================================================================
class SoundEffects {
  constructor() {
    this.audioCtx = null;
    this.isMuted = false;
  }

  init() {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  // Sonido al voltear una tarjeta (pop agudo y suave)
  playFlip() {
    if (this.isMuted) return;
    this.init();
    if (!this.audioCtx) return;

    try {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(420, this.audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(840, this.audioCtx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.12, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.08);
    } catch (e) {
      console.warn('Audio no disponible', e);
    }
  }

  // Sonido al acertar pareja (acorde armónico ascendente)
  playMatch() {
    if (this.isMuted) return;
    this.init();
    if (!this.audioCtx) return;

    try {
      const now = this.audioCtx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.50]; // Do, Mi, Sol, Do (C Mayor)
      notes.forEach((freq, idx) => {
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.06);

        gain.gain.setValueAtTime(0.15, now + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.35);

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);

        osc.start(now + idx * 0.06);
        osc.stop(now + idx * 0.06 + 0.35);
      });
    } catch (e) {
      console.warn('Audio no disponible', e);
    }
  }

  // Sonido al fallar la pareja (tono sutil bajo)
  playMismatch() {
    if (this.isMuted) return;
    this.init();
    if (!this.audioCtx) return;

    try {
      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.linearRampToValueAtTime(140, now + 0.25);

      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(now);
      osc.stop(now + 0.25);
    } catch (e) {
      console.warn('Audio no disponible', e);
    }
  }

  // Sonido de victoria (fanfarria triunfal)
  playVictory() {
    if (this.isMuted) return;
    this.init();
    if (!this.audioCtx) return;

    try {
      const notes = [
        { f: 523.25, d: 0.15, t: 0.0 },
        { f: 659.25, d: 0.15, t: 0.15 },
        { f: 783.99, d: 0.15, t: 0.3 },
        { f: 1046.50, d: 0.45, t: 0.45 }
      ];
      const now = this.audioCtx.currentTime;
      notes.forEach(note => {
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(note.f, now + note.t);

        gain.gain.setValueAtTime(0.2, now + note.t);
        gain.gain.exponentialRampToValueAtTime(0.001, now + note.t + note.d);

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);

        osc.start(now + note.t);
        osc.stop(now + note.t + note.d);
      });
    } catch (e) {
      console.warn('Audio no disponible', e);
    }
  }
}

// ============================================================================
// SISTEMA DE CONFETI PARA CELEBRACIÓN
// ============================================================================
class ConfettiEffect {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
    this.particles = [];
    this.animationId = null;
    this.colors = ['#8b5cf6', '#ec4899', '#06b6d4', '#10b981', '#f59e0b', '#ffffff'];
    this.handleResize = this.resize.bind(this);
    window.addEventListener('resize', this.handleResize);
  }

  resize() {
    if (!this.canvas) return;
    this.canvas.width = this.canvas.parentElement.clientWidth;
    this.canvas.height = this.canvas.parentElement.clientHeight;
  }

  start() {
    if (!this.canvas || !this.ctx) return;
    this.resize();
    this.particles = [];
    const count = 75;
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * -this.canvas.height,
        size: Math.random() * 8 + 4,
        color: this.colors[Math.floor(Math.random() * this.colors.length)],
        speedX: Math.random() * 4 - 2,
        speedY: Math.random() * 3 + 2,
        rotation: Math.random() * 360,
        rotationSpeed: Math.random() * 8 - 4
      });
    }
    this.render();
  }

  render() {
    if (!this.ctx) return;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    let activeParticles = 0;
    this.particles.forEach(p => {
      p.y += p.speedY;
      p.x += Math.sin(p.y * 0.05) * 1.5 + p.speedX * 0.3;
      p.rotation += p.rotationSpeed;

      if (p.y < this.canvas.height + 20) {
        activeParticles++;
      }

      this.ctx.save();
      this.ctx.translate(p.x, p.y);
      this.ctx.rotate((p.rotation * Math.PI) / 180);
      this.ctx.fillStyle = p.color;
      this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      this.ctx.restore();
    });

    if (activeParticles > 0) {
      this.animationId = requestAnimationFrame(this.render.bind(this));
    }
  }

  stop() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    if (this.ctx && this.canvas) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }
}

// ============================================================================
// CLASE CONTROLADORA PRINCIPAL DEL JUEGO
// ============================================================================
class NexusMemoryGame {
  constructor() {
    // Configuración & Estado
    this.currentThemeKey = 'cosmic';
    this.cards = [];
    this.firstCard = null;
    this.secondCard = null;
    this.isLockBoard = false; // Impide seleccionar más cartas en turno de comparación
    this.moves = 0; // Contador de intentos realizados
    this.matchesFound = 0; // Contador de parejas encontradas (máximo 8)
    this.totalPairs = 8; // 8 parejas en un tablero 4x4 (16 tarjetas)
    
    // Cronómetro
    this.timerSeconds = 0;
    this.timerInterval = null;
    this.isGameActive = false;
    this.hasTimerStarted = false;

    // Servicios
    this.sound = new SoundEffects();
    this.confetti = new ConfettiEffect('confetti-canvas');

    // Caché de Elementos del DOM
    this.dom = {
      // Pantallas
      screenHome: document.getElementById('screen-home'),
      screenGame: document.getElementById('screen-game'),
      
      // Botones navegación & controles
      btnStartGame: document.getElementById('btn-start-game'),
      btnHowToPlay: document.getElementById('btn-how-to-play'),
      btnBackHome: document.getElementById('btn-back-home'),
      btnRestartHeader: document.getElementById('btn-restart-header'),
      btnToggleSound: document.getElementById('btn-toggle-sound'),
      soundIcon: document.getElementById('sound-icon'),
      currentThemeBadge: document.getElementById('current-theme-badge'),
      
      // HUD de Estadísticas
      timerDisplay: document.getElementById('timer-display'),
      movesCounter: document.getElementById('moves-counter'),
      matchesCounter: document.getElementById('matches-counter'),
      progressFill: document.getElementById('progress-fill'),
      memoryGrid: document.getElementById('memory-grid'),
      
      // Modales
      modalVictory: document.getElementById('modal-victory'),
      finalTime: document.getElementById('final-time'),
      finalMoves: document.getElementById('final-moves'),
      finalMatches: document.getElementById('final-matches'),
      finalAccuracy: document.getElementById('final-accuracy'),
      newRecordBanner: document.getElementById('new-record-banner'),
      starsContainer: document.getElementById('stars-container'),
      btnPlayAgain: document.getElementById('btn-play-again'),
      btnVictoryHome: document.getElementById('btn-victory-home'),
      
      modalInstructions: document.getElementById('modal-instructions'),
      btnCloseInstructions: document.getElementById('btn-close-instructions'),
      btnGotIt: document.getElementById('btn-got-it'),
      
      // Récord en Home
      homeBestTime: document.getElementById('home-best-time'),
      homeBestMoves: document.getElementById('home-best-moves')
    };

    this.bindEvents();
    this.loadSavedRecords();
  }

  // Enlace de eventos de usuario
  bindEvents() {
    // Navegación de inicio a juego
    this.dom.btnStartGame.addEventListener('click', () => {
      this.sound.init();
      this.showScreen('game');
      this.startNewGame();
    });

    // Volver de juego a inicio
    this.dom.btnBackHome.addEventListener('click', () => {
      this.stopTimer();
      this.showScreen('home');
      this.loadSavedRecords();
    });

    // Botón reiniciar partida
    this.dom.btnRestartHeader.addEventListener('click', () => {
      this.sound.playFlip();
      this.startNewGame();
    });

    // Control de sonido
    this.dom.btnToggleSound.addEventListener('click', () => {
      const isMuted = this.sound.toggleMute();
      this.dom.soundIcon.textContent = isMuted ? '🔇' : '🔊';
    });

    // Botones de temas
    const themeButtons = document.querySelectorAll('.theme-btn');
    themeButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const themeKey = btn.dataset.theme;
        this.selectTheme(themeKey);
      });
    });

    // Modal de Instrucciones
    this.dom.btnHowToPlay.addEventListener('click', () => {
      this.dom.modalInstructions.classList.add('active');
    });

    const closeInstructions = () => {
      this.dom.modalInstructions.classList.remove('active');
    };
    this.dom.btnCloseInstructions.addEventListener('click', closeInstructions);
    this.dom.btnGotIt.addEventListener('click', closeInstructions);

    // Modal de Victoria
    this.dom.btnPlayAgain.addEventListener('click', () => {
      this.dom.modalVictory.classList.remove('active');
      this.confetti.stop();
      this.startNewGame();
    });

    this.dom.btnVictoryHome.addEventListener('click', () => {
      this.dom.modalVictory.classList.remove('active');
      this.confetti.stop();
      this.showScreen('home');
      this.loadSavedRecords();
    });
  }

  // Cambio de pantalla (Home vs Game)
  showScreen(screenName) {
    if (screenName === 'game') {
      this.dom.screenHome.classList.remove('active');
      this.dom.screenGame.classList.add('active');
    } else {
      this.dom.screenGame.classList.remove('active');
      this.dom.screenHome.classList.add('active');
    }
  }

  // Selección de temática gráfica
  selectTheme(themeKey) {
    if (!THEMES[themeKey]) return;
    this.currentThemeKey = themeKey;

    // Actualizar botones de tema activos
    document.querySelectorAll('.theme-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.theme === themeKey);
    });

    // Actualizar clase del body
    document.body.className = THEMES[themeKey].bodyClass;
    this.dom.currentThemeBadge.textContent = THEMES[themeKey].name;

    // Si ya estamos en el juego, reiniciar con el nuevo set temático
    if (this.dom.screenGame.classList.contains('active')) {
      this.startNewGame();
    }
  }

  // Iniciar una nueva partida
  startNewGame() {
    this.stopTimer();
    this.resetState();
    this.renderBoard();
  }

  // Restablecer variables de juego y UI
  resetState() {
    this.moves = 0;
    this.matchesFound = 0;
    this.timerSeconds = 0;
    this.firstCard = null;
    this.secondCard = null;
    this.isLockBoard = false;
    this.hasTimerStarted = false;
    this.isGameActive = true;

    // Actualizar contadores del HUD
    this.dom.movesCounter.textContent = '0';
    this.dom.matchesCounter.textContent = '0';
    this.dom.timerDisplay.textContent = '00:00';
    this.dom.progressFill.style.width = '0%';
  }

  // Cronómetro
  startTimer() {
    if (this.hasTimerStarted) return;
    this.hasTimerStarted = true;
    this.timerSeconds = 0;
    this.updateTimerDisplay();

    this.timerInterval = setInterval(() => {
      this.timerSeconds++;
      this.updateTimerDisplay();
    }, 1000);
  }

  stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  updateTimerDisplay() {
    const mins = Math.floor(this.timerSeconds / 60);
    const secs = this.timerSeconds % 60;
    const formatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    this.dom.timerDisplay.textContent = formatted;
  }

  // Generación y distribución aleatoria del tablero 4x4 (16 tarjetas)
  renderBoard() {
    const theme = THEMES[this.currentThemeKey];
    const baseSymbols = theme.symbols; // 8 símbolos únicos

    // Duplicar cada símbolo para obtener exactamente 8 parejas (16 tarjetas)
    const cardDataArray = [...baseSymbols, ...baseSymbols].map((item, index) => ({
      uid: `${item.id}_${index}`,
      id: item.id,
      char: item.char,
      label: item.label
    }));

    // Barajado aleatorio con Algoritmo Fisher-Yates
    this.shuffle(cardDataArray);

    // Limpiar el contenedor del tablero
    this.dom.memoryGrid.innerHTML = '';

    // Crear y añadir las 16 tarjetas al DOM con animación de entrada
    cardDataArray.forEach((item, index) => {
      const cardElement = this.createCardElement(item, index);
      this.dom.memoryGrid.appendChild(cardElement);
    });
  }

  // Algoritmo Fisher-Yates para barajar el arreglo
  shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  // Creación del elemento DOM de cada tarjeta
  createCardElement(item, index) {
    const card = document.createElement('div');
    card.classList.add('memory-card', 'deal-animation');
    card.dataset.symbol = item.id;
    card.dataset.uid = item.uid;
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-label', `Tarjeta ${index + 1} de 16`);
    card.style.animationDelay = `${index * 0.03}s`;

    card.innerHTML = `
      <div class="card-inner">
        <div class="card-face card-back">
          <div class="card-back-pattern">?</div>
        </div>
        <div class="card-face card-front">
          <span class="card-symbol" role="img" aria-label="${item.label}">${item.char}</span>
        </div>
      </div>
    `;

    // Eventos de selección por clic y teclado (Enter / Espacio)
    card.addEventListener('click', () => this.handleCardSelection(card));
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.handleCardSelection(card);
      }
    });

    return card;
  }

  // ============================================================================
  // LÓGICA DE SELECCIÓN Y VALIDACIÓN DE TARJETAS
  // ============================================================================
  handleCardSelection(card) {
    // 1. REGLA: No interactuar si el juego no está activo
    if (!this.isGameActive) return;

    // 2. REGLA: Impedir seleccionar más tarjetas mientras se están ocultando dos que no coinciden
    if (this.isLockBoard) return;

    // 3. REGLA: Impedir seleccionar tarjetas que ya formen una pareja encontrada
    if (card.classList.contains('is-matched')) return;

    // 4. REGLA: Impedir seleccionar la misma tarjeta que ya se seleccionó como primera
    if (card === this.firstCard) return;

    // Iniciar cronómetro en el primer movimiento del jugador
    if (!this.hasTimerStarted) {
      this.startTimer();
    }

    // Voltear la tarjeta seleccionada
    card.classList.add('is-flipped');
    this.sound.playFlip();

    // Caso A: Primera tarjeta del turno
    if (!this.firstCard) {
      this.firstCard = card;
      return;
    }

    // Caso B: Segunda tarjeta del turno -> Se completa 1 intento
    this.secondCard = card;
    this.moves++;
    this.dom.movesCounter.textContent = this.moves;

    // Evaluar si las dos tarjetas coinciden
    this.evaluateTurn();
  }

  // Evaluación de coincidencia de las dos tarjetas seleccionadas
  evaluateTurn() {
    const isMatch = this.firstCard.dataset.symbol === this.secondCard.dataset.symbol;

    if (isMatch) {
      this.handleMatchSuccess();
    } else {
      this.handleMatchFailure();
    }
  }

  // ACIERTO: Las tarjetas coinciden
  handleMatchSuccess() {
    // Marcar ambas tarjetas como acertadas (permanecen visibles de forma inmutable)
    this.firstCard.classList.add('is-matched');
    this.secondCard.classList.add('is-matched');

    this.matchesFound++;
    this.dom.matchesCounter.textContent = this.matchesFound;
    
    // Actualizar barra de progreso
    const progressPercent = (this.matchesFound / this.totalPairs) * 100;
    this.dom.progressFill.style.width = `${progressPercent}%`;

    // Reproducir sonido armónico de match
    this.sound.playMatch();

    // Resetear tarjetas del turno
    this.firstCard = null;
    this.secondCard = null;

    // Comprobar condición de victoria (todas las 8 parejas encontradas)
    if (this.matchesFound === this.totalPairs) {
      this.handleVictory();
    }
  }

  // FALLO: Las tarjetas no coinciden
  handleMatchFailure() {
    // REGLA: Bloquear el tablero para impedir clics adicionales mientras se ocultan
    this.isLockBoard = true;

    // Aplicar animación de error (shake)
    this.firstCard.classList.add('is-wrong');
    this.secondCard.classList.add('is-wrong');
    this.sound.playMismatch();

    // REGLA: Ocultar las tarjetas después de un breve tiempo de memorización (950ms)
    setTimeout(() => {
      if (this.firstCard && this.secondCard) {
        this.firstCard.classList.remove('is-flipped', 'is-wrong');
        this.secondCard.classList.remove('is-flipped', 'is-wrong');
      }

      // Liberar el bloqueo del tablero
      this.firstCard = null;
      this.secondCard = null;
      this.isLockBoard = false;
    }, 950);
  }

  // ============================================================================
  // CONDICIÓN DE VICTORIA Y PANTALLA FINAL
  // ============================================================================
  handleVictory() {
    this.isGameActive = false;
    this.stopTimer();

    const formattedTime = this.dom.timerDisplay.textContent;
    const totalMoves = this.moves;
    // Precisión teórica: (8 parejas / intentos realizados) * 100%
    const accuracy = Math.min(100, Math.round((this.totalPairs / Math.max(this.totalPairs, totalMoves)) * 100));

    // Desplegar resultados finales en el modal
    this.dom.finalTime.textContent = formattedTime;
    this.dom.finalMoves.textContent = totalMoves;
    this.dom.finalMatches.textContent = `${this.totalPairs} / ${this.totalPairs}`;
    this.dom.finalAccuracy.textContent = `${accuracy}%`;

    // Calcular estrellas (3 estrellas para <= 12 intentos, 2 para <= 18 intentos, 1 para más)
    this.calculateStars(totalMoves);

    // Guardar y verificar récord
    const isNewRecord = this.checkAndSaveRecord(this.timerSeconds, totalMoves, formattedTime);
    this.dom.newRecordBanner.classList.toggle('hidden', !isNewRecord);

    // Pequeño retardo de 400ms para apreciar el último match antes de abrir el modal
    setTimeout(() => {
      this.sound.playVictory();
      this.dom.modalVictory.classList.add('active');
      this.confetti.start();
    }, 450);
  }

  // Cálculo de estrellas según los intentos
  calculateStars(moves) {
    const stars = this.dom.starsContainer.querySelectorAll('.star');
    let starCount = 1;
    if (moves <= 12) {
      starCount = 3;
    } else if (moves <= 18) {
      starCount = 2;
    }

    stars.forEach((star, idx) => {
      if (idx < starCount) {
        star.classList.add('active');
      } else {
        star.classList.remove('active');
      }
    });
  }

  // ============================================================================
  // PERSISTENCIA DE RÉCORDS LOCALES (localStorage)
  // ============================================================================
  checkAndSaveRecord(seconds, moves, formattedTime) {
    let records = {};
    try {
      const stored = localStorage.getItem('nexus_memory_record');
      if (stored) records = JSON.parse(stored);
    } catch (e) {
      console.warn('localStorage no accesible', e);
    }

    let isNewRecord = false;

    if (!records.bestSeconds || seconds < records.bestSeconds || (seconds === records.bestSeconds && moves < records.bestMoves)) {
      records.bestSeconds = seconds;
      records.bestFormattedTime = formattedTime;
      records.bestMoves = moves;
      isNewRecord = true;

      try {
        localStorage.setItem('nexus_memory_record', JSON.stringify(records));
      } catch (e) {
        console.warn('Error guardando en localStorage', e);
      }
    }

    return isNewRecord;
  }

  loadSavedRecords() {
    try {
      const stored = localStorage.getItem('nexus_memory_record');
      if (stored) {
        const records = JSON.parse(stored);
        if (this.dom.homeBestTime && records.bestFormattedTime) {
          this.dom.homeBestTime.textContent = records.bestFormattedTime;
        }
        if (this.dom.homeBestMoves && records.bestMoves) {
          this.dom.homeBestMoves.textContent = records.bestMoves;
        }
      }
    } catch (e) {
      console.warn('Error leyendo récord guardado', e);
    }
  }
}

// ============================================================================
// INICIALIZACIÓN DE LA APLICACIÓN AL CARGAR EL DOM
// ============================================================================
document.addEventListener('DOMContentLoaded', () => {
  const game = new NexusMemoryGame();
  // Exponer instancia global para depuración o pruebas automatizadas
  window.__nexusGame = game;
});

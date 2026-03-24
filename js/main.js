/**
 * Main Game Controller
 */
import { AudioManager } from './audio.js';
import { DriverScene } from './scenes/driver.js';
import { PedestrianScene } from './scenes/pedestrian.js';
import { CyclistScene } from './scenes/cyclist.js';

class Game {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.renderer = null;
        this.scene = null;
        this.camera = null;
        this.audio = new AudioManager();
        
        this.currentScene = null;
        this.clock = new THREE.Clock();
        this.currentState = 'MENU'; // MENU, DRIVER, PEDESTRIAN, CYCLIST, END

        // UI Overlays
        this.introOverlay = document.getElementById('intro-overlay');
        this.hudContainer = document.getElementById('hud-container');
        this.transitionOverlay = document.getElementById('transition-overlay');
        
        this.setupThreeJS();
        this.bindEvents();
    }

    setupThreeJS() {
        // Init Scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x050508); // Dark background
        
        // Init Camera
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        
        // Init Renderer
        this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        // Background Atmosphere star ambient particles to feel immersive
        const starGeo = new THREE.BufferGeometry();
        const starCount = 500;
        const starPos = new Float32Array(starCount * 3);
        for(let i=0; i < starCount*3; i++) {
             starPos[i] = (Math.random() - 0.5) * 200;
        }
        starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
        const starMat = new THREE.PointsMaterial({ color: 0x00f0ff, size: 0.5, sizeAttenuation: true });
        const stars = new THREE.Points(starGeo, starMat);
        this.scene.add(stars);

        window.addEventListener('resize', () => this.onWindowResize());
    }

    bindEvents() {
        // Start Button
        document.getElementById('start-btn').addEventListener('click', () => {
             this.audio.init(); // Unlock AudioContext
             this.switchState('DRIVER');
        });

        // Next Phase Button in Transition
        document.getElementById('next-phase-btn').addEventListener('click', () => {
             const next = this.nextStateTarget || 'MENU';
             this.switchState(next);
        });

        // Listen for Phase completion
        window.addEventListener('phase:complete', (e) => {
             this.showTransition(e.detail.next);
        });
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    switchState(state) {
        if (this.currentScene && this.currentScene.cleanup) {
            this.currentScene.cleanup();
        }

        this.currentState = state;

        // Reset HUD state
        this.hudContainer.classList.add('hidden');
        this.introOverlay.classList.add('hidden');
        this.transitionOverlay.classList.add('hidden');

        if (state === 'MENU') {
            this.introOverlay.classList.remove('hidden');
        } else if (state === 'DRIVER') {
            this.hudContainer.classList.remove('hidden');
            this.currentScene = new DriverScene(this.scene, this.camera, this.audio);
            this.currentScene.setup();
        } else if (state === 'PEDESTRIAN') {
            this.hudContainer.classList.remove('hidden');
            this.currentScene = new PedestrianScene(this.scene, this.camera, this.audio);
            this.currentScene.setup();
        } else if (state === 'CYCLIST') {
             this.hudContainer.classList.remove('hidden');
             this.currentScene = new CyclistScene(this.scene, this.camera, this.audio);
             this.currentScene.setup();
        } else if (state === 'END') {
             this.showEndScreen();
        }
    }

    showTransition(nextState) {
        this.nextStateTarget = nextState;
        this.transitionOverlay.classList.remove('hidden');
        
        const title = document.getElementById('transition-title');
        const desc = document.getElementById('transition-desc');

        if (nextState === 'PEDESTRIAN') {
             title.innerText = "Interrupção Súbita!";
             desc.innerText = "Sua pressa ou distração gerou perigo. Agora, mude de perspectiva para ver como o cenário reage.";
        } else if (nextState === 'CYCLIST') {
             title.innerText = "A Travessia Concluída.";
             desc.innerText = "A infraestrutura prioriza a velocidade. Assuma agora o papel de um ciclista na mesma via.";
        } else {
             title.innerText = "Ciclo de Empatia Concluído.";
             desc.innerText = "O tráfego seguro não depende apenas de um papel, mas da harmonia de todos e do design da cidade.";
             document.getElementById('next-phase-btn').innerText = "Reiniciar Experiência";
             this.nextStateTarget = 'MENU';
        }
    }

    showEndScreen() {
         this.switchState('MENU'); // or show customized container
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        const deltaTime = this.clock.getDelta();

        if (this.currentScene && this.currentState !== 'MENU' && this.transitionOverlay.classList.contains('hidden')) {
            this.currentScene.update(deltaTime);
        }

        // Slow rotate ambient stars/grid if needed
        this.renderer.render(this.scene, this.camera);
    }

    start() {
        this.animate();
    }
}

// Start Game instance
const game = new Game();
game.start();

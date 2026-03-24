/**
 * Scene 1: Driver Phase (Isolation)
 */
import { AudioManager } from '../audio.js';

export class DriverScene {
    constructor(scene, camera, audioManager) {
        this.scene = scene;
        this.camera = camera;
        this.audio = audioManager;
        this.speed = 0;
        this.maxSpeed = 120;
        this.impatience = 0;
        
        // Meshes
        this.roadGrid = null;
        this.obstacles = [];
        
        // Speed Display Element
        this.speedDisplay = document.getElementById('speed-value');
        this.impatienceBar = document.getElementById('impatience-bar');
        this.phoneContainer = document.getElementById('phone-container');
        this.currentRole = document.getElementById('current-role');
        
        // Keyboard Listener
        this.keys = {};
        window.addEventListener('keydown', (e) => this.keys[e.code] = true);
        window.addEventListener('keyup', (e) => this.keys[e.code] = false);
    }

    setup() {
        // Position Camera inside Dashboard
        this.camera.position.set(0, 1.5, -3.5); // Inside looking forward
        this.camera.lookAt(0, 1.5, 0);

        this.currentRole.innerText = 'MOTORISTA (ISOLAMENTO)';
        document.getElementById('objective-text').innerText = 'Mantenha o tráfego fluindo. Não se atrase.';
        this.phoneContainer.classList.remove('hidden');

        // Create Grid Floor (Road)
        const size = 200;
        const divisions = 40;
        this.roadGrid = new THREE.GridHelper(size, divisions, 0x00f0ff, 0x00f0ff);
        this.roadGrid.position.set(0, 0, 0);
        this.scene.add(this.roadGrid);

        // Ambience Light
        const ambientLight = new THREE.AmbientLight(0x444444);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
        directionalLight.position.set(10, 10, -10);
        this.scene.add(ambientLight);
        this.scene.add(directionalLight);

        // Spawn obstacles (Cubes representing cars)
        for (let i = 0; i < 5; i++) {
            this.spawnObstacle();
        }

        // Setup Audio
        this.audio.startMotorSound();
        this.audio.setMuffled(true); // Driver is inside isolated car
    }

    spawnObstacle() {
        const geo = new THREE.BoxGeometry(2, 2, 4);
        const mat = new THREE.MeshBasicMaterial({ color: 0xff007f, wireframe: true });
        const car = new THREE.Mesh(geo, mat);
        
        // Random placement forward on Z axis
        car.position.set((Math.random() - 0.5) * 8, 1, Math.random() * 80 + 20);
        this.scene.add(car);
        this.obstacles.push(car);
    }

    update(deltaTime) {
        // Accelerate with W, Decelerate with S
        if (this.keys['ArrowUp'] || this.keys['KeyW']) {
            this.speed = Math.min(this.speed + deltaTime * 20, this.maxSpeed);
        } else if (this.keys['ArrowDown'] || this.keys['KeyS']) {
            this.speed = Math.max(this.speed - deltaTime * 40, 0);
        } else {
            // Friction
            this.speed = Math.max(this.speed - deltaTime * 10, 0);
        }

        // Steer Left/Right
        if (this.keys['ArrowLeft'] || this.keys['KeyA']) {
            this.camera.position.x -= 3 * deltaTime;
        }
        if (this.keys['ArrowRight'] || this.keys['KeyD']) {
            this.camera.position.x += 3 * deltaTime;
        }

        // Limit steering limits
        this.camera.position.x = Math.max(Math.min(this.camera.position.x, 3.5), -3.5);

        // Move Road Grid towards camera to create movement effect
        if (this.roadGrid) {
            this.roadGrid.position.z -= this.speed * 0.1 * deltaTime;
            if (this.roadGrid.position.z < -10) this.roadGrid.position.z = 0;
        }

        // Move Obstacles
        this.obstacles.forEach(car => {
            car.position.z -= (this.speed * 0.1 + 0.5) * deltaTime; // Car moves forward relative to grid
            
            // Loop car position back
            if (car.position.z < -20) {
                car.position.set((Math.random() - 0.5) * 8, 1, 80);
            }

            // Simple Collision Check
            const dist = this.camera.position.distanceTo(car.position);
            if (dist < 2.5) {
                this.triggerCrash();
            }
        });

        // Impatience rise
        this.impatience = Math.min(this.impatience + 0.1 * deltaTime, 1);
        this.impatienceBar.style.width = `${this.impatience * 100}%`;

        // Update Dashboard
        if (this.speedDisplay) {
            this.speedDisplay.innerText = Math.round(this.speed);
        }
        this.audio.adjustMotorPitch(this.speed);
    }

    triggerCrash() {
        console.log("CRASH");
        window.dispatchEvent(new CustomEvent('phase:complete', { detail: { next: 'PEDESTRIAN' } }));
    }

    cleanup() {
        this.audio.stopMotorSound();
        this.audio.setMuffled(false);
        this.obstacles.forEach(car => this.scene.remove(car));
        if (this.roadGrid) this.scene.remove(this.roadGrid);
        this.phoneContainer.classList.add('hidden');
    }
}

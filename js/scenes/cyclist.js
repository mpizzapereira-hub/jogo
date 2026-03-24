/**
 * Scene 3: Cyclist Phase (Vulnerabilidade)
 */
export class CyclistScene {
    constructor(scene, camera, audioManager) {
        this.scene = scene;
        this.camera = camera;
        this.audio = audioManager;
        this.currentRole = document.getElementById('current-role');
        this.cyclistDashboard = document.getElementById('cyclist-dashboard');
        
        this.speed = 10; // slow moving bike
        this.keys = {};
        this.obstacles = [];
        this.timeElapsed = 0;
        
        window.addEventListener('keydown', (e) => this.keys[e.code] = true);
        window.addEventListener('keyup', (e) => this.keys[e.code] = false);
    }

    setup() {
        // Perspective over-the-shoulder look
        this.camera.position.set(-2, 1.2, -4);
        this.camera.lookAt(-2, 1.2, 0);

        this.currentRole.innerText = 'CICLISTA (VULNERABILIDADE)';
        document.getElementById('objective-text').innerText = 'Desvie de obstáculos físicos e mantenha o equilíbrio.';
        
        this.cyclistDashboard.classList.remove('hidden');

        // Create Grid Floor
        const size = 200;
        const grid = new THREE.GridHelper(size, 40, 0x00f0ff, 0x00f0ff);
        grid.position.set(0, 0, 0);
        this.scene.add(grid);

        // Ambient and Directional Light
        const ambientLight = new THREE.AmbientLight(0x00ff7f, 0.3); // Greenish tone
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.4);
        directionalLight.position.set(-5, 5, 5);
        this.scene.add(ambientLight);
        this.scene.add(directionalLight);

        // Spawn Cyclo-faixa Line mesh and Obstacles
        this.spawnObstacles();

        this.audio.startHeartbeat(85); // Heart rate increases with physical activity
    }

    spawnObstacles() {
        // Create Stationary block (A parked car representing Phase 1 action)
        const blockGeo = new THREE.BoxGeometry(2.5, 2, 4);
        const blockMat = new THREE.MeshBasicMaterial({ color: 0xff3131, wireframe: true });
        const parkedCar = new THREE.Mesh(blockGeo, blockMat);
        parkedCar.position.set(-2, 1, 20); // Directly in front of Cycle lane (X=-2)
        this.scene.add(parkedCar);
        this.obstacles.push(parkedCar);

        // Text display over obstacle or log
        console.log("Spawned Parked Car Obstacle");

        // Overtaking Traffic (moving faster from back)
        for (let i = 0; i < 2; i++) {
             const carGeo = new THREE.BoxGeometry(2.5, 2, 4);
             const carMat = new THREE.MeshBasicMaterial({ color: 0xffee00, wireframe: true });
             const speeder = new THREE.Mesh(carGeo, carMat);
             speeder.position.set(2, 1, -20); // Right side (car lane)
             this.scene.add(speeder);
             this.obstacles.push(speeder);
        }
    }

    update(deltaTime) {
        this.timeElapsed += deltaTime;

        // Steer with A/D or Arrow keys
        if (this.keys['ArrowLeft'] || this.keys['KeyA']) {
            this.camera.position.x -= 3 * deltaTime;
        }
        if (this.keys['ArrowRight'] || this.keys['KeyD']) {
            this.camera.position.x += 3 * deltaTime;
        }

        // Clamp positions so they don't steer off map
        this.camera.position.x = Math.max(Math.min(this.camera.position.x, 3), -5);

        // Move Road under Cyclist
        this.obstacles.forEach(car => {
            // Speed up cars behind overtaking
            if (car.position.z < -10) {
                 car.position.z += 15 * deltaTime; // Car fast passing from back to front
            } else if (car.position.z > -10 && car.position.z < 30) {
                 car.position.z -= this.speed * deltaTime; // Cyclist moves forward relative to obstacle
            } else {
                 car.position.z = -15; // Loop overtaking car back
            }

            const dist = this.camera.position.distanceTo(car.position);
            if (dist < 2) {
                this.triggerCrash();
            }
        });

        if (this.timeElapsed >= 10) {
             window.dispatchEvent(new CustomEvent('phase:complete', { detail: { next: 'END' } }));
        }
    }

    triggerCrash() {
        window.dispatchEvent(new CustomEvent('phase:complete', { detail: { next: 'END' } }));
    }

    cleanup() {
        this.audio.stopHeartbeat();
        this.obstacles.forEach(car => this.scene.remove(car));
        this.cyclistDashboard.classList.add('hidden');
    }
}

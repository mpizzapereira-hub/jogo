/**
 * Scene 2: Pedestrian Phase (Escala Humana)
 */
export class PedestrianScene {
    constructor(scene, camera, audioManager) {
        this.scene = scene;
        this.camera = camera;
        this.audio = audioManager;
        this.currentRole = document.getElementById('current-role');
        this.cyclistDashboard = document.getElementById('cyclist-dashboard');
        
        // Speed Factors
        this.speed = 2; // slow walk
        this.traffic = [];
        this.keys = {};
        
        window.addEventListener('keydown', (e) => this.keys[e.code] = true);
        window.addEventListener('keyup', (e) => this.keys[e.code] = false);
    }

    setup() {
        // Position Camera on Ground level looking across the street
        this.camera.position.set(-10, 1, 0); // Start on one side of the street
        this.camera.lookAt(10, 1, 0);

        this.currentRole.innerText = 'PEDESTRE (VULNERABILIDADE)';
        document.getElementById('objective-text').innerText = 'Atravesse a avenida com mobilidade reduzida.';
        
        this.cyclistDashboard.classList.remove('hidden'); // Show sensor/heart rate

        // Floor Grid (Crosswalk area)
        const size = 100;
        const grid = new THREE.GridHelper(size, 20, 0x00f0ff, 0x444466);
        grid.position.set(0, 0, 0);
        this.scene.add(grid);

        // Ambient and Directional Light
        const ambientLight = new THREE.AmbientLight(0xff007f, 0.2); // Pink tone for pedestrian
        const directionalLight = new THREE.DirectionalLight(0xffffee, 0.6);
        directionalLight.position.set(0, 20, 0);
        this.scene.add(ambientLight);
        this.scene.add(directionalLight);

        // Spawn Lateral Traffic (Cars passing across)
        for(let i = 0; i < 4; i++) {
            this.spawnTrafficCar(i);
        }

        // Start High tension audio procedural
        this.audio.startHeartbeat(110); // Elevated heart rate due to traffic
    }

    spawnTrafficCar(index) {
        const geo = new THREE.BoxGeometry(3, 2, 5);
        const mat = new THREE.MeshBasicMaterial({ color: 0xffee00, wireframe: true });
        const car = new THREE.Mesh(geo, mat);
        
        // Random placement moving along Z-axis (sideway from camera)
        car.position.set((index - 2)* 4, 1, Math.random() * 50 - 25);
        this.scene.add(car);
        this.traffic.push(car);
    }

    update(deltaTime) {
        // Move Pedestrian (Crosswalk cross is along X, strafe is along Z)
        if (this.keys['ArrowUp'] || this.keys['KeyW']) {
            this.camera.position.x += this.speed * deltaTime;
        } else if (this.keys['ArrowDown'] || this.keys['KeyS']) {
            this.camera.position.x -= this.speed * deltaTime;
        }

        if (this.keys['ArrowLeft'] || this.keys['KeyA']) {
            this.camera.position.z += this.speed * deltaTime; // Left
        } else if (this.keys['ArrowRight'] || this.keys['KeyD']) {
            this.camera.position.z -= this.speed * deltaTime; // Right
        }

        // Move Traffic (Along Z-Axis)
        this.traffic.forEach(car => {
            car.position.z += 15 * deltaTime; // Car moves forward
            if (car.position.z > 25) {
                car.position.z = -25;
            }

            // Collision Check
            const dist = this.camera.position.distanceTo(car.position);
            if (dist < 2) {
                this.triggerCrash();
            }
        });

        // Trigger finish if cross over
        if (this.camera.position.x > 10) {
             window.dispatchEvent(new CustomEvent('phase:complete', { detail: { next: 'CYCLIST' } }));
        }
    }

    triggerCrash() {
         window.dispatchEvent(new CustomEvent('phase:complete', { detail: { next: 'CYCLIST' } }));
    }

    cleanup() {
        this.audio.stopHeartbeat();
        this.traffic.forEach(car => this.scene.remove(car));
        this.cyclistDashboard.classList.add('hidden');
    }
}

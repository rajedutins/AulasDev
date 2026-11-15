import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { gsap } from 'gsap';
import { colors } from '../data/index.js';

const base = import.meta.env.BASE_URL;
const textures = new Map();
const loader = new THREE.TextureLoader();

async function loadTexture(id) {
    if (!textures.has(id)) {
        textures.set(id, loader.loadAsync(`${base}images/${id}.svg`).then(texture => {
            texture.colorSpace = THREE.SRGBColorSpace;
            return texture;
        }).catch(error => { textures.delete(id); throw error; }));
    }
    return textures.get(id);
}

export class Arena {
    constructor(container) {
        this.container = container;
        this.effects = true;
        this.fighters = [];
        this.tweens = new Set();
        this.version = 0;
        try {
            this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
            this.renderer.setPixelRatio(Math.min(devicePixelRatio, 1.7));
            this.renderer.outputColorSpace = THREE.SRGBColorSpace;
            container.append(this.renderer.domElement);
            this.scene = new THREE.Scene();
            this.scene.fog = new THREE.FogExp2('#081126', 0.032);
            this.camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
            this.camera.position.set(0, 4.3, 11);
            this.controls = new OrbitControls(this.camera, this.renderer.domElement);
            this.controls.target.set(0, 1.2, 0);
            this.controls.enablePan = false;
            this.controls.enableDamping = true;
            this.controls.minDistance = 7; this.controls.maxDistance = 16;
            this.controls.maxPolarAngle = Math.PI / 2.1;
            this.controls.minAzimuthAngle = -Math.PI / 3;
            this.controls.maxAzimuthAngle = Math.PI / 3;
            this.scene.add(new THREE.AmbientLight('#9baaff', 2));
            const light = new THREE.PointLight('#45ceff', 80, 30); light.position.set(0, 6, 2); this.scene.add(light);
            this.flash = new THREE.PointLight('#ff5b9c', 0, 12); this.flash.position.set(0, 3, 1); this.scene.add(this.flash);
            const floor = new THREE.Mesh(new THREE.CylinderGeometry(5.7, 6, 0.35, 64), new THREE.MeshStandardMaterial({ color: '#172941', metalness: 0.7, roughness: 0.4 }));
            floor.position.y = -0.2; this.scene.add(floor);
            for (const radius of [2.2, 4.7, 5.6]) {
                const ring = new THREE.Mesh(new THREE.TorusGeometry(radius, 0.025, 8, 96), new THREE.MeshBasicMaterial({ color: radius === 2.2 ? '#df64fb' : '#42caff' }));
                ring.rotation.x = Math.PI / 2; ring.position.y = 0.02; this.scene.add(ring);
            }
            const grid = new THREE.GridHelper(70, 50, '#1c446a', '#11213a'); grid.position.y = -0.4; this.scene.add(grid);
            for (let i = 0; i < 16; i++) {
                const tower = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1 + i % 4, 0.12), new THREE.MeshBasicMaterial({ color: i % 2 ? '#4e58af' : '#26799b' }));
                const angle = i / 16 * Math.PI * 2;
                tower.position.set(Math.sin(angle) * 8, 0.5, Math.cos(angle) * 8);
                this.scene.add(tower);
            }
            this.observer = new ResizeObserver(() => this.resize()); this.observer.observe(container);
            this.resize();
            this.clock = new THREE.Clock();
            this.renderer.setAnimationLoop(() => {
                if (!this.active || document.hidden) return;
                const time = this.clock.getElapsedTime();
                this.fighters.forEach((sprite, index) => {
                    sprite.quaternion.copy(this.camera.quaternion);
                    if (!sprite.userData.animating && this.effects) sprite.position.y = 1.65 + Math.sin(time * 2 + index) * 0.06;
                });
                this.controls.update();
                this.renderer.render(this.scene, this.camera);
            });
        } catch {
            this.failed = true;
            if (this.renderer) this.renderer.dispose();
            container.innerHTML = '<p class="webgl-note">3D indisponível neste dispositivo. A batalha continua com ilustrações 2D.</p><div class="fallback-fighters"></div>';
        }
    }

    resize() {
        if (this.failed) return;
        const width = this.container.clientWidth, height = this.container.clientHeight;
        if (!width || !height) return;
        this.renderer.setSize(width, height);
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
    }

    async setFighters(ids) {
        const version = ++this.version;
        this.active = true;
        if (this.failed) {
            this.container.querySelector('.fallback-fighters').innerHTML = ids.map(id => `<img src="${base}images/${id}.svg" alt="Ilustração estilizada de ${id}">`).join('');
            return;
        }
        this.fighters.forEach(sprite => {
            gsap.killTweensOf(sprite.position); gsap.killTweensOf(sprite.rotation); gsap.killTweensOf(sprite.scale);
            this.scene.remove(sprite); sprite.geometry.dispose(); sprite.material.dispose();
        });
        this.fighters = [];
        try {
            const maps = await Promise.all(ids.map(loadTexture));
            if (version !== this.version) return;
            maps.forEach((map, index) => {
                const sprite = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 3.4), new THREE.MeshBasicMaterial({ map, transparent: true, depthWrite: false, side: THREE.DoubleSide }));
                sprite.position.set(index ? 2.3 : -2.3, 1.65, 0);
                this.scene.add(sprite); this.fighters.push(sprite);
            });
            this.camera.position.set(0, 4.3, 11);
            this.controls.target.set(0, 1.2, 0);
            // Cache limitado aos dois personagens visíveis.
            for (const [id, promise] of textures) if (!ids.includes(id)) {
                promise.then(texture => texture.dispose()); textures.delete(id);
            }
            this.resize();
            this.container.dataset.ready = 'true';
        } catch {
            this.container.insertAdjacentHTML('beforeend', '<p class="asset-error">Uma ilustração não pôde ser carregada. A batalha continua disponível.</p>');
        }
    }

    async animate(event) {
        if (this.failed || !this.fighters.length || !this.effects) return;
        const actor = this.fighters[event.actor], target = this.fighters[event.target];
        if (event.kind === 'attack' && actor && target) {
            actor.userData.animating = true;
            const original = actor.position.x;
            const color = colors[event.type] || '#fff';
            this.flash.color.set(color); this.flash.intensity = 25;
            await gsap.to(actor.position, { x: original + (event.actor ? -0.7 : 0.7), duration: 0.15, yoyo: true, repeat: 1 });
            actor.userData.animating = false;
            const particles = [];
            const geometry = event.type === 'Ice' || event.type === 'Dragon'
                ? new THREE.OctahedronGeometry(0.1)
                : event.type === 'Ground' || event.type === 'Steel'
                    ? new THREE.BoxGeometry(0.12, 0.12, 0.12)
                    : event.type === 'Fire' ? new THREE.ConeGeometry(0.07, 0.3, 5)
                        : event.type === 'Electric' ? new THREE.BoxGeometry(0.025, 0.45, 0.025)
                            : new THREE.SphereGeometry(event.type === 'Ghost' ? 0.15 : 0.08, 6, 6);
            const material = new THREE.MeshBasicMaterial({ color, transparent: event.type === 'Ghost', opacity: event.type === 'Ghost' ? 0.45 : 1 });
            const waveGeometry = new THREE.TorusGeometry(0.4, 0.025, 5, 32);
            const waveMaterial = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.8 });
            const wave = new THREE.Mesh(waveGeometry, waveMaterial);
            wave.position.copy(target.position); wave.position.z = 0.3;
            this.scene.add(wave);
            gsap.to(wave.scale, { x: 4, y: 4, z: 4, duration: 0.55 });
            gsap.to(waveMaterial, { opacity: 0, duration: 0.55 });
            const cameraX = this.camera.position.x;
            gsap.to(this.camera.position, { x: cameraX + (event.actor ? -0.12 : 0.12), duration: 0.07, yoyo: true, repeat: 3 });
            for (let i = 0; i < 22; i++) {
                const particle = new THREE.Mesh(geometry, material);
                particle.position.copy(target.position); particle.position.z = 0.4;
                this.scene.add(particle); particles.push(particle);
                gsap.to(particle.position, { x: target.position.x + (Math.random() - 0.5) * 2.5, y: Math.random() * 3.8, z: Math.random() * 2, duration: 0.5 });
            }
            const start = target.position.x;
            await gsap.to(target.position, { x: start + 0.15, duration: 0.055, yoyo: true, repeat: 5 });
            await gsap.to(this.flash, { intensity: 0, duration: 0.2 });
            particles.forEach(p => { gsap.killTweensOf(p.position); this.scene.remove(p); });
            geometry.dispose(); material.dispose();
            gsap.killTweensOf(wave.scale); gsap.killTweensOf(waveMaterial);
            this.scene.remove(wave); waveGeometry.dispose(); waveMaterial.dispose();
        }
        if (event.kind === 'finish') {
            for (let index = 0; index < this.fighters.length; index++) {
                const sprite = this.fighters[index]; sprite.userData.animating = true;
                if (event.winner === index) await gsap.to(sprite.scale, { x: 1.18, y: 1.18, duration: 0.35, yoyo: true, repeat: 1 });
                else await gsap.to(sprite.position, { y: -1.3, duration: 0.45 });
            }
        }
    }

    pause() { this.active = false; }
}

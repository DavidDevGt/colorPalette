import './components/ColorPaletteComponent';
import * as THREE from 'three';
import ThreeJSConfig, { ThreeJSOptions } from './ThreeJSConfig';
import { initializeGlobalParticleAttributes, createExplosionAttributes } from './utils/particles';
import { getMousePosition } from './utils/threeUtils';

document.addEventListener('DOMContentLoaded', () => {
    console.log('Color Palette Generator initialized');
    initBackground();
});

/**
 * Configura y crea la escena Three.js junto con la cámara, el renderizador y el canvas.
 *
 * Se pueden personalizar aspectos como el campo de visión, distancias de renderizado, color de fondo,
 * antialiasing, pixel ratio y preferencia de potencia mediante el parámetro de opciones.
 *
 * @param {Element} heroSection - Elemento contenedor donde se insertará el canvas.
 * @param {ThreeJSOptions} [options] - Opciones de configuración adicionales para la escena.
 *
 * @returns {ThreeJSConfig} Objeto que contiene la escena, la cámara, el renderizador y el canvas.
 */
function createThreeJSConfig(heroSection: Element, options?: ThreeJSOptions): ThreeJSConfig {
    const canvas = document.createElement('canvas');
    canvas.classList.add('threejs-bg');
    heroSection.appendChild(canvas);

    const width = heroSection.clientWidth;
    const height = heroSection.clientHeight;

    const fieldOfView = options?.fieldOfView ?? 75;
    const near = options?.near ?? 0.1;
    const far = options?.far ?? 100;
    const antialias = options?.antialias ?? true;
    const powerPreference = options?.powerPreference ?? 'high-performance';
    const pixelRatio = options?.pixelRatio ?? Math.min(window.devicePixelRatio, 2);

    const scene = new THREE.Scene();

    if (options?.backgroundColor !== undefined) {
        scene.background = new THREE.Color(options.backgroundColor);
    }

    const camera = new THREE.PerspectiveCamera(fieldOfView, width / height, near, far);
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias,
        powerPreference
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(pixelRatio);

    return { scene, camera, renderer, canvas };
}

interface Explosion {
    update: () => boolean;
    dispose: () => void;
}

function initBackground() {
    const heroSection = document.querySelector('.hero');
    if (!heroSection) return;

    const { scene, camera, renderer, canvas } = createThreeJSConfig(heroSection, {
        fieldOfView: 75,
        near: 0.1,
        far: 100,
        antialias: true,
        powerPreference: 'high-performance'
    });
    const width = heroSection.clientWidth;
    const height = heroSection.clientHeight;

    let mouseX = 0,
        mouseY = 0;
    let targetX = 0,
        targetY = 0;
    let windowHalfX = width / 2;
    let windowHalfY = height / 2;

    const particlesCount = navigator.userAgent.match(/Mobile|Android|iPhone/i) ? 250 : 500;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particlesCount * 3);
    const colors = new Float32Array(particlesCount * 3);
    const sizes = new Float32Array(particlesCount);
    const mainVelocities = new Float32Array(particlesCount * 3);

    const colorPalette = [
        new THREE.Color(0x6366F1),
        new THREE.Color(0x8B5CF6),
        new THREE.Color(0xEC4899),
        new THREE.Color(0x3B82F6),
        new THREE.Color(0x10B981),
        new THREE.Color(0xF59E0B)
    ];
    const particleVertexShader = `
    attribute float size;
    attribute vec3 color;
    varying vec3 vParticleColor;
    
    void main() {
        vParticleColor = color;
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = max(1.0, size * (300.0 / -mvPosition.z));
        gl_Position = projectionMatrix * mvPosition;
    }
  `;

    const particleFragmentShader = `
    varying vec3 vParticleColor;
    
    void main() {
        float dist = length(gl_PointCoord - vec2(0.5));
        float alpha = 1.0 - smoothstep(0.4, 0.5, dist);
        if (alpha <= 0.0) discard;
        gl_FragColor = vec4(vParticleColor, alpha);
    }
  `;

    class ParticleExplosion implements Explosion {
        private particleCount: number;
        private geometry: THREE.BufferGeometry;
        private positions: Float32Array;
        private velocities: Float32Array;
        private life: number;
        private points: THREE.Points;
        private material: THREE.ShaderMaterial;
        private decayRate: number;

        constructor(position: THREE.Vector3, color: THREE.Color, particleCount = 50, decayRate = 0.02) {
            this.particleCount = particleCount;
            this.geometry = new THREE.BufferGeometry();
            const explosionAttributes = createExplosionAttributes(this.particleCount, position);
            this.positions = explosionAttributes.positions;
            this.velocities = explosionAttributes.velocities;
            this.life = 1.0;
            this.decayRate = decayRate;

            this.geometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));

            this.material = new THREE.ShaderMaterial({
                vertexShader: `
                    uniform float life;
                    void main() {
                        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                        gl_PointSize = (2.5 * life) * (300.0 / -mvPosition.z);
                        gl_Position = projectionMatrix * mvPosition;
                    }
                `,
                fragmentShader: `
                    uniform vec3 color;
                    uniform float life;
                    void main() {
                        float dist = length(gl_PointCoord - vec2(0.5));
                        if (dist > 0.5) discard;
                        float glow = smoothstep(0.5, 0.0, dist);
                        gl_FragColor = vec4(color, life * glow);
                    }
                `,
                uniforms: {
                    color: { value: new THREE.Color(color) },
                    life: { value: 1.0 }
                },
                transparent: true,
                blending: THREE.AdditiveBlending,
                depthWrite: false
            });

            this.points = new THREE.Points(this.geometry, this.material);
            scene.add(this.points);
        }

        update(): boolean {
            this.life -= this.decayRate;
            this.material.uniforms.life.value = this.life;

            for (let i = 0; i < this.particleCount; i++) {
                const i3 = i * 3;
                this.positions[i3] += this.velocities[i3];
                this.positions[i3 + 1] += this.velocities[i3 + 1];
                this.positions[i3 + 2] += this.velocities[i3 + 2];

                this.velocities[i3 + 1] -= 0.0015;

                this.velocities[i3] *= 0.98;
                this.velocities[i3 + 1] *= 0.98;
                this.velocities[i3 + 2] *= 0.98;
            }

            this.geometry.attributes.position.needsUpdate = true;

            if (this.life <= 0) {
                this.dispose();
                return false;
            }
            return true;
        }

        dispose(): void {
            scene.remove(this.points);
            this.geometry.dispose();
            this.material.dispose();
        }
    }

    let explosions: Explosion[] = [];

    // Inicialización de las partículas globales utilizando la función auxiliar
    initializeGlobalParticleAttributes(particlesCount, positions, colors, sizes, mainVelocities, colorPalette);
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const material = new THREE.ShaderMaterial({
        vertexShader: particleVertexShader,
        fragmentShader: particleFragmentShader,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    const movementSpeed = 0.05;
    const rotationSpeed = 0.0003;
    const clock = new THREE.Clock();

    function animate() {
        requestAnimationFrame(animate);

        const delta = Math.min(clock.getDelta(), 0.1);
        const time = clock.getElapsedTime();

        targetX = (mouseX - windowHalfX) * 0.001;
        targetY = (mouseY - windowHalfY) * 0.001;

        points.rotation.y += (targetX - points.rotation.y) * movementSpeed;
        points.rotation.x += (targetY - points.rotation.x) * movementSpeed;

        points.rotation.y += rotationSpeed * delta * 60; //60fps

        updateParticles(time, delta);
        explosions = explosions.filter((explosion) => explosion.update());

        renderer.render(scene, camera);
    }

    function updateParticles(time: number, delta: number) {
        const timeScale = delta * 60; // 60fps

        for (let i = 0; i < particlesCount; i++) {
            const i3 = i * 3;
            const factor = 0.5 * timeScale;
            positions[i3] += Math.sin(time * 0.7 + positions[i3 + 1]) * 0.01 * factor;
            positions[i3 + 1] += Math.cos(time * 0.8 + positions[i3]) * 0.01 * factor;
            positions[i3 + 2] += Math.sin(time * 0.9 + positions[i3 + 2]) * 0.01 * factor;

            positions[i3] += mainVelocities[i3];
            positions[i3 + 1] += mainVelocities[i3 + 1];
            positions[i3 + 2] += mainVelocities[i3 + 2];

            const drag = Math.pow(0.98, timeScale);
            mainVelocities[i3] *= drag;
            mainVelocities[i3 + 1] *= drag;
            mainVelocities[i3 + 2] *= drag;
        }

        geometry.attributes.position.needsUpdate = true;
    }

    clock.start();
    animate();

    heroSection.addEventListener('click', (event: Event) => {
        const mouseEvent = event as MouseEvent;
        const clickPosition = getMousePosition(mouseEvent, canvas, camera);
        const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];

        const particleCount = Math.floor(Math.random() * 30) + 50;
        const decayRate = 0.01 + Math.random() * 0.01;
        explosions.push(new ParticleExplosion(clickPosition, color, particleCount, decayRate));

        const threshold = 2.0; // Radio de influencia aumentado
        const impulse = 0.08; // Impulso más fuerte

        for (let i = 0; i < particlesCount; i++) {
            const i3 = i * 3;
            const particlePos = new THREE.Vector3(positions[i3], positions[i3 + 1], positions[i3 + 2]);
            const distance = particlePos.distanceTo(clickPosition);

            if (distance < threshold) {
                const direction = particlePos.clone().sub(clickPosition).normalize();
                const factor = impulse * Math.pow(1 - distance / threshold, 2);

                mainVelocities[i3] += direction.x * factor;
                mainVelocities[i3 + 1] += direction.y * factor;
                mainVelocities[i3 + 2] += direction.z * factor;
            }
        }
    });

    const handleMouseMove = (event: Event) => {
        const mouseEvent = event as MouseEvent;
        mouseX = mouseEvent.clientX;
        mouseY = mouseEvent.clientY;
    };

    heroSection.addEventListener('mousemove', handleMouseMove as EventListener);

    heroSection.addEventListener(
        'touchmove',
        ((event: Event) => {
            const touchEvent = event as TouchEvent;
            if (touchEvent.touches.length > 0) {
                mouseX = touchEvent.touches[0].clientX;
                mouseY = touchEvent.touches[0].clientY;
            }
        }) as EventListener
    );

    let resizeTimeout: number | null = null;
    const handleResize = () => {
        if (resizeTimeout) return;

        resizeTimeout = window.setTimeout(() => {
            const newWidth = heroSection.clientWidth;
            const newHeight = heroSection.clientHeight;

            camera.aspect = newWidth / newHeight;
            camera.updateProjectionMatrix();

            renderer.setSize(newWidth, newHeight);

            windowHalfX = newWidth / 2;
            windowHalfY = newHeight / 2;

            resizeTimeout = null;
        }, 100);
    };

    window.addEventListener('resize', handleResize);

    return function cleanup() {
        window.removeEventListener('resize', handleResize);
        heroSection.removeEventListener('mousemove', handleMouseMove as EventListener);

        geometry.dispose();
        material.dispose();
        renderer.dispose();

        explosions.forEach((explosion) => {
            explosion.dispose();
        });

        if (canvas.parentNode) {
            canvas.parentNode.removeChild(canvas);
        }
    };
}

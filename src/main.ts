import './components/ColorPaletteComponent';
import * as THREE from 'three';

document.addEventListener('DOMContentLoaded', () => {
    console.log('Color Palette Generator initialized');
    initBackground();
});

function initBackground() {
    const heroSection = document.querySelector('.hero');
    if (!heroSection) return;

    const canvas = document.createElement('canvas');
    canvas.classList.add('threejs-bg');
    heroSection.appendChild(canvas);

    const width = heroSection.clientWidth;
    const height = heroSection.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 100);
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ 
        canvas, 
        alpha: true,
        antialias: true // Mejora la calidad visual
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Aumentamos el número de partículas
    const particlesCount = 500;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particlesCount * 3);
    const colors = new Float32Array(particlesCount * 3);
    const sizes = new Float32Array(particlesCount);

    const colorPalette = [
        new THREE.Color(0x6366F1),
        new THREE.Color(0x8B5CF6),
        new THREE.Color(0xEC4899),
        new THREE.Color(0x3B82F6)
    ];

    for (let i = 0; i < particlesCount; i++) {
        const i3 = i * 3;
        // Distribución esférica de partículas
        const radius = Math.random() * 5;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;

        positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
        positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
        positions[i3 + 2] = radius * Math.cos(phi);

        // Color aleatorio del palette
        const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
        colors[i3] = color.r;
        colors[i3 + 1] = color.g;
        colors[i3 + 2] = color.b;

        // Tamaños variables
        sizes[i] = Math.random() * 0.2 + 0.05;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    // Shader material personalizado
    const material = new THREE.ShaderMaterial({
        vertexShader: `
            attribute float size;
            attribute vec3 color;
            varying vec3 vColor;
            
            void main() {
                vColor = color;
                vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                gl_PointSize = size * (300.0 / -mvPosition.z);
                gl_Position = projectionMatrix * mvPosition;
            }
        `,
        fragmentShader: `
            varying vec3 vColor;
            
            void main() {
                float dist = length(gl_PointCoord - vec2(0.5));
                if (dist > 0.5) discard;
                
                float strength = 1.0 - (dist * 2.0);
                gl_FragColor = vec4(vColor, strength);
            }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    let mouseX = 0, mouseY = 0;
    let targetX = 0, targetY = 0;
    const windowHalfX = width / 2;
    const windowHalfY = height / 2;
    
    const movementSpeed = 0.05;
    const rotationSpeed = 0.0005;

    function animate(time: number): void {
        requestAnimationFrame(animate);

        targetX = (mouseX - windowHalfX) * 0.001;
        targetY = (mouseY - windowHalfY) * 0.001;

        points.rotation.y += (targetX - points.rotation.y) * movementSpeed;
        points.rotation.x += (targetY - points.rotation.x) * movementSpeed;

        points.rotation.y += rotationSpeed;

        // Movimiento ondulatorio
        const positions = geometry.attributes.position.array as Float32Array;
        const time_value = time * 0.001;

        for (let i = 0; i < particlesCount; i++) {
            const i3 = i * 3;
            const x = positions[i3];
            const y = positions[i3 + 1];
            const z = positions[i3 + 2];

            // Aplicar movimiento ondulatorio
            positions[i3] = x + Math.sin(time_value + y) * 0.01;
            positions[i3 + 1] = y + Math.cos(time_value + x) * 0.01;
            positions[i3 + 2] = z + Math.sin(time_value + z) * 0.01;
        }

        geometry.attributes.position.needsUpdate = true;
        renderer.render(scene, camera);
    }

    animate(0);

    heroSection.addEventListener('mousemove', (event: Event) => {
        const mouseEvent = event as MouseEvent;
        mouseX = mouseEvent.clientX;
        mouseY = mouseEvent.clientY;
    });

    window.addEventListener('resize', () => {
        const newWidth = heroSection.clientWidth;
        const newHeight = heroSection.clientHeight;
        
        camera.aspect = newWidth / newHeight;
        camera.updateProjectionMatrix();
        
        renderer.setSize(newWidth, newHeight);
    });
}
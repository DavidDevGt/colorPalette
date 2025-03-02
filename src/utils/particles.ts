import * as THREE from 'three';

/**
 * Inicia los atributos globales para las partículas
 *
 * Configura las posiciones, colores, tamaños y velocidades principales
 * para un conjunto de partículas, utilizando una paleta de colores proporcionada
 *
 * @param {number} particlesCount - Cantidad total de partículas a inicializar
 * @param {Float32Array} positions - Array que contendrá las posiciones (x, y, z) de cada partícula
 * @param {Float32Array} colors - Array que contendrá los valores RGB para cada partícula
 * @param {Float32Array} sizes - Array que contendrá el tamaño de cada partícula
 * @param {Float32Array} mainVelocities - Array que contendrá las velocidades principales (x, y, z) de cada partícula
 * @param {THREE.Color[]} colorPalette - Paleta de colores a utilizar para asignar aleatoriamente el color de cada partícula
 *
 * @returns {void}
 */
export function initializeGlobalParticleAttributes(
    particlesCount: number,
    positions: Float32Array,
    colors: Float32Array,
    sizes: Float32Array,
    mainVelocities: Float32Array,
    colorPalette: THREE.Color[]
): void {
    for (let i = 0; i < particlesCount; i++) {
        const i3 = i * 3;
        const radius = Math.random() * 5;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);

        positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
        positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
        positions[i3 + 2] = radius * Math.cos(phi);

        const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
        colors[i3] = color.r;
        colors[i3 + 1] = color.g;
        colors[i3 + 2] = color.b;

        sizes[i] = Math.random() * 0.3 + 0.05;

        mainVelocities[i3] = 0;
        mainVelocities[i3 + 1] = 0;
        mainVelocities[i3 + 2] = 0;
    }
}

/**
 * Crea y configura los atributos para las partículas de una explosión
 *
 * Genera un conjunto de partículas para una explosión, asignándoles una
 * posición inicial basada en el vector dado y calculando velocidades aleatorias para cada partícula
 *
 * @param {number} particleCount - Cantidad de partículas que compondrán la explosión
 * @param {THREE.Vector3} position - Posición central de la explosión
 *
 * @returns {{ positions: Float32Array; velocities: Float32Array }} Un objeto que contiene:
 *  - `positions`: Array de posiciones iniciales para cada partícula.
 *  - `velocities`: Array de velocidades iniciales para cada partícula.
 */
export function createExplosionAttributes(
    particleCount: number,
    position: THREE.Vector3
): { positions: Float32Array; velocities: Float32Array } {
    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        positions[i3] = position.x;
        positions[i3 + 1] = position.y;
        positions[i3 + 2] = position.z;

        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const speed = 0.05 + Math.random() * 0.1;

        velocities[i3] = Math.sin(phi) * Math.cos(theta) * speed;
        velocities[i3 + 1] = Math.sin(phi) * Math.sin(theta) * speed;
        velocities[i3 + 2] = Math.cos(phi) * speed;
    }
    return { positions, velocities };
}

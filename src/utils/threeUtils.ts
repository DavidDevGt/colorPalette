import * as THREE from 'three';

/**
 * Calcula la posición del ratón en coordenadas del mundo de Three.js
 *
 * Convierte la posición del evento del ratón (o touch) en coordenadas normalizadas
 * y luego en coordenadas de mundo, utilizando la cámara y el lienzo (canvas) especificados
 *
 * @param {MouseEvent} event - El evento del ratón del cual se obtienen las coordenadas
 * @param {HTMLCanvasElement} canvas - El elemento canvas donde se renderiza la escena
 * @param {THREE.Camera} camera - La cámara de Three.js utilizada para proyectar las coordenadas
 *
 * @returns {THREE.Vector3} La posición calculada en coordenadas de mundo
 */
export function getMousePosition(
    event: MouseEvent,
    canvas: HTMLCanvasElement,
    camera: THREE.Camera
): THREE.Vector3 {
    const rect = canvas.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    const vector = new THREE.Vector3(x, y, 0.5);
    vector.unproject(camera);

    const dir = vector.sub(camera.position).normalize();
    const distance = -camera.position.z / dir.z;
    return camera.position.clone().add(dir.multiplyScalar(distance));
}

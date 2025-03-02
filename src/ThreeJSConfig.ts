import * as THREE from 'three';

/** Opciones para la configuración de Three.js. */
export interface ThreeJSOptions {
    /** Campo de visión de la cámara (FOV). Por defecto es 75. */
    fieldOfView?: number;
    /** Distancia mínima de renderizado. Por defecto es 0.1. */
    near?: number;
    /** Distancia máxima de renderizado. Por defecto es 100. */
    far?: number;
    /** Color de fondo de la escena, en formato hexadecimal (sin el `#`). Opcional. */
    backgroundColor?: number;
    /** Indica si se debe usar antialias. Por defecto es `true`. */
    antialias?: boolean;
    /** Pixel ratio máximo a usar. Por defecto se usa `Math.min(window.devicePixelRatio, 2)`. */
    pixelRatio?: number;
    /** Preferencia de potencia para el renderizador WebGL. Por defecto es `'high-performance'`. */
    powerPreference?: WebGLPowerPreference;
}

/**
 * Config Three.js
 */
export interface ThreeJSConfig {
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    canvas: HTMLCanvasElement;
}

export default ThreeJSConfig;

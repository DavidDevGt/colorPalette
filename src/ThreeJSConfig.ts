import * as THREE from 'three';

export interface ThreeJSConfig {
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    canvas: HTMLCanvasElement;
}

export default ThreeJSConfig;
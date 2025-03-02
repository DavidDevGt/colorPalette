import chroma from 'chroma-js';

/**
 * Representa un color con varios formatos y un estado de bloqueo.
 */
export interface Color {
    /** Valor del color en formato hexadecimal (por ejemplo, "#FFFFFF"). */
    hex: string;
    /** Valor del color en formato RGB (por ejemplo, "rgb(255, 255, 255)"). */
    rgb: string;
    /** Valor del color en formato HSL (por ejemplo, "hsl(0, 0%, 100%)"). */
    hsl: string;
    /** Indica si el color se encuentra bloqueado para evitar su cambio. */
    locked: boolean;
}

/**
 * Representa la funcionalidad de una paleta de colores.
 */
export interface ColorPalette {
    /**
     * Arreglo de colores que componen la paleta.
     */
    colors: Color[];

    /**
     * Genera una nueva paleta de colores aleatorios.
     * 
     * @returns {void}
     */
    generatePalette: () => void;

    /**
     * Bloquea o desbloquea un color en la paleta.
     * 
     * @param {number} index - Índice del color a bloquear/desbloquear.
     * @returns {void}
     */
    lockColor: (index: number) => void;

    /**
     * Actualiza el tamaño de la paleta de colores.
     * 
     * @param {number} newSize - El nuevo tamaño de la paleta
     * @returns {void}
     */
    updatePaletteSize: (newSize: number) => void;
}

/**
 * Servicio que implementa la generación y manipulación de una paleta de colores
 */
export class ColorPaletteService implements ColorPalette {
    /**
     * Arreglo de colores que componen la paleta
     */
    public colors: Color[] = [];

    /**
     * Crea una instancia de ColorPaletteService.
     *
     * @param {number} [size=6] - Tamaño inicial de la paleta de colores
     */
    constructor(private size: number = 6) {
        this.generatePalette();
    }

    /**
     * Genera una nueva paleta de colores aleatorios.
     * Si un color se encuentra bloqueado, este permanecerá sin cambios.
     * 
     * @returns {void}
     */
    public generatePalette(): void {
        const updatedColors: Color[] = [];

        for (let i = 0; i < this.size; i++) {
            if (this.colors[i]?.locked) {
                updatedColors.push(this.colors[i]);
            } else {
                updatedColors.push(this.createRandomColor());
            }
        }

        this.colors = updatedColors;
    }

    /**
     * Bloquea o desbloquea un color para evitar que cambie en la próxima generación.
     * 
     * @param {number} index - Índice del color a bloquear/desbloquear.
     * @returns {void}
     */
    public lockColor(index: number): void {
        if (index >= 0 && index < this.colors.length) {
            this.colors[index].locked = !this.colors[index].locked;
        }
    }

    /**
     * Actualiza el tamaño de la paleta de colores.
     * Aumenta o reduce la cantidad de colores en la paleta según sea necesario.
     * 
     * @param {number} newSize - El nuevo tamaño de la paleta.
     * @returns {void}
     */
    public updatePaletteSize(newSize: number): void {
        this.size = newSize;

        while (this.colors.length < this.size) {
            this.colors.push(this.createRandomColor());
        }

        if (this.colors.length > this.size) {
            this.colors = this.colors.slice(0, this.size);
        }
    }

    /**
     * Crea un color aleatorio en diferentes formatos (hex, rgb, hsl).
     * 
     * @private
     * @returns {Color} - Un objeto que representa el color generado.
     */
    private createRandomColor(): Color {
        const randomChroma = chroma.random();

        return {
            hex: randomChroma.hex(),
            rgb: randomChroma.css(),
            hsl: `hsl(${randomChroma.hsl()[0].toFixed(0)}, ${(
                randomChroma.hsl()[1] * 100
            ).toFixed(0)}%, ${(randomChroma.hsl()[2] * 100).toFixed(0)}%)`,
            locked: false
        };
    }
}

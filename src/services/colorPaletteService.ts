import chroma from 'chroma-js';

export interface Color {
    hex: string;
    rgb: string;
    hsl: string;
    locked: boolean;
}

export interface ColorPalette {
    colors: Color[];
    generatePalette: () => void;
    lockColor: (index: number) => void;
    updatePaletteSize: (newSize: number) => void;
}

export class ColorPaletteService implements ColorPalette {
    colors: Color[] = [];

    constructor(private size: number = 6) {
        this.generatePalette();
    }

    /**
     * Genera una nueva paleta de colores aleatorios
     */
    generatePalette(): void {
        const newColors = [];
    
        for (let i = 0; i < this.size; i++) {
            if (this.colors[i] && this.colors[i].locked) {
                newColors.push(this.colors[i]);
            } else {
                newColors.push(this.createRandomColor());
            }
        }
    
        this.colors = newColors;
    }
    
    /**
     * Bloquea/desbloquea un color para evitar que cambie en la próxima generación
     */
    lockColor(index: number): void {
        if (index >= 0 && index < this.colors.length) {
            this.colors[index].locked = !this.colors[index].locked;
        }
    }
    
    /**
     * Actualiza el tamaño de la paleta de colores
     */
    updatePaletteSize(newSize: number): void {
        this.size = newSize;
        
        while (this.colors.length < this.size) {
            this.colors.push(this.createRandomColor());
        }
        
        if (this.colors.length > this.size) {
            this.colors = this.colors.slice(0, this.size);
        }
    }

    /**
     * Crea un color aleatorio en varios formatos
     */
    private createRandomColor(): Color {
        const color = chroma.random();
        return {
            hex: color.hex(),
            rgb: color.css(),
            hsl: `hsl(${color.hsl()[0].toFixed(0)}, ${(
                color.hsl()[1] * 100
            ).toFixed(0)}%, ${(color.hsl()[2] * 100).toFixed(0)}%)`,
            locked: false
        };
    }
}
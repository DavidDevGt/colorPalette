import { ColorPaletteService } from '../services/colorPaletteService';
import { copyToClipboard } from '../utils/clipboard';
import { ColorInfo } from '../types/color';
export class ColorPaletteComponent extends HTMLElement {
    static get observedAttributes() {
        return ['palette-size'];
    }
    private colorService!: ColorPaletteService;
    private paletteSize: number = 6;
    private elements: {
        paletteContainer: HTMLElement | null;
        generateButton: HTMLElement | null;
        exportButton: HTMLElement | null;
        copyNotice: HTMLElement | null;
        paletteSizeInput: HTMLInputElement | null;
    } = {
            paletteSizeInput: null,
            paletteContainer: null,
            generateButton: null,
            exportButton: null,
            copyNotice: null,
        };
    private static readonly LOCKED_CLASS = 'locked';
    private static readonly UNLOCKED_CLASS = 'unlocked';
    private static readonly ACTIVE_CLASS = 'active';
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }
    connectedCallback() {
        this.initAttributes();
        this.colorService = new ColorPaletteService(this.paletteSize);
        this.render();
        this.cacheElements();
        this.setupEventListeners();
    }
    disconnectedCallback() {
        this.removeEventListeners();
    }
    attributeChangedCallback(name: string, oldValue: string, newValue: string) {
        if (oldValue === newValue) return;
        if (name === 'palette-size') {
            this.paletteSize = parseInt(newValue, 10) || 5;
            if (this.colorService) {
                this.colorService.updatePaletteSize(this.paletteSize);
                this.renderColorBlocks();
            }
        }
    }
    private initAttributes() {
        const size = this.getAttribute('palette-size');
        if (size) {
            this.paletteSize = parseInt(size, 10) || 5;
        }
    }
    private render() {
        if (!this.shadowRoot) return;
        this.shadowRoot.innerHTML = `
      <style>
        ${this.getStyles()}
      </style>
      <div class="header">
        <h1>Generador de Paletas de Colores</h1>
        <p>Genera combinaciones de colores armoniosas para tus proyectos</p>
      </div>
      <div class="controls">

        <button class="generate-btn">Generar Nueva Paleta [Espacio]</button>
        <button class="export-btn">Exportar Paleta</button>
      </div>
      <div class="palette-container"></div>
      <div class="copy-notice">Copiado al portapapeles</div>
    `;
        this.renderColorBlocks();
    }
    private cacheElements() {
        if (!this.shadowRoot) return;
        this.elements.paletteSizeInput = this.shadowRoot.querySelector('.palette-size-input');
        this.elements.paletteContainer = this.shadowRoot.querySelector('.palette-container');
        this.elements.generateButton = this.shadowRoot.querySelector('.generate-btn');
        this.elements.exportButton = this.shadowRoot.querySelector('.export-btn');
        this.elements.copyNotice = this.shadowRoot.querySelector('.copy-notice');
    }
    private renderColorBlocks() {
        const { paletteContainer } = this.elements;
        if (!paletteContainer) return;
        paletteContainer.innerHTML = '';
        this.colorService.colors.forEach((color, index) => {
            paletteContainer.appendChild(this.createColorBlock(color, index));
        });
    }
    private createColorBlock(color: ColorInfo, index: number): HTMLElement {
        const colorBlock = document.createElement('div');
        colorBlock.className = `color-block ${color.locked ? ColorPaletteComponent.LOCKED_CLASS : ColorPaletteComponent.UNLOCKED_CLASS}`;
    
        const colorPreview = document.createElement('div');
        colorPreview.className = 'color-preview';
        colorPreview.style.backgroundColor = color.hex;
    
        const lockIcon = document.createElement('span');
        lockIcon.className = 'lock-icon';
        
        // SVG para el candado cerrado
        const lockedSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
        </svg>`;
        
        // SVG para el candado abierto
        const unlockedSvg = `<svg 
                              xmlns="http://www.w3.org/2000/svg" 
                              width="20" 
                              height="20" 
                              viewBox="0 0 24 24" 
                              fill="none" 
                              stroke="currentColor" 
                              stroke-width="2" 
                              stroke-linecap="round" 
                              stroke-linejoin="round">
                              
                              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>

                              <path d="M7 11V7a5 5 0 0 1 9.9-1" />
                            </svg>
                            `;
        
        lockIcon.innerHTML = color.locked ? lockedSvg : unlockedSvg;
        
        colorPreview.appendChild(lockIcon);
        lockIcon.addEventListener('click', () => this.toggleLock(index));
    
        const colorInfo = document.createElement('div');
        colorInfo.className = 'color-info';
    
        const formats = [
            { class: 'hex-code', value: color.hex },
            { class: 'rgb-code', value: color.rgb },
            { class: 'hsl-code', value: color.hsl }
        ];
    
        formats.forEach(format => {
            const element = document.createElement('div');
            element.className = format.class;
            element.textContent = format.value;
            element.addEventListener('click', () => this.copyColor(format.value));
            colorInfo.appendChild(element);
        });
    
        colorBlock.appendChild(colorPreview);
        colorBlock.appendChild(colorInfo);
    
        return colorBlock;
    }
    
    private setupEventListeners() {
        this.elements.generateButton?.addEventListener('click', this.generateNewPalette.bind(this));
        this.elements.exportButton?.addEventListener('click', this.exportPalette.bind(this));
        this.handleKeyDown = this.handleKeyDown.bind(this);
        document.addEventListener('keydown', this.handleKeyDown);
        this.elements.paletteSizeInput?.addEventListener('change', (event) => {
            const newSize = parseInt((event.target as HTMLInputElement).value, 10);
            this.updatePaletteSize(newSize);
        });
    }
    private updatePaletteSize(newSize: number) {
        this.paletteSize = newSize;
        this.colorService.updatePaletteSize(newSize);
        this.renderColorBlocks();
    }
    
    private removeEventListeners() {
        document.removeEventListener('keydown', this.handleKeyDown);
    }
    private handleKeyDown(e: KeyboardEvent) {
        if (e.key === ' ' || e.code === 'Space') {
            e.preventDefault();
            this.generateNewPalette();
        }
    }
    private generateNewPalette() {
        this.colorService.generatePalette();
        this.renderColorBlocks();
    }
    private toggleLock(index: number) {
        this.colorService.lockColor(index);
        this.renderColorBlocks();
    }
    private async copyColor(colorCode: string) {
        try {
            await copyToClipboard(colorCode);
            this.showCopyNotice();
        } catch (error) {
            console.error('Error al copiar al portapapeles:', error);
        }
    }
    private showCopyNotice() {
        const { copyNotice } = this.elements;
        if (!copyNotice) return;
        copyNotice.classList.add(ColorPaletteComponent.ACTIVE_CLASS);
        setTimeout(() => {
            copyNotice.classList.remove(ColorPaletteComponent.ACTIVE_CLASS);
        }, 2000);
    }
    private exportPalette() {
        const paletteData = {
            colors: this.colorService.colors.map(color => ({
                hex: color.hex,
                rgb: color.rgb,
                hsl: color.hsl
            }))
        };
        const dataStr = JSON.stringify(paletteData, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
        const exportLink = document.createElement('a');
        exportLink.setAttribute('href', dataUri);
        exportLink.setAttribute('download', 'color-palette.json');
        document.body.appendChild(exportLink);
        exportLink.click();
        document.body.removeChild(exportLink);
    }
    private getStyles(): string {
      
        return `
      :host {
        display: block;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        max-width: 1200px;
        margin: 0 auto;
        --primary-color: #4a6cf7;
        --primary-hover: #3451c6;
        --text-color: #333;
        --light-bg: #f5f5f5;
        --shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      }
      
      .header {
        text-align: center;
        padding: 2rem 0;
      }
      
      .palette-container {
        display: flex;
        flex-wrap: wrap;
        gap: 1rem;
        margin-bottom: 2rem;
      }
      
      .color-block {
        flex: 1;
        min-width: 150px;
        height: 200px;
        display: flex;
        flex-direction: column;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: var(--shadow);
        transition: transform 0.2s ease;
      }
      
      .color-block:hover {
        transform: translateY(-5px);
      }
      
      .color-preview {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        position: relative;
      }
      
      .lock-icon {
        position: absolute;
        top: 10px;
        right: 10px;
        width: 30px;
        height: 30px;
        background-color: rgba(255, 255, 255, 0.7);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: background-color 0.2s ease;
      }
      
      .lock-icon:hover {
        background-color: rgba(255, 255, 255, 0.9);
      }
      
      .lock-icon svg {
        width: 16px;
        height: 16px;
        stroke: #333;
      }
      
      .color-info {
        background-color: white;
        padding: 1rem;
        text-align: center;
      }
      .hex-code {
        font-weight: bold;
        font-family: monospace;
        font-size: 1rem;
        margin-bottom: 0.5rem;
        cursor: pointer;
      }
      
      .rgb-code, .hsl-code {
        font-size: 0.8rem;
        color: #666;
        font-family: monospace;
        cursor: pointer;
      }
      
      .controls {
        display: flex;
        justify-content: center;
        gap: 1rem;
        margin-bottom: 2rem;
      }
      
      button {
        padding: 0.75rem 1.5rem;
        background-color: var(--primary-color);
        color: white;
        border: none;
        border-radius: 4px;
        font-size: 1rem;
        cursor: pointer;
        transition: background-color 0.2s ease;
      }
      
      button:hover {
        background-color: var(--primary-hover);
      }
      
      .copy-notice {
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background-color: #333;
        color: white;
        padding: 0.5rem 1rem;
        border-radius: 4px;
        font-size: 0.9rem;
        opacity: 0;
        transition: opacity 0.3s ease;
        z-index: 1000;
      }
      
      .copy-notice.active {
        opacity: 1;
      }
      
      @media (max-width: 768px) {
        .palette-container {
          flex-direction: column;
        }
        
        .color-block {
          min-width: 100%;
        }
        
        .controls {
          flex-direction: column;
          align-items: center;
        }
        
        button {
          width: 100%;
          max-width: 300px;
        }
      }
    `;
    }
}
customElements.define('color-palette', ColorPaletteComponent);
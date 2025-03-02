import { ColorPaletteService } from '../services/colorPaletteService';
import { copyToClipboard } from '../utils/clipboard';
import { ColorInfo } from '../types/color';
import './ColorBlockComponent';
import { styles } from './colorPaletteStyles';

export class ColorPaletteComponent extends HTMLElement {
  static get observedAttributes() {
    return ['palette-size'];
  }

  private colorService!: ColorPaletteService;
  private paletteSize: number = 7;
  private hasGeneratedColors: boolean = false; // Contador de primera interacción
  private elements: {
    paletteContainer: HTMLElement | null;
    generateButton: HTMLElement | null;
    exportContainer: HTMLElement | null;
    copyNotice: HTMLElement | null;
    exportBtn: HTMLButtonElement | null;
  } = {
      paletteContainer: null,
      generateButton: null,
      exportContainer: null,
      copyNotice: null,
      exportBtn: null,
    };

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
    this.updateExportButtonState();
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
        this.updateExportButtonState();
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
      <style>${styles}</style>
      <div class="container">
        <header class="header">
          <h1>🎨 Generador de Paletas de Colores</h1>
          <p>Crea combinaciones de colores únicas para tus proyectos de diseño y desarrollo.</p>
        </header>

        <div class="controls">
          <button class="generate-btn">🔄 Generar Colores</button>
          <div class="export-container">
            <button class="export-btn" disabled>📥 Exportar Paleta</button>
            <div class="export-dropdown">
              <button class="export-option" data-format="less">Exportar a LESS</button>
              <button class="export-option" data-format="scss">Exportar a SCSS</button>
              <button class="export-option" data-format="css">Exportar a CSS</button>
              <button class="export-option" data-format="tailwind">Exportar a Tailwind Config</button>
              <button class="export-option" data-format="json">Exportar a JSON</button>
              <button class="export-option" data-format="csv">Exportar a CSV</button>
            </div>
          </div>
        </div>

        <div class="palette-container"></div>
        <div class="copy-notice">✅ Color copiado</div>
      </div>
    `;
    this.renderColorBlocks();
  }

  private cacheElements() {
    if (!this.shadowRoot) return;
    this.elements.paletteContainer = this.shadowRoot.querySelector('.palette-container');
    this.elements.generateButton = this.shadowRoot.querySelector('.generate-btn');
    this.elements.exportContainer = this.shadowRoot.querySelector('.export-container');
    this.elements.copyNotice = this.shadowRoot.querySelector('.copy-notice');
    this.elements.exportBtn = this.shadowRoot.querySelector('.export-btn') as HTMLButtonElement;
  }
  /**
   * Muestra un modal con un mensaje específico.
   * @param {string} message - El mensaje a mostrar en el modal.
   */
  private showModal(message: string) {
    const existingModal = document.querySelector('.global-modal');
    if (existingModal) existingModal.remove();

    const modal = document.createElement('div');
    modal.classList.add('global-modal');

    modal.innerHTML = `
      <div class="modal-content">
          <p>${message}</p>
          <button class="close-modal">OK</button>
      </div>
  `;

    const modalStyle = document.createElement('style');
    modalStyle.textContent = `
      .global-modal {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 5000;
      }
      .modal-content {
          background: #1E293B;
          color: #E2E8F0;
          padding: 1.5rem;
          border-radius: 8px;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
          text-align: center;
          min-width: 300px;
      }
      .modal-content button {
          background: #4F46E5;
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 5px;
          cursor: pointer;
          margin-top: 1rem;
          font-size: 1rem;
          font-weight: bold;
      }
      .modal-content button:hover {
          background: #4338CA;
      }
  `;

    document.head.appendChild(modalStyle);
    document.body.appendChild(modal);

    modal.querySelector('.close-modal')?.addEventListener('click', () => {
      modal.remove();
    });
  }

  private renderColorBlocks() {
    const { paletteContainer } = this.elements;
    if (!paletteContainer) return;
    paletteContainer.innerHTML = '';

    if (!this.hasGeneratedColors) {
      paletteContainer.innerHTML = `<p>No hay colores generados. Presiona "Generar Colores" para crear una paleta.</p>`;
    } else {
      this.colorService.colors.forEach((color: ColorInfo, index: number) => {
        const colorBlock = document.createElement('color-block');
        (colorBlock as any).color = color;
        (colorBlock as any).index = index;

        colorBlock.addEventListener('toggle-lock', ((e: CustomEvent) => {
          this.toggleLock(e.detail.index);
        }) as EventListener);
        colorBlock.addEventListener('copy-color', ((e: CustomEvent) => {
          this.copyColor(e.detail.colorCode);
        }) as EventListener);

        paletteContainer.appendChild(colorBlock);
      });
    }
    this.updateExportButtonState();
  }

  private updateExportButtonState() {
    const exportBtn = this.elements.exportBtn;
    if (exportBtn) {
      if (!this.hasGeneratedColors || this.colorService.colors.length === 0) {
        exportBtn.setAttribute('disabled', 'true');
        exportBtn.title = "Genera una paleta antes de exportar";
      } else {
        exportBtn.removeAttribute('disabled');
        exportBtn.title = "";
      }
    }
  }

  private setupEventListeners() {
    this.elements.generateButton?.addEventListener('click', this.generateNewPalette.bind(this));

    const exportOptions = this.shadowRoot?.querySelectorAll('.export-option');
    exportOptions?.forEach((option) => {
      option.addEventListener('click', (e) => {
        e.stopPropagation();
        const format = (option as HTMLElement).getAttribute('data-format');
        if (format) {
          this.exportPaletteAs(format);
        }
      });
    });

    document.addEventListener('keydown', this.handleKeyDown.bind(this));
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
    this.hasGeneratedColors = true; // Primera interacción activada
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
    copyNotice.classList.add('active');
    setTimeout(() => {
      copyNotice.classList.remove('active');
    }, 2000);
  }

  private exportPaletteAs(format: string) {
    if (!this.hasGeneratedColors) {
      this.showModal("Debes generar colores antes de exportar.");
      return;
    }

    const colors = this.colorService.colors;
    if (!colors || colors.length === 0) {
      console.warn("No hay colores generados.");
      return;
    }

    let content = "";
    let filename = "";

    switch (format) {
      case "json":
        const paletteData = {
          colors: this.colorService.colors.map(({ hex, rgb, hsl }) => ({
            hex,
            rgb,
            hsl
          }))
        };
        content = JSON.stringify(paletteData, null, 2);
        filename = "color-palette.json";
        break;
      case "css":
        content = `:root {\n`;
        colors.forEach((color, i) => {
          content += `  --color-${i + 1}: ${color.hex};\n`;
        });
        content += `}`;
        filename = "color-palette.css";
        break;
      case "scss":
        content = colors.map((color, i) => `$color-${i + 1}: ${color.hex};`).join("\n");
        filename = "color-palette.scss";
        break;
      case "less":
        content = colors.map((color, i) => `@color-${i + 1}: ${color.hex};`).join("\n");
        filename = "color-palette.less";
        break;
      case "tailwind":
        content = `module.exports = {\n  theme: {\n    extend: {\n      colors: {\n`;
        colors.forEach((color, i) => {
          const colorKey = `color${i + 1}`;
          content += `        '${colorKey}': '${color.hex}',\n`;
        });
        content += `      }\n    }\n  }\n};`;
        filename = "tailwind.config.js";
        break;
      case "csv":
        content = "Index,Hex\n" + colors.map((color, i) => `${i + 1},${color.hex}`).join("\n");
        filename = "color-palette.csv";
        break;
      default:
        console.warn("Formato no soportado.");
        return;
    }

    const dataUri = 'data:text/plain;charset=utf-8,' + encodeURIComponent(content);
    const exportLink = document.createElement('a');
    exportLink.setAttribute('href', dataUri);
    exportLink.setAttribute('download', filename);
    document.body.appendChild(exportLink);
    exportLink.click();
    document.body.removeChild(exportLink);
  }

}

customElements.define('color-palette', ColorPaletteComponent);

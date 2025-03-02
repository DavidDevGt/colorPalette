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
  private paletteSize: number = 6;
  private hasGeneratedColors: boolean = false;
  private elements: {
    paletteContainer: HTMLElement | null;
    generateButton: HTMLElement | null;
    exportContainer: HTMLElement | null;
    copyNotice: HTMLElement | null;
    exportBtn: HTMLButtonElement | null;
    previewContainer: HTMLElement | null;
  } = {
    paletteContainer: null,
    generateButton: null,
    exportContainer: null,
    copyNotice: null,
    exportBtn: null,
    previewContainer: null,
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
          <h1>ChromaNova</h1>
          <p>Aqui puedes generar paletas de colores para tus proyectos</p>
        </header>
  
        <div class="controls">
          <button class="generate-btn">🔄 Generar Colores</button>
          <div class="export-container">
            <button class="export-btn" disabled>📥 Exportar</button>
            <div class="export-dropdown">
              <button class="export-option" data-format="less">LESS</button>
              <button class="export-option" data-format="scss">SCSS</button>
              <button class="export-option" data-format="css">CSS</button>
              <button class="export-option" data-format="tailwind">Tailwind</button>
              <button class="export-option" data-format="json">JSON</button>
              <button class="export-option" data-format="csv">CSV</button>
            </div>
            <div class="preview-container">
              <h3>Vista previa</h3>
              <pre class="preview-content"></pre>
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
    this.elements.previewContainer = this.shadowRoot.querySelector('.preview-container');
  }

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
        // Hacer el bloque draggable
        colorBlock.setAttribute('draggable', 'true');

        // Evento dragstart: guardamos el índice en el dataTransfer y agregamos una clase visual
        colorBlock.addEventListener('dragstart', (e: DragEvent) => {
          e.dataTransfer?.setData('text/plain', index.toString());
          colorBlock.classList.add('dragging');
        });

        // Evento dragend: quitar la clase visual
        colorBlock.addEventListener('dragend', (e: DragEvent) => {
          colorBlock.classList.remove('dragging');
        });

        // Permitir el drop sobre cada bloque
        colorBlock.addEventListener('dragover', (e: DragEvent) => {
          e.preventDefault();
          e.dataTransfer!.dropEffect = 'move';
        });

        // Evento drop: obtener el índice de origen y reordenar la paleta
        colorBlock.addEventListener('drop', (e: DragEvent) => {
          e.preventDefault();
          const draggedIndexStr = e.dataTransfer?.getData('text/plain');
          if (draggedIndexStr === undefined || draggedIndexStr === '') return;
          const draggedIndex = parseInt(draggedIndexStr, 10);
          const targetIndex = index;
          if (draggedIndex === targetIndex) return;
          this.reorderColors(draggedIndex, targetIndex);
        });

        // Eventos para las acciones propias del color-block
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

  /**
   * Reordena la paleta moviendo el color desde "from" hasta "to".
   * Se actualiza el arreglo de colores y se vuelve a renderizar.
   */
  private reorderColors(from: number, to: number) {
    const colors = this.colorService.colors;
    const movedColor = colors.splice(from, 1)[0];
    colors.splice(to, 0, movedColor);
    this.renderColorBlocks();
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
      
      // Añadimos evento de hover para mostrar el preview
      option.addEventListener('mouseenter', (e) => {
        const format = (option as HTMLElement).getAttribute('data-format');
        if (format) {
          this.showFormatPreview(format);
        }
      });
      
      option.addEventListener('mouseleave', () => {
        this.hidePreview();
      });
    });

    // Ocultar el preview cuando el mouse sale del dropdown
    this.elements.exportContainer?.addEventListener('mouseleave', () => {
      this.hidePreview();
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
    this.hasGeneratedColors = true;
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

  private showFormatPreview(format: string) {
    if (!this.hasGeneratedColors || !this.elements.previewContainer) return;
    
    // Obtener muestra del contenido (limitado a 3 colores para el preview)
    const previewContent = this.getPreviewContent(format);
    
    // Actualizar el contenido del preview
    const previewElem = this.elements.previewContainer.querySelector('.preview-content');
    if (previewElem) {
      previewElem.textContent = previewContent;
    }
    
    // Mostrar el contenedor del preview
    this.elements.previewContainer.classList.add('visible');
  }
  
  private hidePreview() {
    if (this.elements.previewContainer) {
      this.elements.previewContainer.classList.remove('visible');
    }
  }
  
  private getPreviewContent(format: string): string {
    // Mostrar solo los primeros 3 colores o menos para el preview
    const colors = this.colorService.colors;
    const previewColors = colors.slice(0, 3);
    
    if (!previewColors || previewColors.length === 0) {
      return "No hay colores para previsualizar";
    }
    
    let content = "";
    
    switch (format) {
      case "json":
        const paletteData = {
          colors: previewColors.map(({ hex, rgb, hsl }) => ({
            hex,
            rgb,
            hsl
          }))
        };
        content = JSON.stringify(paletteData, null, 2);
        break;
      case "css":
        content = `:root {\n`;
        previewColors.forEach((color, i) => {
          content += `  --color-${i + 1}: ${color.hex};\n`;
        });
        content += `  /* ... */\n}`;
        break;
      case "scss":
        content = previewColors.map((color, i) => `$color-${i + 1}: ${color.hex};`).join("\n");
        if (colors.length > 3) content += "\n// ...";
        break;
      case "less":
        content = previewColors.map((color, i) => `@color-${i + 1}: ${color.hex};`).join("\n");
        if (colors.length > 3) content += "\n// ...";
        break;
      case "tailwind":
        content = `module.exports = {\n  theme: {\n    extend: {\n      colors: {\n`;
        previewColors.forEach((color, i) => {
          const colorKey = `color${i + 1}`;
          content += `        '${colorKey}': '${color.hex}',\n`;
        });
        content += `        // ...\n      }\n    }\n  }\n};`;
        break;
      case "csv":
        content = "Index,Hex\n" + previewColors.map((color, i) => `${i + 1},${color.hex}`).join("\n");
        if (colors.length > 3) content += "\n...";
        break;
      default:
        content = "Formato no soportado.";
    }
    
    return content;
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
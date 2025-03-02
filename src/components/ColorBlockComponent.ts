import { ColorInfo } from '../types/color';
import { styles } from './colorPaletteStyles';
import { copyToClipboard } from '../utils/clipboard';

export class ColorBlockComponent extends HTMLElement {
    color: ColorInfo | null = null;
    index: number = 0;
    private eventListenersAttached = false;

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.render();
    }
    
    disconnectedCallback() {
        this.removeEventListeners();
    }

    set data(value: { color: ColorInfo; index: number }) {
        this.color = value.color;
        this.index = value.index;
        this.render();
    }

    render() {
        if (!this.shadowRoot || !this.color) return;
        const color = this.color;
        const isLightBackground = this.isLightColor(color.hex);
        const iconColor = isLightBackground ? '#000000' : '#ffffff'; // Negro en fondos claros, blanco en oscuros.

        this.shadowRoot.innerHTML = `
            <style>
                ${styles}
                .lock-icon svg {
                    stroke: var(--icon-color);
                    transition: transform 0.2s ease;
                }
                .lock-icon {
                    cursor: pointer;
                    opacity: 0.7;
                    transition: opacity 0.2s;
                }
                .lock-icon:hover {
                    opacity: 1;
                }
                .lock-icon:hover svg {
                    transform: scale(1.1);
                }
                .color-info > div {
                    cursor: pointer;
                    padding: 4px;
                    border-radius: 4px;
                    transition: background-color 0.2s;
                    position: relative;
                }
                .color-info > div:hover {
                    background-color: rgba(0,0,0,0.05);
                }
                .copied {
                    animation: flash 1s;
                }
                @keyframes flash {
                    0%, 100% { background-color: transparent; }
                    50% { background-color: rgba(0,200,0,0.2); }
                }
                .hex-code {
                    font-weight: bold;
                }
            </style>
            <div class="color-block">
                <div class="color-preview" style="background-color: ${color.hex}; --icon-color: ${iconColor};">
                    <span class="lock-icon" title="${color.locked ? 'Desbloquear color' : 'Bloquear color'}">
                        ${this.getLockIcon(color.locked)}
                    </span>
                </div>
                <div class="color-info">
                    <div class="hex-code" title="Copiar código HEX">${color.hex}</div>
                    <div class="rgb-code" title="Copiar código RGB">${color.rgb}</div>
                    <div class="hsl-code" title="Copiar código HSL">${color.hsl}</div>
                </div>
            </div>
        `;

        if (this.eventListenersAttached) {
            this.removeEventListeners();
        }
        this.setupEventListeners();
    }

    removeEventListeners() {
        const lockIcon = this.shadowRoot?.querySelector('.lock-icon');
        if (lockIcon) {
            const newLockIcon = lockIcon.cloneNode(true);
            lockIcon.parentNode?.replaceChild(newLockIcon, lockIcon);
        }

        const colorCodes = ['.hex-code', '.rgb-code', '.hsl-code'];
        colorCodes.forEach(selector => {
            const el = this.shadowRoot?.querySelector(selector);
            if (el) {
                const newEl = el.cloneNode(true);
                el.parentNode?.replaceChild(newEl, el);
            }
        });
        
        this.eventListenersAttached = false;
    }

    setupEventListeners() {
        const lockIcon = this.shadowRoot?.querySelector('.lock-icon');
        if (lockIcon) {
            lockIcon.addEventListener('click', (e) => {
                e.stopPropagation();
                this.dispatchEvent(new CustomEvent('toggle-lock', {
                    detail: { index: this.index },
                    bubbles: true,
                    composed: true
                }));
            });
        }

        const colorCodes = ['.hex-code', '.rgb-code', '.hsl-code'];
        colorCodes.forEach(selector => {
            const el = this.shadowRoot?.querySelector(selector);
            if (el) {
                el.addEventListener('click', async (e) => {
                    e.stopPropagation();
                    const colorCode = (el as HTMLElement).textContent;
                    
                    if (colorCode) {
                        try {
                            await copyToClipboard(colorCode);
                            el.classList.add('copied');
                            setTimeout(() => el.classList.remove('copied'), 1000);
                        } catch (error) {
                            console.error('Error al copiar al portapapeles:', error);
                        }
                    }
                    
                    this.dispatchEvent(new CustomEvent('copy-color', {
                        detail: { colorCode },
                        bubbles: true,
                        composed: true
                    }));
                });
            }
        });
        
        this.eventListenersAttached = true;
    }

    /**
     * Devuelve el ícono SVG de candado con `stroke="currentColor"`, que se hereda del CSS.
     */
    getLockIcon(isLocked: boolean): string {
        return isLocked
            ? `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-label="Bloqueado">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>`
            : `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-label="Desbloqueado">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 9.9-1" />
                </svg>`;
    }

    isLightColor(hex: string): boolean {
        const rgb = this.hexToRgb(hex);
        if (!rgb) return false;

        const { r, g, b } = rgb;
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        return luminance > 0.6;
    }

    hexToRgb(hex: string): { r: number, g: number, b: number } | null {
        let cleanHex = hex.trim().replace('#', '');
        if (cleanHex.length === 3) {
            cleanHex = cleanHex.split('').map(x => x + x).join('');
        }
        if (!/^[0-9A-Fa-f]{6}$/.test(cleanHex)) return null;

        const r = parseInt(cleanHex.substring(0, 2), 16);
        const g = parseInt(cleanHex.substring(2, 4), 16);
        const b = parseInt(cleanHex.substring(4, 6), 16);
        
        return { r, g, b };
    }
}

customElements.define('color-block', ColorBlockComponent);

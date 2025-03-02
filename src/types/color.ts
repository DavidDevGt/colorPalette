/**
 * Representa información adicional de un color.
 */
export interface ColorInfo {
    /** Valor del color en formato hexadecimal (por ejemplo, "#FFFFFF"). */
    hex: string;
    /** Valor del color en formato RGB (por ejemplo, "rgb(255, 255, 255)"). */
    rgb: string;
    /** Valor del color en formato HSL (por ejemplo, "hsl(0, 0%, 100%)"). */
    hsl: string;
    /** Indica si el color se encuentra bloqueado para evitar su cambio. */
    locked: boolean;
}
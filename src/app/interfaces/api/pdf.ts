// Pdf Interface
export interface ReceiptData {
    date: string;
    hours: string;
    refNumber: string;
    numSeq: string;
    abononumber: string;
    status: string;
    describe: string;
    amount: string;
    methodPayment: string;
    checkout_identify: string;
    is_anulation: boolean;
}

interface PDFColor {
    r: number;
    g: number;
    b: number;
}

export interface PDFContentItem {
    text: string;
    size?: number;         // Tamaño de fuente (opcional)
    x?: number;           // Posición horizontal (opcional)
    y?: number;           // Posición vertical (opcional - normalmente se calcula automáticamente)
    center?: boolean;     // Si el texto debe centrarse (opcional)
    bold?: boolean;       // Si el texto debe estar en negrita (opcional)
    color?: PDFColor;     // Color del texto (opcional)
    maxWidth?: number;    // Ancho máximo del texto (opcional)
    lineHeight?: number;  // Altura de línea (opcional)
    margin?: {
        top?: number;
        bottom?: number;
        left?: number;
        right?: number;
    };
}

export interface PDFGenerationResult {
    success: boolean;
    path: string;
    message: string;
}
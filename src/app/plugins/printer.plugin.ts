import { registerPlugin } from '@capacitor/core';

export interface PrinterPlugin {
  /**
   * Imprime texto en la impresora térmica vía HTTP
   */
  printText(options: { text: string; url?: string }): Promise<{
    success: boolean;
    message: string;
    responseCode?: number;
  }>;

  /**
   * Verifica si el servicio de impresión está disponible
   */
  checkConnection(options?: { url?: string }): Promise<{
    connected: boolean;
    message?: string;
    responseCode?: number;
  }>;
}

const Printer = registerPlugin<PrinterPlugin>('Printer', {
  web: () => {
    // Fallback para web (opcional)
    return {
      printText: async () => {
        throw new Error('Printer plugin no disponible en web');
      },
      checkConnection: async () => {
        return { connected: false, message: 'Solo disponible en Android' };
      }
    };
  }
});

export default Printer;


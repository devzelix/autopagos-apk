import { Injectable } from '@angular/core';
import { IPrintTicket } from 'src/app/interfaces/printer.interface';
import Printer from '../../plugins/printer.plugin';

@Injectable({
  providedIn: 'root',
})
export class DirectPrinterService {
  
  private readonly PRINTER_URL = 'http://localhost:9100/';
  
  constructor() {}

  /**
   * Construye el texto del ticket (EXACTO como API Driver)
   */
  private buildTicketText(data: IPrintTicket): string {
    const lines: string[] = [];
    const totalWidth = 48;
    const separator = '-'.repeat(totalWidth);

    const centerText = (text: string, width: number = 48): string => {
      const clean = text || '';
      const padding = Math.max(0, Math.floor((width - clean.length) / 2));
      return ' '.repeat(padding) + clean;
    };

    const formatLine = (left: string, right: string): string => {
      const leftWidth = 15;
      const rightWidth = 33;
      return left.padEnd(leftWidth, ' ') + right.padStart(rightWidth, ' ');
    };

    // Encabezado
    lines.push(centerText('CORPORACION FIBEXTELECOM C.A.'));
    lines.push(centerText('CARACAS, PARAISO, URB. LAS FUENTES'));
    lines.push(centerText('CALLE II Y III-QUINTA SAN JOSE NRO 8'));
    lines.push(separator);

    // Información
    if (data.date) lines.push(formatLine('Fecha:', data.date));
    if (data.hours) lines.push(formatLine('Hora:', data.hours));
    if (data.refNumber) lines.push(formatLine('Referencia:', data.refNumber));
    if (data.numSeq) lines.push(formatLine('Num.Seq:', data.numSeq));
    if (data.abononumber) lines.push(formatLine('Abonado:', data.abononumber));
    lines.push(separator);

    // Estado
    const status = data.status?.toUpperCase().includes('APROBAD') 
      ? 'PAGO APROBADO' 
      : data.status;
    lines.push(centerText(status || ''));
    lines.push(separator);

    // Detalles
    if (data.describe) lines.push(formatLine('Descripcion:', data.describe));
    if (data.amount) lines.push(formatLine('Monto:', `${data.amount}Bs.`));
    if (data.methodPayment) lines.push(formatLine('Forma Pago:', data.methodPayment));
    lines.push(separator);
    
    if (data.amount) lines.push(formatLine('TOTAL:', `${data.amount}Bs.`));
    lines.push(separator);

    // Pie
    lines.push(centerText('Gracias por su pago!'));
    lines.push(centerText('Fibex Telecom C.A.'));
    lines.push(centerText('EL INTERNET QUE SI FUNCIONA!'));
    lines.push('\n\n\n');

    return lines.join('\n');
  }

  /**
   * Imprime ticket usando el plugin nativo de Java
   */
  async printTicket(ticketData: IPrintTicket): Promise<{
    success: boolean;
    message: string;
    ip?: string;
  }> {
    try {
      console.log('🖨️ [Direct Printer] Usando plugin nativo de Java...');
      console.log(`🌐 [Direct Printer] URL: ${this.PRINTER_URL}`);

      // Generar texto del ticket
      const ticketText = this.buildTicketText(ticketData);
      console.log(`📝 [Direct Printer] Texto generado (${ticketText.length} caracteres)`);

      // Usar el plugin nativo
      console.log('📤 [Direct Printer] Llamando al plugin Printer.printText()...');
      const result = await Printer.printText({
        text: ticketText,
        url: this.PRINTER_URL
      });

      console.log('✅ [Direct Printer] Resultado del plugin:', result);
      
      return {
        success: result.success,
        message: result.message,
        ip: 'localhost',
      };

    } catch (error: any) {
      console.error('❌ [Direct Printer] Error del plugin:', error);
      return {
        success: false,
        message: `Error: ${error.message || 'Error desconocido'}`,
      };
    }
  }

  /**
   * Verifica conectividad con la impresora usando el plugin
   */
  async checkConnection(): Promise<boolean> {
    try {
      const result = await Printer.checkConnection({ url: this.PRINTER_URL });
      console.log('🔍 [Direct Printer] Check connection:', result);
      return result.connected;
    } catch (error) {
      console.error('❌ [Direct Printer] Error al verificar conexión:', error);
      return false;
    }
  }

  /**
   * Diagnóstico usando el plugin
   */
  async diagnostic(): Promise<void> {
    console.log('🔍 ===== DIAGNÓSTICO DE IMPRESORA (PLUGIN NATIVO) =====');
    console.log('🌐 URL:', this.PRINTER_URL);
    console.log('📱 Usando: PrinterPlugin (Java nativo)');
    
    const connected = await this.checkConnection();
    console.log('🖨️ Estado:', connected ? 'ACCESIBLE ✅' : 'NO ACCESIBLE ❌');
    
    if (!connected) {
      console.log('💡 Solución:');
      console.log('   1. Abre USBPrint en el dispositivo');
      console.log('   2. Verifica que el servicio esté activo');
      console.log('   3. Confirma que el puerto sea 9100');
    }
    
    console.log('🔍 ===== FIN DIAGNÓSTICO =====');
  }
}

// // import { Injectable } from '@angular/core';
// // import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

// // // Las interfaces ReceiptData y PDFGenerationResult ya no necesitan 'path'
// // interface ReceiptData {
// //   date: string;
// //   hours: string;
// //   refNumber: string;
// //   numSeq: string;
// //   abononumber: string;
// //   status: string;
// //   describe: string;
// //   amount: string;
// //   methodPayment: string;
// // }

// // // El resultado ahora será los bytes del PDF, no una ruta en disco.
// // type PDFGenerationResult = Uint8Array;

// // @Injectable({
// //   providedIn: 'root'
// // })
// // export class PdfService {
// //   private readonly defaultFontSize = 7.3;
// //   private readonly pageWidth = 57 * 2.83465;
// //   private readonly pageHeight = 250;
// //   private readonly leftMargin = 10;
// //   private readonly lineHeight = 10;

// //   /**
// //    * @description Formats a line with left and right text.
// //    * @param leftText : string
// //    * @param rightText : string
// //    * @param bold : boolean
// //    * @returns json object with text and bold
// //    */
// //   private formatLineWithBold = (
// //     leftText: string,
// //     rightText: string,
// //     bold = false
// //   ) => {
// //     const leftWidth = 12;
// //     const rightWidth = 20;
// //     const formattedLeft = leftText.padEnd(leftWidth, " ");
// //     const formattedRight = rightText.padStart(rightWidth, " ");
// //     return {
// //       text: formattedLeft + formattedRight,
// //       bold,
// //     };
// //   };

// //   /**
// //    * @description Create Ticket Contents
// //    * @param data : ReceiptData
// //    * @param font : any
// //    * @returns json body of the ticket content
// //    */
// //   private async createTicketContents(data: ReceiptData, doc: PDFDocument) {
// //     const separator = "-".repeat(35);
// //     const courierBoldFont = await doc.embedFont(StandardFonts.CourierBold);
// //     const courierFont = await doc.embedFont(StandardFonts.Courier);

// //     return [
// //       {
// //         text: "CORPORACIÓN FIBEXTELECOM C.A.",
// //         font: courierFont,
// //         size: this.defaultFontSize,
// //         alignment: "center",
// //       },
// //       {
// //         text: "CARACAS, PARAÍSO, URB. LAS FUENTES",
// //         font: courierFont,
// //         size: this.defaultFontSize,
// //         alignment: "center",
// //       },
// //       {
// //         text: "CALLE II Y III-QUINTA SAN JOSÉ NRO 8",
// //         font: courierFont,
// //         size: this.defaultFontSize,
// //         alignment: "center",
// //       },
// //       {
// //         text: separator,
// //         font: courierFont,
// //         size: this.defaultFontSize,
// //         alignment: "center",
// //       },
// //       {
// //         text: this.formatLineWithBold("Fecha:", data.date).text,
// //         font: courierFont,
// //         size: this.defaultFontSize,
// //       },
// //       {
// //         text: this.formatLineWithBold("Hora:", data.hours).text,
// //         font: courierFont,
// //         size: this.defaultFontSize,
// //       },
// //       {
// //         text: this.formatLineWithBold("Referencia:", data.refNumber).text,
// //         font: courierFont,
// //         size: this.defaultFontSize,
// //       },
// //       {
// //         text: this.formatLineWithBold("Num.Seq:", data.numSeq).text,
// //         font: courierFont,
// //         size: this.defaultFontSize,
// //       },
// //       {
// //         text: this.formatLineWithBold("Abonado:", data.abononumber).text,
// //         font: courierFont,
// //         size: this.defaultFontSize,
// //       },
// //       {
// //         text: separator,
// //         font: courierFont,
// //         size: this.defaultFontSize,
// //         alignment: "center",
// //       },
// //       {
// //         text: data.status,
// //         font: courierBoldFont,
// //         size: this.defaultFontSize,
// //         alignment: "center",
// //       },
// //       {
// //         text: separator,
// //         font: courierFont,
// //         size: this.defaultFontSize,
// //         alignment: "center",
// //       },
// //       {
// //         text: this.formatLineWithBold("Descripción:", data.describe).text,
// //         font: courierFont,
// //         size: this.defaultFontSize,
// //       },
// //       {
// //         text: this.formatLineWithBold("Monto:", `${data.amount}Bs.`).text,
// //         font: courierFont,
// //         size: this.defaultFontSize,
// //       },
// //       {
// //         text: this.formatLineWithBold("Forma Pago:", data.methodPayment).text,
// //         font: courierFont,
// //         size: this.defaultFontSize,
// //       },
// //       {
// //         text: separator,
// //         font: courierFont,
// //         size: this.defaultFontSize,
// //         alignment: "center",
// //       },
// //       {
// //         text: this.formatLineWithBold("TOTAL:", `${data.amount}Bs.`, true).text,
// //         font: courierBoldFont,
// //         size: this.defaultFontSize,
// //       },
// //       {
// //         text: separator,
// //         font: courierFont,
// //         size: this.defaultFontSize,
// //         alignment: "center",
// //       },
// //       {
// //         text: "¡Gracias por su pago!",
// //         font: courierFont,
// //         size: this.defaultFontSize,
// //         alignment: "center",
// //       },
// //       {
// //         text: "Fibex Telecom C.A.",
// //         font: courierFont,
// //         size: this.defaultFontSize,
// //         alignment: "center",
// //       },
// //       {
// //         text: "¡EL INTERNET QUE SÍ FUNCIONA!",
// //         font: courierBoldFont,
// //         size: this.defaultFontSize,
// //         alignment: "center",
// //       },
// //     ];
// //   }

// //   /**
// //    * @description Generate Ticket PDF
// //    * @param data : ReceiptData
// //    * @returns Promise<Uint8Array> - Los bytes del PDF en memoria
// //    */
// //   public async generateTicket(data: ReceiptData): Promise<PDFGenerationResult> {
// //     try {
// //       const pdfDoc = await PDFDocument.create();
// //       const page = pdfDoc.addPage([this.pageWidth, this.pageHeight]);
// //       let yPosition = this.pageHeight - this.leftMargin - 15;

// //       // Cargamos las fuentes aquí y las pasamos al método de contenido
// //       const courierFont = await pdfDoc.embedFont(StandardFonts.Courier);
// //       const contents = await this.createTicketContents(data, pdfDoc);

// //       for (const item of contents) {
// //         const textWidth = item.font.widthOfTextAtSize(
// //           item.text,
// //           item.size || this.defaultFontSize
// //         );
// //         let xPosition = this.leftMargin;

// //         if (item.alignment === "center") {
// //           xPosition = (this.pageWidth - textWidth) / 2;
// //         } else if (item.alignment === "right") {
// //           xPosition = this.pageWidth - textWidth - this.leftMargin;
// //         }

// //         page.drawText(item.text, {
// //           x: xPosition,
// //           y: yPosition,
// //           size: item.size || this.defaultFontSize,
// //           font: item.font,
// //           color: rgb(0, 0, 0),
// //         });

// //         yPosition -= this.lineHeight;
// //         if (item.text.startsWith("-")) {
// //           yPosition -= 3;
// //         }
// //       }

// //       // Ya no guardamos en disco, solo devolvemos los bytes
// //       return await pdfDoc.save();

// //     } catch (error) {
// //       console.error("Error al generar el ticket:", error);
// //       throw new Error(
// //         `Error al generar el PDF: ${
// //           error instanceof Error ? error.message : String(error)
// //         }`
// //       );
// //     }
// //   }

// //   /**
// //    * @description Text Content to PDF
// //    * @param textContent : string - El contenido del archivo TXT
// //    * @returns Promise<Uint8Array> - Los bytes del PDF en memoria
// //    */
// //   public async textContentToPdf(textContent: string): Promise<PDFGenerationResult> {
// //     try {
// //       const pdfDoc = await PDFDocument.create();
// //       const font = await pdfDoc.embedFont(StandardFonts.Courier);

// //       const pageWidth = 165;
// //       const fontSize = 7.3;
// //       const margin = 5;
// //       const lineHeight = fontSize + 2;
// //       const lines = textContent.split("\n");
// //       const totalLinesHeight = lines.length * lineHeight;
// //       const pageHeight = totalLinesHeight + (margin * 2);

// //       const page = pdfDoc.addPage([pageWidth, pageHeight]);
// //       let y = page.getHeight() - margin;

// //       for (const line of lines) {
// //         page.drawText(line, {
// //           x: margin,
// //           y: y,
// //           size: fontSize,
// //           font: font,
// //           color: rgb(0, 0, 0),
// //         });
// //         y -= lineHeight;
// //       }

// //       return await pdfDoc.save();

// //     } catch (error) {
// //       console.error("Error al crear PDF térmico:", error);
// //       throw error;
// //     }
// //   }
// // }

// // src/app/services/pdf.service.ts
// import { Injectable } from '@angular/core';
// import { Capacitor } from '@capacitor/core';
// import { Directory, Filesystem } from '@capacitor/filesystem';
// import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

// export interface ReceiptData {
//   date: string;
//   hours: string;
//   refNumber: string;
//   numSeq: string;
//   abononumber: string;
//   status: string;
//   describe: string;
//   amount: string;
//   methodPayment: string;
// }

// export interface PDFGenerationResult {
//   success: boolean;
//   path?: string;
//   message: string;
// }

// @Injectable({
//   providedIn: 'root'
// })
// export class PdfService {
//   private readonly defaultFontSize = 7.3;
//   private readonly pageWidth = 57 * 2.83465; // 58mm exactos
//   private readonly pageHeight = 250;
//   private readonly leftMargin = 10;
//   private readonly lineHeight = 10;

//   constructor() { }

//   /**
//    * @description Formats a line with left and right text.
//    * @param leftText : string
//    * @param rightText : string
//    * @param bold : boolean
//    * @returns json object with text and bold
//    */
//   private formatLineWithBold = (
//     leftText: string,
//     rightText: string,
//     bold = false
//   ) => {
//     const leftWidth = 12;
//     const rightWidth = 20;
//     const formattedLeft = leftText.padEnd(leftWidth, " ");
//     const formattedRight = rightText.padStart(rightWidth, " ");
//     return {
//       text: formattedLeft + formattedRight,
//       bold,
//     };
//   };

//   /**
//    * @description Create Ticket Contents
//    * @param data : ReceiptData
//    * @param font : any
//    * @returns json body of the ticket content
//    */
//   private async createTicketContents(data: ReceiptData, font: any) {
//     const separator = "-".repeat(35);
//     const courierBoldFont = await font.doc.embedFont(StandardFonts.CourierBold);

//     return [
//       {
//         text: "CORPORACIÓN FIBEXTELECOM C.A.",
//         font,
//         size: this.defaultFontSize,
//         alignment: "center",
//       },
//       {
//         text: "CARACAS, PARAÍSO, URB. LAS FUENTES",
//         font,
//         size: this.defaultFontSize,
//         alignment: "center",
//       },
//       {
//         text: "CALLE II Y III-QUINTA SAN JOSÉ NRO 8",
//         font,
//         size: this.defaultFontSize,
//         alignment: "center",
//       },
//       {
//         text: separator,
//         font,
//         size: this.defaultFontSize,
//         alignment: "center",
//       },
//       {
//         text: this.formatLineWithBold("Fecha:", data.date).text,
//         font,
//         size: this.defaultFontSize,
//       },
//       {
//         text: this.formatLineWithBold("Hora:", data.hours).text,
//         font,
//         size: this.defaultFontSize,
//       },
//       {
//         text: this.formatLineWithBold("Referencia:", data.refNumber).text,
//         font,
//         size: this.defaultFontSize,
//       },
//       {
//         text: this.formatLineWithBold("Num.Seq:", data.numSeq).text,
//         font,
//         size: this.defaultFontSize,
//       },
//       {
//         text: this.formatLineWithBold("Abonado:", data.abononumber).text,
//         font,
//         size: this.defaultFontSize,
//       },
//       {
//         text: separator,
//         font,
//         size: this.defaultFontSize,
//         alignment: "center",
//       },
//       {
//         text: data.status,
//         font: courierBoldFont,
//         size: this.defaultFontSize,
//         alignment: "center",
//       },
//       {
//         text: separator,
//         font,
//         size: this.defaultFontSize,
//         alignment: "center",
//       },
//       {
//         text: this.formatLineWithBold("Descripción:", data.describe).text,
//         font,
//         size: this.defaultFontSize,
//       },
//       {
//         text: this.formatLineWithBold("Monto:", `${data.amount}Bs.`).text,
//         font,
//         size: this.defaultFontSize,
//       },
//       {
//         text: this.formatLineWithBold("Forma Pago:", data.methodPayment).text,
//         font,
//         size: this.defaultFontSize,
//       },
//       {
//         text: separator,
//         font,
//         size: this.defaultFontSize,
//         alignment: "center",
//       },
//       {
//         text: this.formatLineWithBold("TOTAL:", `${data.amount}Bs.`, true).text,
//         font: courierBoldFont,
//         size: this.defaultFontSize,
//       },
//       {
//         text: separator,
//         font,
//         size: this.defaultFontSize,
//         alignment: "center",
//       },
//       {
//         text: "¡Gracias por su pago!",
//         font,
//         size: this.defaultFontSize,
//         alignment: "center",
//       },
//       {
//         text: "Fibex Telecom C.A.",
//         font,
//         size: this.defaultFontSize,
//         alignment: "center",
//       },
//       {
//         text: "¡EL INTERNET QUE SÍ FUNCIONA!",
//         font: courierBoldFont,
//         size: this.defaultFontSize,
//         alignment: "center",
//       },
//     ];
//   }

//   /**
//    * @description Generate Ticket PDF
//    * @param data
//    * @param fileName
//    * @returns Promise<PDFGenerationResult>
//    */
//   public async generateTicket(
//     data: ReceiptData,
//     fileName: string
//   ): Promise<PDFGenerationResult> {
//     try {
//       const pdfDoc = await PDFDocument.create();
//       const page = pdfDoc.addPage([this.pageWidth, this.pageHeight]);

//       const courierFont = await pdfDoc.embedFont(StandardFonts.Courier);
//       let yPosition = this.pageHeight - this.leftMargin - 15;

//       const contents = await this.createTicketContents(data, courierFont);

//       for (const item of contents) {
//         const textWidth = courierFont.widthOfTextAtSize(
//           item.text,
//           item.size || this.defaultFontSize
//         );
//         let xPosition = this.leftMargin;

//         if (item.alignment === "center") {
//           xPosition = (this.pageWidth - textWidth) / 2;
//         } else if (item.alignment === "right") {
//           xPosition = this.pageWidth - textWidth - this.leftMargin;
//         }

//         page.drawText(item.text, {
//           x: xPosition,
//           y: yPosition,
//           size: item.size || this.defaultFontSize,
//           font: item.font,
//           color: rgb(0, 0, 0),
//         });

//         yPosition -= this.lineHeight;

//         if (item.text.startsWith("-")) {
//           yPosition -= 3;
//         }
//       }

//       const pdfBytes = await pdfDoc.save();

//       // Guardar el PDF usando Capacitor Filesystem
//       if (Capacitor.isNativePlatform()) {
//         const fileNameWithExt = await this.formatFileName(fileName);
//         const result = await Filesystem.writeFile({
//           path: fileNameWithExt,
//           data: Array.from(pdfBytes),
//           directory: Directory.Documents,
//           recursive: true
//         });

//         return {
//           success: true,
//           path: result.uri,
//           message: "Ticket generado exitosamente",
//         };
//       } else {
//         // Para web, creamos un blob y lo descargamos
//         const blob = new Blob([pdfBytes], { type: 'application/pdf' });
//         const url = URL.createObjectURL(blob);
//         const a = document.createElement('a');
//         a.href = url;
//         a.download = await this.formatFileName(fileName);
//         document.body.appendChild(a);
//         a.click();
//         document.body.removeChild(a);
//         URL.revokeObjectURL(url);

//         return {
//           success: true,
//           message: "Ticket generado exitosamente",
//         };
//       }
//     } catch (error) {
//       console.error("Error al generar el ticket:", error);
//       return {
//         success: false,
//         message: `Error al generar el PDF: ${
//           error instanceof Error ? error.message : String(error)
//         }`
//       };
//     }
//   }

//   /**
//    * @description Format file Name
//    * @param data : string
//    * @returns Promise<string>
//    */
//   public async formatFileName(data: string): Promise<string> {
//     return `${data.replace(/[^a-zA-Z0-9_-]/g, "_")}_ticket.pdf`;
//   }

//   /**
//    * @description Txt to PDF
//    * @param textContent
//    * @param fileName
//    * @returns Promise<PDFGenerationResult>
//    */
//   public async txtToPdf(
//     textContent: string,
//     fileName: string
//   ): Promise<PDFGenerationResult> {
//     try {
//       // Solo eliminar los \r que causan error, mantener TODO lo demás
//       textContent = textContent.replace(/\r/g, '');

//       const pdfDoc: PDFDocument = await PDFDocument.create();
//       const font = await pdfDoc.embedFont(StandardFonts.Courier); // Courier mantiene espaciado exacto

//       // Configuración
//       const pageWidth = 165; // 58mm en puntos
//       const fontSize: number = 7.3;
//       const margin: number = 5;
//       const lineHeight: number = fontSize + 2; // Un poco más de espacio entre líneas

//       // Conservar TODAS las líneas exactamente como están en el TXT
//       const lines: string[] = textContent.split("\n");

//       // Calcular el alto necesario respetando todas las líneas
//       const totalLinesHeight = lines.length * lineHeight;
//       const verticalMargin = margin * 2;
//       const pageHeight = totalLinesHeight + verticalMargin;

//       // Crear UNA SOLA PÁGINA con el alto calculado
//       const page = pdfDoc.addPage([pageWidth, pageHeight]);

//       // Dibujar el texto MANTENIENDO TODOS los espacios y formato original
//       let y: number = page.getHeight() - margin;

//       for (const line of lines) {
//         // Dibujar la línea exactamente como está (con espacios, tabs, etc.)
//         page.drawText(line, {
//           x: margin,
//           y: y,
//           size: fontSize,
//           font: font,
//           color: rgb(0, 0, 0),
//         });
//         y -= lineHeight;
//       }

//       // Guardar el PDF
//       const pdfBytes: Uint8Array = await pdfDoc.save();

//       // Guardar el PDF usando Capacitor Filesystem
//       if (Capacitor.isNativePlatform()) {
//         const fileNameWithExt = await this.formatFileName(fileName);
//         const result = await Filesystem.writeFile({
//           path: fileNameWithExt,
//           data: Array.from(pdfBytes),
//           directory: Directory.Documents,
//           recursive: true
//         });

//         return {
//           success: true,
//           path: result.uri,
//           message: "PDF térmico creado manteniendo formato original",
//         };
//       } else {
//         // Para web, creamos un blob y lo descargamos
//         const blob = new Blob([pdfBytes], { type: 'application/pdf' });
//         const url = URL.createObjectURL(blob);
//         const a = document.createElement('a');
//         a.href = url;
//         a.download = await this.formatFileName(fileName);
//         document.body.appendChild(a);
//         a.click();
//         document.body.removeChild(a);
//         URL.revokeObjectURL(url);

//         return {
//           success: true,
//           message: "PDF térmico creado manteniendo formato original",
//         };
//       }
//     } catch (error) {
//       console.error("Error al crear PDF térmico:", error);
//       return {
//         success: false,
//         message: `Error al crear el PDF: ${
//           error instanceof Error ? error.message : String(error)
//         }`
//       };
//     }
//   }
// }

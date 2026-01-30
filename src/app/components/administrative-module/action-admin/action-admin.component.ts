import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { IResponse } from 'src/app/interfaces/api/handlerResReq';
import { UbiiposService } from 'src/app/services/api/ubiipos.service';
import { PrinterService } from 'src/app/services/printer-roccia/printer.service';
import { AdministrativeRequestService } from 'src/app/services/vposuniversal/administrative-request.service';
import { AuthAdminPanelService } from 'src/app/services/api/auth-admin-panel.service';
import { CheckoutSessionService } from 'src/app/services/checkout-session.service';
import { PdfService } from 'src/app/services/api/pdf.service';
import { LocalstorageService } from 'src/app/services/localstorage.service';
import { PaymentsService } from 'src/app/services/api/payments.service';
import { DirectPrinterService } from 'src/app/services/api/direct-printer.service';
import { IPrintTicket, IClosingBatch } from 'src/app/interfaces/printer.interface';
import { handleApiError } from 'src/app/utils/api-tools';
import axios from 'axios';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-action-admin',
  templateUrl: './action-admin.component.html',
  styleUrls: ['./action-admin.component.scss']
})
export class ActionAdminComponent implements OnInit {

  @Input() isLogged: boolean = false;

  constructor(
    private _printer: PrinterService,
    private _ubiipos: UbiiposService,
    private _authService: AuthAdminPanelService,
    private _checkoutSessionService: CheckoutSessionService,
    private _pdfService: PdfService,
    private _localStorageService: LocalstorageService,
    private _paymentsService: PaymentsService,
    private _directPrinter: DirectPrinterService
  ) { }

  ngOnInit(): void {}

  public async administrativeMode(option: number){

    if (this.isLogged) {
      Swal.fire({
        title: '¿Está seguro de que desea realizar esta acción?',
        text: 'Esta acción no se puede deshacer',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Si, estoy seguro',
        cancelButtonText: 'Cancelar',
        customClass: {
          container: 'swal-admin-container'
        },
        didOpen: () => {
          const swalContainer = document.querySelector('.swal2-container') as HTMLElement;
          if (swalContainer) {
            swalContainer.style.zIndex = '10000';
          }
        }
      }).then(async (result) => {
        if (result.isConfirmed) {
          switch (option) {
            case 1:
              await this.printLastTicket()
              .then((res) => {
                this.ShowDiologSuccess(res, true);
              })
              .catch((err) => {
                this.ShowDiologError(err);
              });
              break;
            case 2:
              await this.closeBox()
              .then((res) => {
                this.ShowDiologSuccess(res);
              })
              .catch((err) => {
                this.ShowDiologError(err);
              });
              break;
            case 3:
              this.showAnulateTransactionModal();
              break;
            case 4:
              await this.refreshPosIpAndPort()
                .then((res) => {
                  if (res.success) {
                    this.ShowDiologSuccess({ status: 200, message: res.message, data: { TRANS_CODE_RESULT: '00', TRANS_MESSAGE_RESULT: res.message } });
                  } else {
                    this.ShowDiologError({ status: 400, message: res.message });
                  }
                })
                .catch((err) => {
                  this.ShowDiologError(err);
                });
              break;
            default:
              // Opcional: Manejar valores inesperados
              console.warn(`Opción ${option} no reconocida`);
              Swal.fire({
                icon: 'error',
                title: 'Opción no permitida.',
                text: 'La opción que esta intentado ejcutar no esta permitida.',
                showConfirmButton: false,
                allowOutsideClick: false,
                timer: 3000,
                didOpen: () => {
                  const swalContainer = document.querySelector('.swal2-container') as HTMLElement;
                  if (swalContainer) {
                    swalContainer.style.zIndex = '10000';
                  }
                }
              });
              break;
          }
        }
      });
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Acceso denegado',
        text: 'Debe iniciar sesión para realizar esta acción.',
        showConfirmButton: false,
        allowOutsideClick: false,
        timer: 3000,
        didOpen: () => {
          const swalContainer = document.querySelector('.swal2-container') as HTMLElement;
          if (swalContainer) {
            swalContainer.style.zIndex = '10000';
          }
        }
      });
    }
  }

  public async printLastTicket(): Promise<IResponse> {
    console.log('in printLastTicket');
    try {
      // Obtener el último voucher guardado desde localStorage
      const lastVoucher: IPrintTicket | null = this._localStorageService.get<IPrintTicket>('lastVoucher') ?? null;
      
      if (!lastVoucher) {
        Swal.fire({
          icon: 'warning',
          title: 'No hay voucher disponible',
          text: 'No se encontró ningún voucher guardado para imprimir.',
          showConfirmButton: true,
          confirmButtonText: 'Aceptar',
        });
        
        return {
          status: 404,
          message: 'No se encontró voucher guardado',
          data: null,
        };
      }

      console.log('Voucher encontrado:', lastVoucher);
      console.log('✅ Voucher encontrado - procediendo a imprimir...');
      
      // Verificar que el status del voucher sea "APROBADO"
      if (lastVoucher.status !== 'APROBADO') {
        console.warn('Voucher encontrado pero status no es APROBADO:', lastVoucher.status);
        
        Swal.fire({
          icon: 'warning',
          title: 'Voucher no válido',
          text: `El voucher no está aprobado. Status: ${lastVoucher.status}`,
          showConfirmButton: true,
          confirmButtonText: 'Aceptar',
        });
        
        return {
          status: 400,
          message: `El voucher no está aprobado. Status: ${lastVoucher.status}`,
          data: null,
        };
      }
      
      // Imprimir en la impresora térmica local
      try {
        console.log('🖨️ [Reimpresión] Imprimiendo último voucher localmente...', lastVoucher);
        
        const printResult = await this._directPrinter.printTicket(lastVoucher);
        
        if (printResult.success) {
          console.log('✅ [Reimpresión] Impreso exitosamente');
          console.log('📍 [Reimpresión] IP usada:', printResult.ip);
          
          const response: IResponse = {
            status: 200,
            message: 'OK',
            data: { success: true, message: 'Reimpresión exitosa', ip: printResult.ip },
          };
          console.log('printLastTicket - retornando response exitosa:', response);
          return response;
        } else {
          console.warn('⚠️ [Reimpresión] Error al imprimir:', printResult.message);
          throw new Error(printResult.message || 'Error al imprimir');
        }
      } catch (thermalError: any) {
        console.error('❌ [Reimpresión] Error al imprimir último voucher:', thermalError);
        
        Swal.fire({
          icon: 'error',
          title: 'Error al imprimir',
          text: thermalError?.message || 'No se pudo imprimir el voucher. Verifique la conexión con la impresora.',
          showConfirmButton: true,
          confirmButtonText: 'Aceptar',
        });
        
        return {
          status: 500,
          message: thermalError?.message || 'Error al imprimir voucher',
          data: null,
        };
      }
    } catch (error) {
      const errRes: IResponse = handleApiError(error);
      console.error('ERROR printLastTicket:', errRes);
      
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Ocurrió un error al intentar imprimir el último voucher.',
        showConfirmButton: true,
        confirmButtonText: 'Aceptar',
      });
      
      return errRes;
    }
  }

  /**
   * To close box
   * @returns
   */
  public async closeBox(): Promise<IResponse> {
    console.log('🔄 [CloseBox] Iniciando cierre de lotes...');
    try {
      // 1. Enviar cierre de lotes a Ubiipos
      console.log('🔄 [CloseBox] Enviando petición SETTLEMENT a Ubiipos...');
      const closeRes: IResponse = await this._ubiipos.closeBatch();
      console.log('✅ [CloseBox] Respuesta de Ubiipos recibida:', closeRes);
      console.log('📊 [CloseBox] Estructura de closeRes:', {
        status: closeRes.status,
        message: closeRes.message,
        tieneData: !!closeRes.data,
      });
      console.log('📊 [CloseBox] Estructura de closeRes.data:', JSON.stringify(closeRes.data, null, 2));
      
      // 2. Si el cierre fue exitoso, generar archivo en API Printer y guardarlo en BD
      if (closeRes.status === 200 || closeRes.status === 201) {
        console.log('✅ [CloseBox] Status HTTP exitoso (200/201)');
        
        // Verificar que la respuesta tenga el código de resultado exitoso
        if (closeRes.data && closeRes.data.TRANS_CODE_RESULT === '00') {
          console.log('✅ [CloseBox] TRANS_CODE_RESULT = 00 (éxito)');
          
          try {
            // Obtener checkoutIdentify
            const checkoutIdentify = this._localStorageService.get<string>('checkoutIdentify') || '';
            console.log('🔑 [CloseBox] checkoutIdentify:', checkoutIdentify);
            
            if (!checkoutIdentify) {
              console.warn('⚠️ [CloseBox] No se encontró checkoutIdentify, no se puede guardar el cierre en BD');
            } else {
              // Preparar datos para el API Printer
              console.log('📝 [CloseBox] Mapeando datos de respuesta a IClosingBatch...');
              console.log('📝 [CloseBox] Datos originales de closeRes.data:', closeRes.data);
              
              const closingData: IClosingBatch = {
                responseType: closeRes.data.RESPONSE_TYPE || 'SETTLEMENT',
                transCodeResult: closeRes.data.TRANS_CODE_RESULT,
                transMessageResult: closeRes.data.TRANS_MESSAGE_RESULT || '',
                transConfirmNum: closeRes.data.TRANS_CONFIRM_NUM,
                fecha: closeRes.data.FECHA,
                terminal: closeRes.data.TERMINAL,
                afiliado: closeRes.data.AFILIADO,
                lote: closeRes.data.LOTE,
                trace: closeRes.data.TRACE,
                referencia: closeRes.data.REFERENCIA,
                metodoEntrada: closeRes.data.METODO_ENTRADA,
                tipoTarjeta: closeRes.data.TIPO_TARJETA,
                pan: closeRes.data.PAN,
                checkoutIdentify: checkoutIdentify,
                id_sede: this._localStorageService.get<number>('id_sede') || undefined,
                closingDate: new Date().toISOString(),
                totalAmount: closeRes.data?.TOTAL_AMOUNT || closeRes.data?.totalAmount || closeRes.data?.AMOUNT || closeRes.data?.amount || undefined,
              };
              
              console.log('💰 [CloseBox] Monto total capturado:', closingData.totalAmount);
              
              console.log('✅ [CloseBox] Datos mapeados para API Printer:', JSON.stringify(closingData, null, 2));
              console.log('🔄 [CloseBox] Enviando a API Printer para generar PDF...');
              
              // 3. Generar archivo en API Printer (similar a ticketCreateAndUpload)
              const printerResult = await this._pdfService.closingCreateAndUpload(closingData);
              
              console.log('📦 [CloseBox] Respuesta de API Printer:', printerResult);
              console.log('📦 [CloseBox] Status de API Printer:', printerResult.status);
              console.log('📦 [CloseBox] Data de API Printer:', JSON.stringify(printerResult.data, null, 2));
              
              if (printerResult.status === 200 || printerResult.status === 201) {
                console.log('✅ [CloseBox] API Printer respondió exitosamente (200/201)');
                
                // Obtener la URL del archivo generado
                const fileUrl = printerResult.data?.url || printerResult.data?.data?.url || '';
                const fileName = printerResult.data?.file_name || printerResult.data?.data?.file_name || '';
                
                console.log('📄 [CloseBox] URL del archivo:', fileUrl);
                console.log('📄 [CloseBox] Nombre del archivo:', fileName);
                
                if (fileUrl && fileName) {
                  // Extraer la ruta relativa del archivo
                  let urlFile = fileUrl;
                  const filesIndex = fileUrl.indexOf('files/');
                  if (filesIndex !== -1) {
                    urlFile = fileUrl.substring(filesIndex);
                  }
                  
                  console.log('📄 [CloseBox] Ruta relativa del archivo:', urlFile);
                  
                  // 4. Guardar en API Master usando el endpoint de closing/upload
                  const closingUploadData = {
                    register: checkoutIdentify,
                    closingFiles: [
                      {
                        file_name: fileName,
                        url_file: urlFile,
                        is_closing: 1 // 1 = cierre, 0 = pre-cierre
                      }
                    ]
                  };
                  
                  console.log('💾 [CloseBox] Guardando cierre de lotes en API Master...');
                  console.log('💾 [CloseBox] Datos a enviar a API Master:', JSON.stringify(closingUploadData, null, 2));
                  console.log('💾 [CloseBox] URL de API Master:', `${environment.URL_API_MASTER}/administrative/files/closing/upload`);
                  
                  const saveResult = await axios.post(
                    `${environment.URL_API_MASTER}/administrative/files/closing/upload`,
                    closingUploadData,
                    {
                      headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'token': environment.TOKEN_API_MASTER,
                      }
                    }
                  );
                  
                  console.log('✅ [CloseBox] Cierre de lotes guardado en API Master:', saveResult);
                  console.log('✅ [CloseBox] Status HTTP de API Master:', saveResult.status);
                  console.log('✅ [CloseBox] Data de API Master:', JSON.stringify(saveResult.data, null, 2));
                } else {
                  console.warn('⚠️ [CloseBox] No se pudo obtener la URL del archivo generado por API Printer');
                  console.warn('⚠️ [CloseBox] fileUrl:', fileUrl);
                  console.warn('⚠️ [CloseBox] fileName:', fileName);
                }
              } else {
                console.warn('⚠️ [CloseBox] Error al generar archivo en API Printer:', printerResult);
                console.warn('⚠️ [CloseBox] Status:', printerResult.status);
                console.warn('⚠️ [CloseBox] Message:', printerResult.message);
              }
            }
          } catch (dbError: any) {
            console.error('❌ [CloseBox] Error al guardar cierre de lotes en BD:', dbError);
            console.error('❌ [CloseBox] Error completo:', JSON.stringify(dbError, null, 2));
            // No bloquear el flujo si falla el guardado en BD, solo loguear
          }
        } else {
          console.warn('⚠️ [CloseBox] TRANS_CODE_RESULT no es 00. Valor:', closeRes.data?.TRANS_CODE_RESULT);
        }
      } else {
        console.warn('⚠️ [CloseBox] Status HTTP no es 200/201. Status:', closeRes.status);
      }
      
      console.log('🏁 [CloseBox] Retornando respuesta final:', closeRes);
      return closeRes;
    } catch (error) {
      const errRes: IResponse = handleApiError(error);
      console.error('ERROR closeBatch:', errRes);
      return errRes;
    }
  }

  /**
   * Muestra modal para anular una transacción
   * Solicita la referencia y ejecuta la anulación vía API Ubii
   * @returns void
   */
  public async showAnulateTransactionModal(): Promise<void> {
    try {
      // Solicitar referencia de la transacción a anular
      const { value: reference } = await Swal.fire({
        title: 'Anular Transacción',
        html: `
          <div style="text-align: left; margin: 10px 0;">
            <p style="margin-bottom: 15px; color: #718096;">Ingrese el número de referencia de la transacción que desea anular.</p>
            <p style="font-size: 12px; color: #a0aec0; margin-top: 10px;">Ejemplo: 251216000079</p>
          </div>
        `,
        input: 'text',
        inputLabel: 'Número de Referencia',
        inputPlaceholder: '251216000079',
        showCancelButton: true,
        confirmButtonText: 'Anular',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#6c757d',
        inputValidator: (value) => {
          if (!value || value.trim() === '') {
            return 'Debe ingresar un número de referencia';
          }
          if (!/^\d+$/.test(value.trim())) {
            return 'La referencia debe contener solo números';
          }
          return null;
        },
        customClass: {
          popup: 'fibex-swal-popup',
          title: 'fibex-swal-title',
          htmlContainer: 'fibex-swal-html',
          input: 'fibex-input',
          inputLabel: 'fibex-input-label',
          confirmButton: 'fibex-swal-confirm-btn',
          cancelButton: 'fibex-swal-cancel-btn',
          icon: 'fibex-swal-icon'
        },
        buttonsStyling: false,
        allowOutsideClick: false,
        width: '480px',
        padding: '2rem',
        didOpen: () => {
          const swalContainer = document.querySelector('.swal2-container') as HTMLElement;
          if (swalContainer) {
            swalContainer.style.zIndex = '10000';
          }
          
          // Aplicar estilos al input
          const input = document.querySelector('.swal2-input') as HTMLInputElement;
          if (input) {
            input.classList.add('fibex-input');
            input.maxLength = 30; // Límite de 30 caracteres para referencia
            input.style.fontFamily = "'Poppins', sans-serif";
            input.style.width = "100%";
            input.style.padding = "12px 16px";
            input.style.border = "2px solid #e2e8f0";
            input.style.borderRadius = "10px";
            input.style.fontSize = "15px";
            input.style.background = "#f7fafc";
            input.style.color = "#1a202c";
            input.style.boxSizing = "border-box";
            input.style.margin = "8px 0";
          }
          
          // Aplicar estilos al botón de confirmar (Anular)
          const confirmButton = document.querySelector('.swal2-confirm') as HTMLButtonElement;
          if (confirmButton) {
            confirmButton.style.fontFamily = "'Poppins', sans-serif";
            confirmButton.style.background = "linear-gradient(135deg, #dc3545 0%, #c82333 100%)";
            confirmButton.style.backgroundImage = "linear-gradient(135deg, #dc3545 0%, #c82333 100%)";
            confirmButton.style.color = "#ffffff";
            confirmButton.style.border = "none";
            confirmButton.style.borderRadius = "12px";
            confirmButton.style.padding = "14px 28px";
            confirmButton.style.fontSize = "15px";
            confirmButton.style.fontWeight = "600";
            confirmButton.style.cursor = "pointer";
            confirmButton.style.transition = "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)";
            confirmButton.style.boxShadow = "0 4px 14px rgba(220, 53, 69, 0.4)";
            confirmButton.style.margin = "0 8px";
            confirmButton.style.minWidth = "120px";
            
            confirmButton.addEventListener('mouseenter', () => {
              confirmButton.style.transform = "translateY(-2px)";
              confirmButton.style.boxShadow = "0 8px 24px rgba(220, 53, 69, 0.5)";
              confirmButton.style.background = "linear-gradient(135deg, #c82333 0%, #dc3545 100%)";
              confirmButton.style.backgroundImage = "linear-gradient(135deg, #c82333 0%, #dc3545 100%)";
            });
            
            confirmButton.addEventListener('mouseleave', () => {
              confirmButton.style.transform = "translateY(0)";
              confirmButton.style.boxShadow = "0 4px 14px rgba(220, 53, 69, 0.4)";
              confirmButton.style.background = "linear-gradient(135deg, #dc3545 0%, #c82333 100%)";
              confirmButton.style.backgroundImage = "linear-gradient(135deg, #dc3545 0%, #c82333 100%)";
            });
          }
          
          // Aplicar estilos al botón de cancelar
          const cancelButton = document.querySelector('.swal2-cancel') as HTMLButtonElement;
          if (cancelButton) {
            cancelButton.style.fontFamily = "'Poppins', sans-serif";
            cancelButton.style.background = "#6c757d";
            cancelButton.style.color = "#ffffff";
            cancelButton.style.border = "none";
            cancelButton.style.borderRadius = "12px";
            cancelButton.style.padding = "14px 28px";
            cancelButton.style.fontSize = "15px";
            cancelButton.style.fontWeight = "600";
            cancelButton.style.cursor = "pointer";
            cancelButton.style.transition = "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)";
            cancelButton.style.boxShadow = "0 4px 14px rgba(108, 117, 125, 0.3)";
            cancelButton.style.margin = "0 8px";
            cancelButton.style.minWidth = "120px";
            
            cancelButton.addEventListener('mouseenter', () => {
              cancelButton.style.transform = "translateY(-2px)";
              cancelButton.style.boxShadow = "0 8px 24px rgba(108, 117, 125, 0.4)";
              cancelButton.style.background = "#5a6268";
            });
            
            cancelButton.addEventListener('mouseleave', () => {
              cancelButton.style.transform = "translateY(0)";
              cancelButton.style.boxShadow = "0 4px 14px rgba(108, 117, 125, 0.3)";
              cancelButton.style.background = "#6c757d";
            });
          }
          
          // Aplicar estilos al label del input
          const inputLabel = document.querySelector('.swal2-input-label') as HTMLElement;
          if (inputLabel) {
            inputLabel.style.fontFamily = "'Poppins', sans-serif";
            inputLabel.style.fontSize = "14px";
            inputLabel.style.fontWeight = "600";
            inputLabel.style.color = "#1a202c";
            inputLabel.style.marginBottom = "8px";
            inputLabel.style.display = "block";
            inputLabel.style.textAlign = "left";
          }
        }
      });

      if (!reference) {
        return; // Usuario canceló
      }

      // Mostrar loading
      Swal.fire({
        title: 'Anulando transacción...',
        html: `
          <div style="text-align: left; margin: 10px 0;">
            <p style="margin: 10px 0;">Procesando anulación de:</p>
            <p style="margin: 10px 0;"><strong>Referencia:</strong> ${reference}</p>
            <p style="margin-top: 15px; color: #357CFF; font-weight: 500;">Por favor espere...</p>
          </div>
        `,
        customClass: {
          popup: 'fibex-swal-popup',
          title: 'fibex-swal-title',
          htmlContainer: 'fibex-swal-html',
          icon: 'fibex-swal-icon'
        },
        buttonsStyling: false,
        allowOutsideClick: false,
        allowEscapeKey: false,
        width: '480px',
        padding: '2rem',
        didOpen: () => {
          Swal.showLoading();
          const swalContainer = document.querySelector('.swal2-container') as HTMLElement;
          if (swalContainer) {
            swalContainer.style.zIndex = '10000';
          }
        }
      });

      // Ejecutar anulación
      const voidResult = await this._ubiipos.voidTransaction(reference.trim());

      // Cerrar loading
      await Swal.close();

      // Verificar resultado
      if (voidResult.status === 200 && voidResult.data?.TRANS_CODE_RESULT === '00') {
        // Anulación exitosa
        Swal.fire({
          icon: 'success',
          title: 'Transacción Anulada',
          html: `
            <div style="text-align: left; margin: 10px 0;">
              <p style="color: #28a745; font-weight: 500; margin-bottom: 10px;">La transacción ha sido anulada exitosamente.</p>
              <p style="margin: 5px 0;"><strong>Referencia:</strong> ${reference}</p>
              <p style="margin: 5px 0;"><strong>Confirmación:</strong> ${voidResult.data?.TRANS_CONFIRM_NUM || 'N/A'}</p>
              <p style="margin-top: 15px; color: #718096; font-size: 13px;">Recuerde realizar la modificación correspondiente en SAE PLUS.</p>
            </div>
          `,
          confirmButtonText: 'Aceptar',
          customClass: {
            popup: 'fibex-swal-popup',
            title: 'fibex-swal-title',
            htmlContainer: 'fibex-swal-html',
            confirmButton: 'fibex-swal-confirm-btn',
            icon: 'fibex-swal-icon'
          },
          buttonsStyling: false,
          allowOutsideClick: false,
          width: '480px',
          padding: '2rem',
          didOpen: () => {
            const swalContainer = document.querySelector('.swal2-container') as HTMLElement;
            if (swalContainer) {
              swalContainer.style.zIndex = '10000';
            }
          }
        });
      } else {
        // Error en anulación
        const errorMessage = voidResult.data?.TRANS_MESSAGE_RESULT || voidResult.message || 'Error desconocido';
        Swal.fire({
          icon: 'error',
          title: 'Error al Anular',
          html: `
            <div style="text-align: left; margin: 10px 0;">
              <p style="color: #dc3545; font-weight: 500; margin-bottom: 10px;">No se pudo anular la transacción.</p>
              <p style="margin: 5px 0;"><strong>Referencia:</strong> ${reference}</p>
              <p style="margin: 5px 0;"><strong>Error:</strong> ${errorMessage}</p>
              <p style="margin-top: 15px; color: #718096; font-size: 13px;">Verifique que la referencia sea correcta y que la transacción esté en estado válido para anulación.</p>
            </div>
          `,
          confirmButtonText: 'Aceptar',
          customClass: {
            popup: 'fibex-swal-popup',
            title: 'fibex-swal-title',
            htmlContainer: 'fibex-swal-html',
            confirmButton: 'fibex-swal-confirm-btn',
            icon: 'fibex-swal-icon'
          },
          buttonsStyling: false,
          allowOutsideClick: false,
          width: '480px',
          padding: '2rem',
          didOpen: () => {
            const swalContainer = document.querySelector('.swal2-container') as HTMLElement;
            if (swalContainer) {
              swalContainer.style.zIndex = '10000';
            }
          }
        });
      }
    } catch (error: any) {
      await Swal.close();
      
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error?.message || 'Ocurrió un error al intentar anular la transacción.',
        confirmButtonText: 'Aceptar',
        customClass: {
          popup: 'fibex-swal-popup',
          title: 'fibex-swal-title',
          htmlContainer: 'fibex-swal-html',
          confirmButton: 'fibex-swal-confirm-btn',
          icon: 'fibex-swal-icon'
        },
        buttonsStyling: false,
        allowOutsideClick: false,
        width: '480px',
        padding: '2rem',
        didOpen: () => {
          const swalContainer = document.querySelector('.swal2-container') as HTMLElement;
          if (swalContainer) {
            swalContainer.style.zIndex = '10000';
          }
        }
      });
    }
  }

  /**
   * Function to get the current MAC-ADDRESS
   * @param type Type of string
   */
  public async getMacAddress(){
    const macaddress: string = await this._printer.getMacAddress();
    console.log('macaddress', macaddress);
    return macaddress;
  }

  /**
   * To show dialog success
   * @param dataRes
   */
  private ShowDiologSuccess(dataRes: IResponse, printer: boolean = false){
    console.log('ShowDiologSuccess - dataRes:', dataRes);
    console.log('ShowDiologSuccess - printer:', printer);
    console.log('ShowDiologSuccess - dataRes.message:', dataRes.message);
    let responseCode: string = '';
    let message: string = '';

    // 1. Extract response code and message
    if (printer) {
      // Normalizar el mensaje para comparación (trim y mayúsculas)
      const normalizedMessage = (dataRes.message || '').toString().trim().toUpperCase();
      console.log('ShowDiologSuccess - normalizedMessage:', normalizedMessage);
      console.log('ShowDiologSuccess - dataRes.status:', dataRes.status);
      
      // Verificar si el mensaje es 'OK' (indica que el voucher se encontró y se envió a imprimir)
      // La verificación principal es por lastVoucher, no por status HTTP
      if (normalizedMessage === 'OK') {
        // Si el mensaje es OK, significa que el voucher se encontró y se imprimió
        message = 'Ticket impreso.';
        responseCode = '00';
      } else if (normalizedMessage === 'PRINTER_NO_PAPER') {
        message = 'La impresora no tiene papel.';
        responseCode = '';
      } else {
        // Si no es OK ni PRINTER_NO_PAPER, hay un error o no se encontró el voucher
        message = 'No hay ticket para imprimir. Realice una transacción primero.';
        responseCode = '';
      }
      
      console.log('ShowDiologSuccess - message final:', message);
      console.log('ShowDiologSuccess - responseCode final:', responseCode);
    } else {
      responseCode = dataRes.data.TRANS_CODE_RESULT;
      message = dataRes.data.TRANS_MESSAGE_RESULT || '¡Acción exitosa!';
    }

    // 2. Handle success case (code '00')
    if (responseCode === '00') {
      Swal.fire({
        icon: 'success',
        title: 'Acción realizada exitosamente\n'+message,
        showConfirmButton: false,
        allowOutsideClick: false,
        timer: 4000,
        customClass: {
          container: 'fibex-swal-container-admin'
        },
        didOpen: () => {
          const swalContainer = document.querySelector('.swal2-container') as HTMLElement;
          if (swalContainer) {
            swalContainer.style.zIndex = '10000';
          }
        }
      });
    }
    // 3. Handle other cases
    else {

      Swal.fire({
        icon: 'warning',
        title: 'Solicitud no procesada.\n'+message,
        showConfirmButton: false,
        allowOutsideClick: false,
        timer: 5000,
        customClass: {
          container: 'fibex-swal-container-admin'
        },
        didOpen: () => {
          const swalContainer = document.querySelector('.swal2-container') as HTMLElement;
          if (swalContainer) {
            swalContainer.style.zIndex = '10000';
          }
        }
        // didClose: () => resolve()
      });
    }
  }

  /**
   * To show dialog error
   * @param dataErr
   */
  private ShowDiologError(dataErr: IResponse){
    // 4. Handle request errors
    let _messageError: string = 'Ha ocurrido un error.';
    let timeShow: number = 4000;

    Swal.fire({
      icon: 'error',
      title: _messageError +'\n'+ dataErr.message,
      showConfirmButton: false,
      allowOutsideClick: false,
      timer: timeShow,
      customClass: {
        container: 'fibex-swal-container-admin'
      },
      didOpen: () => {
        const swalContainer = document.querySelector('.swal2-container') as HTMLElement;
        if (swalContainer) {
          swalContainer.style.zIndex = '10000';
        }
      }
      // didClose: () => resolve()
    });
  }

  /**
   * Muestra un formulario para que el usuario ingrese la nueva IP y puerto del POS
   * @returns Promise con el resultado de la operación
   */
  public async refreshPosIpAndPort(): Promise<{ success: boolean; message: string }> {
    try {
      // Obtener la sesión actual
      const session = this._checkoutSessionService.getSession();
      
      if (!session || !session.id_pos_device) {
        return {
          success: false,
          message: 'No hay una sesión activa o no se encontró el dispositivo POS asignado.'
        };
      }

      // Extraer IP y puerto actuales de la sesión
      const currentHost = session.ubiiposHost;
      const currentIpMatch = currentHost.match(/http:\/\/([^:]+):(\d+)/);
      const currentIp = currentIpMatch ? currentIpMatch[1] : '';
      const currentPort = currentIpMatch ? parseInt(currentIpMatch[2]) : null;

      // Expresión regular para validar IPv4
      const ipRegex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

      // Mostrar formulario con Swal
      const { value: formValues } = await Swal.fire({
        title: 'Actualizar IP y Puerto del POS',
        html: `
          <div style="text-align: left; margin: 0;">
            <div style="background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%); padding: 12px 16px; border-radius: 10px; margin-bottom: 20px; border-left: 4px solid #357CFF;">
              <p style="margin: 0; color: #4a5568; font-size: 13px; font-weight: 500;">
                <span style="color: #357CFF; font-weight: 600;">📡 Configuración actual:</span>
                <span style="color: #1a202c; font-weight: 600; margin-left: 8px;">${currentHost}</span>
              </p>
            </div>
            
            <div style="margin-bottom: 20px;">
              <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #1a202c; font-size: 14px; font-family: 'Poppins', sans-serif;">
                <span style="color: #357CFF; margin-right: 6px;">🌐</span>Dirección IP:
              </label>
              <input 
                id="swal-input-ip" 
                class="swal2-input fibex-input" 
                type="text" 
                placeholder="192.168.1.1" 
                value="${currentIp}"
                maxlength="15"
                style="width: 100%; padding: 12px 16px; border: 2px solid #e2e8f0; border-radius: 10px; font-size: 15px; font-family: 'Poppins', sans-serif; background: #f7fafc; color: #1a202c; transition: all 0.3s ease; outline: none; box-sizing: border-box;"
              >
            </div>
            
            <div style="margin-bottom: 15px;">
              <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #1a202c; font-size: 14px; font-family: 'Poppins', sans-serif;">
                <span style="color: #357CFF; margin-right: 6px;">🔌</span>Puerto:
              </label>
              <input 
                id="swal-input-port" 
                class="swal2-input fibex-input" 
                type="number" 
                placeholder="4080" 
                value="${currentPort || ''}"
                min="1" 
                max="65535"
                maxlength="5"
                style="width: 100%; padding: 12px 16px; border: 2px solid #e2e8f0; border-radius: 10px; font-size: 15px; font-family: 'Poppins', sans-serif; background: #f7fafc; color: #1a202c; transition: all 0.3s ease; outline: none; box-sizing: border-box;"
              >
            </div>
            
            <div id="swal-validation-message" style="margin-top: 12px; padding: 10px 14px; background: #fff5f5; border-left: 4px solid #f56565; border-radius: 6px; display: none; font-size: 13px; color: #c53030; font-weight: 500; font-family: 'Poppins', sans-serif;"></div>
          </div>
        `,
        customClass: {
          popup: 'fibex-swal-popup',
          title: 'fibex-swal-title',
          htmlContainer: 'fibex-swal-html',
          container: 'fibex-swal-container-admin',
          confirmButton: 'fibex-swal-confirm-btn',
          cancelButton: 'fibex-swal-cancel-btn'
        },
        buttonsStyling: false,
        showCancelButton: true,
        confirmButtonText: 'Guardar y Probar Conexión',
        cancelButtonText: 'Cancelar',
        allowOutsideClick: false,
        allowEscapeKey: true,
        width: '500px',
        padding: '2rem',
        didOpen: () => {
          const swalContainer = document.querySelector('.swal2-container') as HTMLElement;
          if (swalContainer) {
            swalContainer.style.zIndex = '10000';
          }
          
          // Aplicar estilos a los botones
          const confirmButton = document.querySelector('.swal2-confirm') as HTMLButtonElement;
          const cancelButton = document.querySelector('.swal2-cancel') as HTMLButtonElement;
          
          if (confirmButton) {
            confirmButton.style.fontFamily = "'Poppins', sans-serif";
            confirmButton.style.background = "linear-gradient(135deg, #357CFF 0%, #2d9ae2 100%)";
            confirmButton.style.color = "#ffffff";
            confirmButton.style.border = "none";
            confirmButton.style.borderRadius = "12px";
            confirmButton.style.padding = "14px 28px";
            confirmButton.style.fontSize = "15px";
            confirmButton.style.fontWeight = "600";
            confirmButton.style.cursor = "pointer";
            confirmButton.style.transition = "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)";
            confirmButton.style.boxShadow = "0 4px 14px rgba(53, 124, 255, 0.4)";
            confirmButton.style.margin = "0 8px";
            confirmButton.style.minWidth = "180px";
            
            confirmButton.addEventListener('mouseenter', () => {
              confirmButton.style.transform = "translateY(-2px)";
              confirmButton.style.boxShadow = "0 8px 24px rgba(53, 124, 255, 0.5)";
              confirmButton.style.background = "linear-gradient(135deg, #2d9ae2 0%, #357CFF 100%)";
            });
            
            confirmButton.addEventListener('mouseleave', () => {
              confirmButton.style.transform = "translateY(0)";
              confirmButton.style.boxShadow = "0 4px 14px rgba(53, 124, 255, 0.4)";
              confirmButton.style.background = "linear-gradient(135deg, #357CFF 0%, #2d9ae2 100%)";
            });
            
            confirmButton.addEventListener('mousedown', () => {
              confirmButton.style.transform = "translateY(0)";
            });
          }
          
          if (cancelButton) {
            cancelButton.style.fontFamily = "'Poppins', sans-serif";
            cancelButton.style.background = "#6c757d";
            cancelButton.style.color = "#ffffff";
            cancelButton.style.border = "none";
            cancelButton.style.borderRadius = "12px";
            cancelButton.style.padding = "14px 28px";
            cancelButton.style.fontSize = "15px";
            cancelButton.style.fontWeight = "600";
            cancelButton.style.cursor = "pointer";
            cancelButton.style.transition = "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)";
            cancelButton.style.boxShadow = "0 4px 14px rgba(108, 117, 125, 0.3)";
            cancelButton.style.margin = "0 8px";
            cancelButton.style.minWidth = "120px";
            
            cancelButton.addEventListener('mouseenter', () => {
              cancelButton.style.transform = "translateY(-2px)";
              cancelButton.style.boxShadow = "0 8px 24px rgba(108, 117, 125, 0.4)";
              cancelButton.style.background = "#5a6268";
            });
            
            cancelButton.addEventListener('mouseleave', () => {
              cancelButton.style.transform = "translateY(0)";
              cancelButton.style.boxShadow = "0 4px 14px rgba(108, 117, 125, 0.3)";
              cancelButton.style.background = "#6c757d";
            });
            
            cancelButton.addEventListener('mousedown', () => {
              cancelButton.style.transform = "translateY(0)";
            });
          }
          
          // Agregar validación en tiempo real y estilos interactivos
          const ipInput = document.getElementById('swal-input-ip') as HTMLInputElement;
          const portInput = document.getElementById('swal-input-port') as HTMLInputElement;
          const validationMsg = document.getElementById('swal-validation-message') as HTMLElement;
          const confirmBtn = document.querySelector('.swal2-confirm') as HTMLButtonElement;

          // Función para aplicar estilos de focus
          const applyFocusStyle = (input: HTMLInputElement) => {
            input.style.borderColor = '#357CFF';
            input.style.background = '#ffffff';
            input.style.boxShadow = '0 0 0 4px rgba(53, 124, 255, 0.1)';
          };

          // Función para aplicar estilos de blur
          const applyBlurStyle = (input: HTMLInputElement) => {
            input.style.borderColor = '#e2e8f0';
            input.style.background = '#f7fafc';
            input.style.boxShadow = 'none';
          };

          // Función para aplicar estilos de error
          const applyErrorStyle = (input: HTMLInputElement) => {
            input.style.borderColor = '#f56565';
            input.style.background = '#fff5f5';
          };

          // Event listeners para estilos interactivos
          ipInput.addEventListener('focus', () => applyFocusStyle(ipInput));
          ipInput.addEventListener('blur', () => {
            applyBlurStyle(ipInput);
            validateInputs();
          });

          portInput.addEventListener('focus', () => applyFocusStyle(portInput));
          portInput.addEventListener('blur', () => {
            applyBlurStyle(portInput);
            validateInputs();
          });

          const validateInputs = () => {
            const ip = ipInput.value.trim();
            const port = parseInt(portInput.value);
            let isValid = true;

            // Resetear estilos
            applyBlurStyle(ipInput);
            applyBlurStyle(portInput);

            if (!ip || !port) {
              validationMsg.textContent = '⚠️ Por favor, complete ambos campos.';
              validationMsg.style.display = 'block';
              if (!ip) applyErrorStyle(ipInput);
              if (!port) applyErrorStyle(portInput);
              if (confirmBtn) {
                confirmBtn.disabled = true;
                confirmBtn.style.opacity = '0.6';
                confirmBtn.style.cursor = 'not-allowed';
              }
              isValid = false;
            } else if (port < 1 || port > 65535) {
              validationMsg.textContent = '⚠️ El puerto debe ser un número entre 1 y 65535.';
              validationMsg.style.display = 'block';
              applyErrorStyle(portInput);
              if (confirmBtn) {
                confirmBtn.disabled = true;
                confirmBtn.style.opacity = '0.6';
                confirmBtn.style.cursor = 'not-allowed';
              }
              isValid = false;
            } else if (!ipRegex.test(ip)) {
              validationMsg.textContent = '❌ Formato de IP inválido. Debe ser X.X.X.X (Ej: 192.168.1.1).';
              validationMsg.style.display = 'block';
              applyErrorStyle(ipInput);
              if (confirmBtn) {
                confirmBtn.disabled = true;
                confirmBtn.style.opacity = '0.6';
                confirmBtn.style.cursor = 'not-allowed';
              }
              isValid = false;
            } else {
              validationMsg.style.display = 'none';
              if (confirmBtn) {
                confirmBtn.disabled = false;
                confirmBtn.style.opacity = '1';
                confirmBtn.style.cursor = 'pointer';
              }
              isValid = true;
            }

            return isValid;
          };

          ipInput.addEventListener('input', validateInputs);
          portInput.addEventListener('input', validateInputs);
          validateInputs(); // Validar inicialmente
        },
        preConfirm: () => {
          const ipInput = document.getElementById('swal-input-ip') as HTMLInputElement;
          const portInput = document.getElementById('swal-input-port') as HTMLInputElement;
          const ip = ipInput.value.trim();
          const port = parseInt(portInput.value);

          if (!ip || !port) {
            Swal.showValidationMessage('Por favor, complete ambos campos.');
            return false;
          }

          if (port < 1 || port > 65535) {
            Swal.showValidationMessage('El puerto debe ser un número entre 1 y 65535.');
            return false;
          }

          if (!ipRegex.test(ip)) {
            Swal.showValidationMessage('Formato de IP inválido. Debe ser X.X.X.X (Ej: 192.168.1.1).');
            return false;
          }

          return { ip, port };
        }
      });

      // Si el usuario canceló
      if (!formValues) {
        return {
          success: false,
          message: 'Operación cancelada por el usuario.'
        };
      }

      const { ip, port } = formValues as { ip: string; port: number };
      const newHost = `http://${ip}:${port}`;

      // Mostrar loading mientras se prueba la conexión
      Swal.fire({
        title: 'Probando conexión...',
        html: `
          <div style="text-align: left; margin: 10px 0;">
            <p style="color: #357CFF; font-weight: 500;">Verificando conexión con:</p>
            <p style="margin: 10px 0;"><strong>🌐 IP:</strong> ${ip}:${port}</p>
            <p style="margin-top: 15px; color: #357CFF; font-weight: 500;">Por favor espere...</p>
          </div>
        `,
        customClass: {
          popup: 'fibex-swal-popup',
          title: 'fibex-swal-title',
          htmlContainer: 'fibex-swal-html',
          container: 'fibex-swal-container-admin'
        },
        buttonsStyling: false,
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => {
          Swal.showLoading();
          const swalContainer = document.querySelector('.swal2-container') as HTMLElement;
          if (swalContainer) {
            swalContainer.style.zIndex = '10000';
          }
        }
      });

      // Esperar un momento para que el Swal se muestre
      await new Promise(resolve => setTimeout(resolve, 300));

      // Probar conexión con la nueva IP y puerto
      let connectionTest: IResponse;
      try {
        connectionTest = await this._ubiipos.testUbiipos(newHost);
      } catch (error) {
        await Swal.close();
        const errRes: IResponse = handleApiError(error);
        await Swal.fire({
          icon: 'error',
          title: 'Error de conexión',
          html: `
            <div style="text-align: left; margin: 10px 0;">
              <p style="color: #dc3545; font-weight: 500; margin-bottom: 10px;">No se pudo establecer conexión con el POS.</p>
              <p style="color: #4a5568; font-size: 14px; margin: 5px 0;"><strong>IP:</strong> ${ip}</p>
              <p style="color: #4a5568; font-size: 14px; margin: 5px 0;"><strong>Puerto:</strong> ${port}</p>
              <p style="color: #718096; font-size: 13px; margin-top: 15px;">${errRes.message || 'Verifique que la IP y el puerto sean correctos y que el servicio esté activo.'}</p>
            </div>
          `,
          customClass: {
            popup: 'fibex-swal-popup',
            title: 'fibex-swal-title',
            htmlContainer: 'fibex-swal-html',
            container: 'fibex-swal-container-admin',
            confirmButton: 'fibex-swal-confirm-btn'
          },
          buttonsStyling: false,
          confirmButtonText: 'Entendido',
          allowOutsideClick: false,
          width: '480px',
          padding: '2rem',
          didOpen: () => {
            const swalContainer = document.querySelector('.swal2-container') as HTMLElement;
            if (swalContainer) {
              swalContainer.style.zIndex = '10000';
            }
            const confirmBtn = document.querySelector('.swal2-confirm') as HTMLButtonElement;
            if (confirmBtn) {
              confirmBtn.style.fontFamily = "'Poppins', sans-serif";
              confirmBtn.style.background = "linear-gradient(135deg, #357CFF 0%, #2d9ae2 100%)";
              confirmBtn.style.color = "#ffffff";
              confirmBtn.style.border = "none";
              confirmBtn.style.borderRadius = "12px";
              confirmBtn.style.padding = "14px 28px";
              confirmBtn.style.fontSize = "15px";
              confirmBtn.style.fontWeight = "600";
              confirmBtn.style.cursor = "pointer";
              confirmBtn.style.transition = "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)";
              confirmBtn.style.boxShadow = "0 4px 14px rgba(53, 124, 255, 0.4)";
            }
          }
        });
        return {
          success: false,
          message: `Error de conexión: ${errRes.message || 'No se pudo conectar con el POS'}`
        };
      }

      if (connectionTest.status !== 200) {
        await Swal.close();
        await Swal.fire({
          icon: 'error',
          title: 'Conexión fallida',
          html: `
            <div style="text-align: left; margin: 10px 0;">
              <p style="color: #dc3545; font-weight: 500; margin-bottom: 10px;">No se pudo conectar con la nueva configuración del POS.</p>
              <p style="color: #4a5568; font-size: 14px; margin: 5px 0;"><strong>IP:</strong> ${ip}</p>
              <p style="color: #4a5568; font-size: 14px; margin: 5px 0;"><strong>Puerto:</strong> ${port}</p>
              <p style="color: #718096; font-size: 13px; margin-top: 15px;">${connectionTest.message || 'Verifique que la IP y el puerto sean correctos y que el servicio esté activo.'}</p>
              <p style="color: #718096; font-size: 13px; margin-top: 10px;">Código de error: ${connectionTest.status}</p>
            </div>
          `,
          customClass: {
            popup: 'fibex-swal-popup',
            title: 'fibex-swal-title',
            htmlContainer: 'fibex-swal-html',
            container: 'fibex-swal-container-admin',
            confirmButton: 'fibex-swal-confirm-btn'
          },
          buttonsStyling: false,
          confirmButtonText: 'Entendido',
          allowOutsideClick: false,
          width: '480px',
          padding: '2rem',
          didOpen: () => {
            const swalContainer = document.querySelector('.swal2-container') as HTMLElement;
            if (swalContainer) {
              swalContainer.style.zIndex = '10000';
            }
            const confirmBtn = document.querySelector('.swal2-confirm') as HTMLButtonElement;
            if (confirmBtn) {
              confirmBtn.style.fontFamily = "'Poppins', sans-serif";
              confirmBtn.style.background = "linear-gradient(135deg, #357CFF 0%, #2d9ae2 100%)";
              confirmBtn.style.color = "#ffffff";
              confirmBtn.style.border = "none";
              confirmBtn.style.borderRadius = "12px";
              confirmBtn.style.padding = "14px 28px";
              confirmBtn.style.fontSize = "15px";
              confirmBtn.style.fontWeight = "600";
              confirmBtn.style.cursor = "pointer";
              confirmBtn.style.transition = "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)";
              confirmBtn.style.boxShadow = "0 4px 14px rgba(53, 124, 255, 0.4)";
            }
          }
        });
        return {
          success: false,
          message: `No se pudo conectar con la nueva configuración. ${connectionTest.message || 'Verifique que la IP y el puerto sean correctos y que el servicio esté activo.'}`
        };
      }

      // Obtener información del POS para actualizar en la API
      let posDevice;
      try {
        posDevice = await this._authService.getPosDeviceById(session.id_pos_device);
      } catch (error) {
        console.warn('No se pudo obtener información del POS desde la API:', error);
      }
      
      // Actualizar en la API si es necesario
      if (posDevice && (posDevice.ip_address !== ip || posDevice.port !== port)) {
        try {
          const updateSuccess = await this._authService.updatePosIpAndPort(session.id_pos_device, ip, port);
          if (!updateSuccess) {
            console.warn('No se pudo actualizar en la API, pero se actualizará la sesión local.');
          }
        } catch (error) {
          console.warn('Error al actualizar en la API:', error);
        }
      }

      // Actualizar la sesión con la nueva información
      try {
        this._checkoutSessionService.saveSession({
          id_sede: session.id_sede,
          id_checkout: session.id_checkout,
          checkoutIdentify: session.checkoutIdentify,
          ubiiposHost: newHost,
          terminalVirtual: posDevice?.terminalVirtual || session.terminalVirtual,
          id_pos_device: session.id_pos_device
        });
      } catch (error) {
        await Swal.close();
        await Swal.fire({
          icon: 'error',
          title: 'Error al guardar',
          html: `
            <div style="text-align: left; margin: 10px 0;">
              <p style="color: #dc3545; font-weight: 500;">No se pudo guardar la nueva configuración en la sesión local.</p>
              <p style="color: #718096; font-size: 13px; margin-top: 10px;">Por favor, intente nuevamente.</p>
            </div>
          `,
          customClass: {
            popup: 'fibex-swal-popup',
            title: 'fibex-swal-title',
            htmlContainer: 'fibex-swal-html',
            container: 'fibex-swal-container-admin',
            confirmButton: 'fibex-swal-confirm-btn'
          },
          buttonsStyling: false,
          confirmButtonText: 'Entendido',
          allowOutsideClick: false,
          width: '480px',
          padding: '2rem',
          didOpen: () => {
            const swalContainer = document.querySelector('.swal2-container') as HTMLElement;
            if (swalContainer) {
              swalContainer.style.zIndex = '10000';
            }
            const confirmBtn = document.querySelector('.swal2-confirm') as HTMLButtonElement;
            if (confirmBtn) {
              confirmBtn.style.fontFamily = "'Poppins', sans-serif";
              confirmBtn.style.background = "linear-gradient(135deg, #357CFF 0%, #2d9ae2 100%)";
              confirmBtn.style.color = "#ffffff";
              confirmBtn.style.border = "none";
              confirmBtn.style.borderRadius = "12px";
              confirmBtn.style.padding = "14px 28px";
              confirmBtn.style.fontSize = "15px";
              confirmBtn.style.fontWeight = "600";
              confirmBtn.style.cursor = "pointer";
              confirmBtn.style.transition = "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)";
              confirmBtn.style.boxShadow = "0 4px 14px rgba(53, 124, 255, 0.4)";
            }
          }
        });
        return {
          success: false,
          message: 'Error al guardar la configuración en la sesión local.'
        };
      }

      await Swal.close();

      // Mostrar mensaje de éxito
      await Swal.fire({
        icon: 'success',
        title: 'Configuración actualizada',
        html: `
          <div style="text-align: left; margin: 10px 0;">
            <p style="color: #28a745; font-weight: 500; margin-bottom: 10px;">IP y puerto actualizados exitosamente.</p>
            <p style="color: #4a5568; font-size: 14px; margin: 5px 0;"><strong>Nueva configuración:</strong> ${newHost}</p>
            <p style="color: #718096; font-size: 13px; margin-top: 15px;">La conexión con el POS ha sido verificada y la configuración ha sido guardada.</p>
          </div>
        `,
        customClass: {
          popup: 'fibex-swal-popup',
          title: 'fibex-swal-title',
          htmlContainer: 'fibex-swal-html',
          container: 'fibex-swal-container-admin',
          confirmButton: 'fibex-swal-confirm-btn'
        },
        buttonsStyling: false,
        confirmButtonText: 'Entendido',
        allowOutsideClick: false,
        timer: 3000,
        width: '480px',
        padding: '2rem',
        didOpen: () => {
          const swalContainer = document.querySelector('.swal2-container') as HTMLElement;
          if (swalContainer) {
            swalContainer.style.zIndex = '10000';
          }
          const confirmBtn = document.querySelector('.swal2-confirm') as HTMLButtonElement;
          if (confirmBtn) {
            confirmBtn.style.fontFamily = "'Poppins', sans-serif";
            confirmBtn.style.background = "linear-gradient(135deg, #357CFF 0%, #2d9ae2 100%)";
            confirmBtn.style.color = "#ffffff";
            confirmBtn.style.border = "none";
            confirmBtn.style.borderRadius = "12px";
            confirmBtn.style.padding = "14px 28px";
            confirmBtn.style.fontSize = "15px";
            confirmBtn.style.fontWeight = "600";
            confirmBtn.style.cursor = "pointer";
            confirmBtn.style.transition = "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)";
            confirmBtn.style.boxShadow = "0 4px 14px rgba(53, 124, 255, 0.4)";
          }
        }
      });

      return {
        success: true,
        message: `IP y puerto actualizados exitosamente. Nueva configuración: ${newHost}`
      };

    } catch (error) {
      // Cerrar cualquier Swal abierto
      await Swal.close();
      
      const errRes: IResponse = handleApiError(error);
      console.error('ERROR refreshPosIpAndPort:', errRes);
      
      // Mostrar error en Swal
      await Swal.fire({
        icon: 'error',
        title: 'Error inesperado',
        html: `
          <div style="text-align: left; margin: 10px 0;">
            <p style="color: #dc3545; font-weight: 500; margin-bottom: 10px;">Ha ocurrido un error inesperado al actualizar la configuración.</p>
            <p style="color: #718096; font-size: 13px; margin-top: 10px;">${errRes.message || 'Por favor, intente nuevamente más tarde.'}</p>
          </div>
        `,
        customClass: {
          popup: 'fibex-swal-popup',
          title: 'fibex-swal-title',
          htmlContainer: 'fibex-swal-html',
          container: 'fibex-swal-container-admin',
          confirmButton: 'fibex-swal-confirm-btn'
        },
        buttonsStyling: false,
        confirmButtonText: 'Entendido',
        allowOutsideClick: false,
        width: '480px',
        padding: '2rem',
        didOpen: () => {
          const swalContainer = document.querySelector('.swal2-container') as HTMLElement;
          if (swalContainer) {
            swalContainer.style.zIndex = '10000';
          }
          const confirmBtn = document.querySelector('.swal2-confirm') as HTMLButtonElement;
          if (confirmBtn) {
            confirmBtn.style.fontFamily = "'Poppins', sans-serif";
            confirmBtn.style.background = "linear-gradient(135deg, #357CFF 0%, #2d9ae2 100%)";
            confirmBtn.style.color = "#ffffff";
            confirmBtn.style.border = "none";
            confirmBtn.style.borderRadius = "12px";
            confirmBtn.style.padding = "14px 28px";
            confirmBtn.style.fontSize = "15px";
            confirmBtn.style.fontWeight = "600";
            confirmBtn.style.cursor = "pointer";
            confirmBtn.style.transition = "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)";
            confirmBtn.style.boxShadow = "0 4px 14px rgba(53, 124, 255, 0.4)";
          }
        }
      });
      
      return {
        success: false,
        message: `Error al actualizar IP y puerto: ${errRes.message}`
      };
    }
  }
}

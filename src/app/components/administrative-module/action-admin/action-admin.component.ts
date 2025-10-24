import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { IResponse } from 'src/app/interfaces/api/handlerResReq';
import { UbiiposService } from 'src/app/services/api/ubiipos.service';
import { PrinterService } from 'src/app/services/printer-roccia/printer.service';
import { AdministrativeRequestService } from 'src/app/services/vposuniversal/administrative-request.service';
import { handleApiError } from 'src/app/utils/api-tools';
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
            default:
              // Opcional: Manejar valores inesperados
              console.warn(`Opción ${option} no reconocida`);
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
      });
    }
  }

  public async printLastTicket(): Promise<IResponse> {
    console.log('in printLastTicket');
    alert('Imprimiendo último ticket...');
    try {
      const printTicket: IResponse = await this._ubiipos.printTicket();
      console.log('printTicket', printTicket);
      return printTicket;
    } catch (error) {
      const errRes: IResponse = handleApiError(error);
      console.error('ERROR closeBatch:', errRes);
      return errRes;
    }
  }

  /**
   * To close box
   * @returns
   */
  public async closeBox(): Promise<IResponse> {
    console.log('in closeBatch');
    alert('Cerrando caja...');
    try {
      const closeRes: IResponse = await this._ubiipos.closeBatch();
      console.log('closeRes', closeRes);
      return closeRes;
    } catch (error) {
      const errRes: IResponse = handleApiError(error);
      console.error('ERROR closeBatch:', errRes);
      return errRes;
    }
  }

  /**
   * To show modal to anulate transaction
   * @returns ci, numSeq
   */
  public async showAnulateTransactionModal(): Promise<void | string> {
    Swal.fire({
      icon: 'warning',
      title: 'Anulación de transacciones',
      text: 'Esta acción debe realizarse desde el sistema Ubiipos a traves del punto de venta dedes el menu de acciones.',
      showConfirmButton: false,
      allowOutsideClick: false,
      timer: 6000,
    });
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
    console.log('dataRes', dataRes);
    let responseCode: string = '';
    let message: string = '';

    // 1. Extract response code and message
    if (printer) {
      message = dataRes.message === 'PRINTER_NO_PAPER' ? 'La impresora no tiene papel.' : dataRes.message === 'OK' ? 'Ticket impreso.' : dataRes.message;
      responseCode = dataRes.message === 'PRINTER_NO_PAPER' ? '' : '00';
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
        timer: 4000, // El modal se cerrará después de 5 segundos
      });
    }
    // 3. Handle other cases
    else {

      Swal.fire({
        icon: 'warning',
        title: 'Solicitud no procesada.\n'+message,
        showConfirmButton: false,
        allowOutsideClick: false,
        timer: 4000,
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
      // didClose: () => resolve()
    });
  }
}

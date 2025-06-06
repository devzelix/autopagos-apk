import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { PrinterService } from 'src/app/services/printer-roccia/printer.service';
import { AdministrativeRequestService } from 'src/app/services/vposuniversal/administrative-request.service';
import { VposerrorsService } from 'src/app/services/vposuniversal/vposerrors.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-administrative-module',
  templateUrl: './administrative-module.component.html',
  styleUrls: ['./administrative-module.component.scss'],
})
export class AdministrativeModuleComponent implements OnInit {

  @Input() userData: string = '';
  @Output() showAnulationModal = new EventEmitter<boolean>();

  public ci_transaction: string = '';
  public numSeq_transaction: string = '';

  constructor(
    private _adminAction: AdministrativeRequestService,
    private _errorsvpos: VposerrorsService,
    private _printer: PrinterService,
  ) { }

  ngOnInit(): void {
  }

  public async administrativeMode(option: number){

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
        const macAddres: string = await this.getMacAddress();

        switch (option) {
          case 1:
            await this.pre_closeBox(macAddres)
            .then((_data) => {
              this.ShowDiologSuccess(_data);
            })
            .catch((err) => {
              this.ShowDiologError(err);
            });
            break;
          case 2:
            await this.closeBox(macAddres)
            .then((_data) => {
              this.ShowDiologSuccess(_data);
            })
            .catch((err) => {
              this.ShowDiologError(err);
            });
            break;
          case 3:
            await this.showAnulateTransactionModal(macAddres)
            .then((_data) => {
              this.ShowDiologSuccess(_data);
            })
            .catch((err) => {
              this.ShowDiologError(err);
            });
            break;
          default:
            // Opcional: Manejar valores inesperados
            console.warn(`Opción ${option} no reconocida`);
            break;
        }
      }
    });

  }

  public closeBox1() {
    // Emitir evento para cerrar la caja de administración
    alert("Acción aministrativa ejecutada");
  }

    /**
   * To pre-close box
   * @returns
   */
  public async pre_closeBox(macAddress: string) {

    try {

      console.log('in pre_closeBox');
      // let macAddress = '';

      // try {
      //   macAddress  = await this.getMacAddress();
      // } catch (error) {
      //   console.error(error)
      // }

      const responseJSON = await this._adminAction.pre_closeCashRegister(this.userData, macAddress);

      console.log('responseJSON', responseJSON);

      return responseJSON;

    } catch (error) {
      console.error(error)

      return `error: ${error}`;
    }

  }

  /**
   * To close box
   * @returns
   */
  public async closeBox(macAddress: string) {
    //Alerts to show message on all the process
    // Swal.fire({
    //   title: 'Success',
    //   text: 'The last voucher was printed successfully',
    //   icon: 'success',
    //   confirmButtonText: 'OK'
    // });

    try {

      console.log('in CloseBox');
      // let macAddress = '';

      // try {
      //   macAddress  = await this.getMacAddress();
      // } catch (error) {
      //   console.error(error)
      // }

      const responseJSON = await this._adminAction.closeCashRegister(this.userData, macAddress);

      console.log('responseJSON', responseJSON);

      return responseJSON;

    } catch (error) {
      console.error(error)

      return `error: ${error}`;
    }

  }

  /**
   * To show modal to anulate transaction
   * @returns ci, numSeq
   */
  public async showAnulateTransactionModal(): Promise<void | string> {
     this.showAnulationModal.emit(true);
    // try {

    //   Swal.fire({
    //     title: "Submit your Github username",
    //     input: "text",
    //     inputAttributes: {
    //       autocapitalize: "off"
    //     },
    //     showCancelButton: true,
    //     confirmButtonText: "Look up",
    //     showLoaderOnConfirm: true,
    //     preConfirm: async (login) => {
    //       try {
    //         const githubUrl = `
    //           https://api.github.com/users/${login}
    //         `;
    //         const response = await fetch(githubUrl);
    //         if (!response.ok) {
    //           return Swal.showValidationMessage(`
    //             ${JSON.stringify(await response.json())}
    //           `);
    //         }
    //         return response.json();
    //       } catch (error) {
    //         Swal.showValidationMessage(`
    //           Request failed: ${error}
    //         `);
    //       }
    //     },
    //     allowOutsideClick: () => !Swal.isLoading()
    //   }).then((result) => {
    //     if (result.isConfirmed) {
    //       Swal.fire({
    //         title: `${result.value.login}'s avatar`,
    //         imageUrl: result.value.avatar_url
    //       });
    //     }
    //   });

    // } catch (error) {
    //   console.error(error)

    //   return `error: ${error}`;
    // }
  }

  /**
   * To anulate transaction
   * @returns
   */
  public async anulateTransaction(macAddress: string) {
    //
    try {

      // console.log('in anulateTransaction');
      // let macAddress = '';

      // try {
      //   macAddress  = await this.getMacAddress();
      // } catch (error) {
      //   console.error(error)
      // }

      const responseJSON = await this._adminAction.anulationPayment(this.ci_transaction, this.numSeq_transaction, macAddress);

      console.log('responseJSON', responseJSON);

      return responseJSON;

    } catch (error) {
      console.error(error)

      return `error: ${error}`;
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

  private ShowDiologSuccess(dataRes: any){
    console.log('dataRes', dataRes);
    const responseCode = dataRes.data.datavpos.codRespuesta;
    const message = this._errorsvpos.getErrorMessage(responseCode);


    // 2. Handle success case (code '00')
    if (responseCode === '00') {
      // this.generarPDF().catch(console.error); // Generate PDF async

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

  private ShowDiologError(dataErr: any){
    // 4. Handle request errors
    let _messageError: string = 'Ha ocurrido un error.';
    let timeShow: number = 4000;

    // if (this.dni?.value === "90000000") {
    //   _messageError = 'Muestrele este error a un técnico \n Error: '+(error instanceof Error ? error.message : 'Desconocido');
    //   timeShow = 6000;
    // }

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

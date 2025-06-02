import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { PrinterService } from 'src/app/services/printer-roccia/printer.service';
import { AdministrativeRequestService } from 'src/app/services/vposuniversal/administrative-request.service';
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
    private _printer: PrinterService,
  ) { }

  ngOnInit(): void {
  }

  public closeBox1() {
    // Emitir evento para cerrar la caja de administración
    alert("Acción aministrativa ejecutada");
  }

  /**
   * To close box
   * @returns
   */
  public async closeBox() {
    //Alerts to show message on all the process
    // Swal.fire({
    //   title: 'Success',
    //   text: 'The last voucher was printed successfully',
    //   icon: 'success',
    //   confirmButtonText: 'OK'
    // });

    try {

    console.log('in CloseBox');
    let macAddress = '';

    try {
      macAddress  = await this.getMacAddress();
    } catch (error) {
      console.error(error)
    }

    const responseJSON = await this._adminAction.closeCashRegister(this.userData, macAddress);

    console.log('responseJSON', responseJSON);

    return responseJSON;

  } catch (error) {
    console.error(error)

    return `error: ${error}`;
  }

  }

  /**
   * To pre-close box
   * @returns
   */
  public async pre_closeBox() {
    //
    try {

    console.log('in pre_closeBox');
    let macAddress = '';

    try {
      macAddress  = await this.getMacAddress();
    } catch (error) {
      console.error(error)
    }

    const responseJSON = await this._adminAction.pre_closeCashRegister(this.userData, macAddress);

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
  public async anulateTransaction() {
    //
    try {

      console.log('in anulateTransaction');
      let macAddress = '';

      try {
        macAddress  = await this.getMacAddress();
      } catch (error) {
        console.error(error)
      }

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

}

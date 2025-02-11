import { Component, Input, OnInit } from '@angular/core';
import { PrinterService } from 'src/app/services/printer-roccia/printer.service';
import { AdministrativeRequestService } from 'src/app/services/vposuniversal/administrative-request.service';

@Component({
  selector: 'app-administrative-module',
  templateUrl: './administrative-module.component.html',
  styleUrls: ['./administrative-module.component.scss'],
})
export class AdministrativeModuleComponent implements OnInit {

  @Input() userData = '9000000';

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
    //
    try {

    console.log('in requestCard')
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
  }

  }

  /**
   * To pre-close box
   * @returns
   */
  public async pre_closeBox() {
    //
    try {

    console.log('in requestCard')
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
  }

  }

  /**
   * To print last voucher
   * @returns
   */
  public async printLastVoucher() {
    //
    try {

    console.log('in requestCard')
    let macAddress = '';

    try {
      macAddress  = await this.getMacAddress();
    } catch (error) {
      console.error(error)
    }

    const responseJSON = await this._adminAction.printLastVoucher(this.userData, macAddress);

    console.log('responseJSON', responseJSON);

    return responseJSON;

    } catch (error) {
    console.error(error)
    }

  }

  /**
   * To print last voucher Processed
   * @returns
   */
  public async printLastVoucherPcsd() {
    //
    try {

    console.log('in requestCard')
    let macAddress = '';

    try {
      macAddress  = await this.getMacAddress();
    } catch (error) {
      console.error(error)
    }

    const responseJSON = await this._adminAction.printLastVoucherP(this.userData, macAddress);

    console.log('responseJSON', responseJSON);

    return responseJSON;

    } catch (error) {
    console.error(error)
    }

  }

  /**
   * To re-print last voucher
   * @returns
   */
  public async re_printLastVoucher() {
    //
    try {

    console.log('in requestCard')
    let macAddress = '';

    try {
      macAddress  = await this.getMacAddress();
    } catch (error) {
      console.error(error)
    }

    const responseJSON = await this._adminAction.re_printLastCloseVoucher(this.userData, macAddress);

    console.log('responseJSON', responseJSON);

    return responseJSON;

    } catch (error) {
    console.error(error)
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
